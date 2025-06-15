import { Component, OnInit, Output, EventEmitter, OnDestroy, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { HomeService } from '../../../services/home.service';
import { DOCUMENT } from '@angular/common';

export interface FilterOptions {
  search: string;
  categorie_id: number[] | null;
  min_price: number | null;
  max_price: number | null;
  location: string;
  sort_by: 'recent' | 'price_asc' | 'price_desc' | 'popular';
}

export interface FilterOptionsWithCategoryName extends FilterOptions {
  categoryNames?: string[];
}

export interface Category {
  id: number;
  name: string;
  products_count: number;
  icon?: string;
  state: number;
}

export interface PriceRange {
  min_price: number;
  max_price: number;
}

export interface FilterConfig {
  categories: Category[];
  price_range: PriceRange;
  locations: string[];
}

@Component({
  selector: 'app-announcements-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcements-filter.component.html',
  styleUrls: ['./announcements-filter.component.scss']
})
export class AnnouncementsFilterComponent implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject<void>();

  @Input() initialFilters?: FilterOptions;
  @Output() filtersChanged = new EventEmitter<FilterOptionsWithCategoryName>();
  @Output() filtersApplied = new EventEmitter<FilterOptionsWithCategoryName>();

  // Estados del componente
  isLoading = false;
  isConnected = false;
  error: string | null = null;
  isSidebarOpen = false;
  showAdvancedFilters = false;

  // Configuración del filtro
  filterConfig: FilterConfig = {
    categories: [],
    price_range: { min_price: 0, max_price: 10000 },
    locations: []
  };

  // Filtros actuales
  filters: FilterOptions = {
    search: '',
    categorie_id: null,
    min_price: null,
    max_price: null,
    location: '',
    sort_by: 'recent'
  };

  // Opciones de ordenamiento
  sortOptions = [
    { value: 'recent', label: 'Más recientes', icon: 'bi-clock' },
    { value: 'popular', label: 'Más vistos', icon: 'bi-eye' },
    { value: 'price_asc', label: 'Precio: menor a mayor', icon: 'bi-sort-numeric-up' },
    { value: 'price_desc', label: 'Precio: mayor a menor', icon: 'bi-sort-numeric-down' }
  ];

  constructor(
    private homeService: HomeService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.loadFilterConfig();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters'] && changes['initialFilters'].currentValue) {
      const newFilters = changes['initialFilters'].currentValue;
      console.log('🔄 Aplicando filtros iniciales:', newFilters);
      
      // Aplicar los filtros iniciales
      this.filters = {
        search: newFilters.search || '',
        categorie_id: newFilters.categorie_id || null,
        min_price: newFilters.min_price || null,
        max_price: newFilters.max_price || null,
        location: newFilters.location || '',
        sort_by: newFilters.sort_by || 'recent'
      };
      
      console.log('✅ Filtros aplicados en componente de filtros - categorías:', this.filters.categorie_id);
      
      // No emitir eventos aquí para evitar loops infinitos
      console.log('✅ Filtros iniciales aplicados al componente de filtros');
    }
  }

  /**
   * Carga la configuración para filtros avanzados desde el backend
   * GET /api/ecommerce/config-filter-advance
   */
  private loadFilterConfig(): void {
    this.isLoading = true;
    this.error = null;

    console.log('🚀 Cargando configuración de filtros desde el backend...');

    this.homeService.getFilterConfig()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (config: any) => {
          console.log('✅ Configuración de filtros recibida:', config);
          
          // Procesar categorías
          const categories = (config.categories as any)?.data || config.categories;
          if (categories && Array.isArray(categories)) {
            this.filterConfig.categories = categories.map(cat => ({
              id: cat.id,
              name: cat.name,
              products_count: cat.products_count || 0,
              icon: this.mapBackendIconToBootstrap(cat.icon),
              state: cat.state
            }));
          }

          // Procesar rango de precios
          if (config.price_range) {
            this.filterConfig.price_range = {
              min_price: config.price_range.min_price || 0,
              max_price: config.price_range.max_price || 10000
            };
          }

          // Procesar ubicaciones
          if (config.locations && Array.isArray(config.locations)) {
            this.filterConfig.locations = config.locations;
          }

          this.isConnected = true;
          console.log('📂 Configuración de filtros cargada exitosamente');
        },
        error: (error) => {
          console.error('❌ Error cargando configuración de filtros:', error);
          this.isConnected = false;
          
          if (error.status === 0) {
            this.error = 'No se puede conectar con el servidor. ¿Está Laravel corriendo?';
          } else if (error.status === 404) {
            this.error = 'Endpoint de filtros no encontrado. Verificar rutas del backend.';
          } else if (error.status === 500) {
            this.error = 'Error interno del servidor. Revisar logs de Laravel.';
          } else {
            this.error = `Error del servidor: ${error.status} - ${error.statusText}`;
          }

          // Cargar configuración de ejemplo como fallback
          this.loadMockFilterConfig();
        }
      });
  }

  /**
   * Configuración de ejemplo como fallback
   */
  private loadMockFilterConfig(): void {
    this.filterConfig = {
      categories: [
        { id: 1, name: 'Inmuebles', products_count: 125, icon: 'bi-house-fill', state: 1 },
        { id: 2, name: 'Vehículos', products_count: 89, icon: 'bi-car-front-fill', state: 1 },
        { id: 3, name: 'Electrónicos', products_count: 67, icon: 'bi-laptop', state: 1 },
        { id: 4, name: 'Hogar', products_count: 54, icon: 'bi-house-gear-fill', state: 1 },
        { id: 5, name: 'Deportes', products_count: 43, icon: 'bi-trophy-fill', state: 1 },
        { id: 6, name: 'Moda', products_count: 32, icon: 'bi-bag-fill', state: 1 },
        { id: 7, name: 'Servicios', products_count: 76, icon: 'bi-tools', state: 1 },
        { id: 8, name: 'Mascotas', products_count: 28, icon: 'bi-heart-fill', state: 1 }
      ],
      price_range: { min_price: 0, max_price: 5000 },
      locations: ['Tingo María', 'Rupa Rupa', 'Castillo Grande', 'Supte San Jorge', 'Pueblo Nuevo', 'Las Palmas', 'Pendencia']
    };
    console.log('📂 Configuración de filtros de ejemplo cargada como fallback');
  }

  /**
   * Mapea iconos del backend a Bootstrap Icons
   */
  private mapBackendIconToBootstrap(backendIcon: string): string {
    const iconMap: { [key: string]: string } = {
      'fas fa-home': 'bi-house-fill',
      'fas fa-couch': 'bi-house-gear-fill',
      'fas fa-football-ball': 'bi-trophy-fill',
      'fas fa-tools': 'bi-tools',
      'fas fa-paw': 'bi-heart-fill',
      'fas fa-briefcase': 'bi-briefcase-fill',
      'fas fa-laptop': 'bi-laptop',
      'fas fa-car': 'bi-car-front-fill',
      'fas fa-tshirt': 'bi-bag-fill'
    };
    
    return iconMap[backendIcon] || 'bi-grid';
  }

  /**
   * Maneja cambios en los filtros y emite eventos
   */
  onFilterChange(): void {
    console.log('🔍 Filtros modificados:', this.filters);
    const filtersWithCategoryName: FilterOptionsWithCategoryName = {
      ...this.filters,
      categoryNames: this.filters.categorie_id ? this.getCategoryNames(this.filters.categorie_id) : undefined
    };
    this.filtersChanged.emit(filtersWithCategoryName);
  }

  /**
   * Aplica los filtros y emite evento
   */
  applyFilters(): void {
    console.log('✅ Aplicando filtros:', this.filters);
    const filtersWithCategoryName: FilterOptionsWithCategoryName = {
      ...this.filters,
      categoryNames: this.filters.categorie_id ? this.getCategoryNames(this.filters.categorie_id) : undefined
    };
    this.filtersApplied.emit(filtersWithCategoryName);
  }

  /**
   * Resetea todos los filtros
   */
  resetFilters(): void {
    this.filters = {
      search: '',
      categorie_id: null,
      min_price: null,
      max_price: null,
      location: '',
      sort_by: 'recent'
    };
    console.log('🔄 Filtros reseteados');
    this.onFilterChange();
    this.applyFilters();
  }

  /**
   * Selecciona/deselecciona una categoría específica (permite múltiples)
   */
  selectCategory(categoryId: number): void {
    if (!this.filters.categorie_id) {
      this.filters.categorie_id = [];
    }
    
    const index = this.filters.categorie_id.indexOf(categoryId);
    if (index > -1) {
      // Si ya está seleccionada, la removemos
      this.filters.categorie_id.splice(index, 1);
    } else {
      // Si no está seleccionada, la agregamos
      this.filters.categorie_id.push(categoryId);
    }
    
    // Si no hay categorías seleccionadas, establecer como null
    if (this.filters.categorie_id.length === 0) {
      this.filters.categorie_id = null;
    }
    
    this.onFilterChange();
  }

  /**
   * Verifica si una categoría está seleccionada
   */
  isCategorySelected(categoryId: number): boolean {
    return this.filters.categorie_id ? this.filters.categorie_id.includes(categoryId) : false;
  }

  /**
   * Obtiene los nombres de múltiples categorías por sus IDs
   */
  getCategoryNames(categoryIds: number[]): string[] {
    return categoryIds.map(id => {
      const category = this.filterConfig.categories.find(cat => cat.id === id);
      return category ? category.name : 'Categoría desconocida';
    });
  }

  /**
   * Obtiene el nombre de una categoría por su ID (mantener compatibilidad)
   */
  getCategoryName(categoryId: number): string {
    const category = this.filterConfig.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoría desconocida';
  }

  /**
   * Obtiene la etiqueta del ordenamiento actual
   */
  getCurrentSortLabel(): string {
    const currentSort = this.sortOptions.find(option => option.value === this.filters.sort_by);
    return currentSort ? currentSort.label : 'Más recientes';
  }

  /**
   * Obtiene el icono del ordenamiento actual
   */
  getCurrentSortIcon(): string {
    const currentSort = this.sortOptions.find(option => option.value === this.filters.sort_by);
    return currentSort ? currentSort.icon : 'bi-clock';
  }

  /**
   * Abre el sidebar de filtros
   */
  openSidebar(): void {
    this.isSidebarOpen = true;
    // Agregar clase al body para mover el widget de WhatsApp
    this.document.body.classList.add('sidebar-open');
    console.log('📱 Sidebar abierto - Widget WhatsApp reposicionado');
  }

  /**
   * Alterna la visibilidad de filtros avanzados (sidebar)
   */
  toggleAdvancedFilters(): void {
    if (this.isSidebarOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
    this.showAdvancedFilters = this.isSidebarOpen;
  }

  /**
   * Cierra el sidebar de filtros
   */
  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.showAdvancedFilters = false;
    // Remover clase del body para restaurar posición del widget
    this.document.body.classList.remove('sidebar-open');
    console.log('📱 Sidebar cerrado - Widget WhatsApp restaurado');
  }

  /**
   * Aplica filtros y cierra el sidebar
   */
  applyAndCloseSidebar(): void {
    this.applyFilters();
    this.closeSidebar();
  }

  /**
   * Obtiene el número total de filtros activos
   */
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filters.search) count++;
    if (this.filters.categorie_id && this.filters.categorie_id.length > 0) count++;
    if (this.filters.min_price || this.filters.max_price) count++;
    if (this.filters.location) count++;
    if (this.filters.sort_by !== 'recent') count++;
    return count;
  }

  /**
   * Verifica si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return this.getActiveFiltersCount() > 0;
  }

  /**
   * Verifica si hay filtros avanzados activos (categoría y precio)
   */
  hasAdvancedFilters(): boolean {
    return !!((this.filters.categorie_id && this.filters.categorie_id.length > 0) || this.filters.min_price || this.filters.max_price);
  }

  /**
   * Obtiene el número de filtros avanzados activos
   */
  getAdvancedFiltersCount(): number {
    let count = 0;
    if (this.filters.categorie_id && this.filters.categorie_id.length > 0) count++;
    if (this.filters.min_price || this.filters.max_price) count++;
    return count;
  }

  /**
   * Resetea solo los filtros avanzados (categoría y precio)
   */
  resetAdvancedFilters(): void {
    this.filters.categorie_id = null;
    this.filters.min_price = null;
    this.filters.max_price = null;
    this.onFilterChange();
  }

  /**
   * Establece un rango de precio predefinido
   */
  setPriceRange(minPrice: number | null, maxPrice: number | null): void {
    this.filters.min_price = minPrice;
    this.filters.max_price = maxPrice;
    this.onFilterChange();
  }

  /**
   * Verifica si un rango de precio está activo
   */
  isPriceRangeActive(minPrice: number | null, maxPrice: number | null): boolean {
    return this.filters.min_price === minPrice && this.filters.max_price === maxPrice;
  }

  /**
   * TrackBy function para optimizar la renderización de categorías
   */
  trackByCategory(index: number, category: Category): number {
    return category.id;
  }

  /**
   * Resetea solo el filtro de categoría (método público para ser llamado desde el componente padre)
   */
  public resetCategoryFilter(): void {
    this.filters.categorie_id = null;
    this.onFilterChange();
  }
} 