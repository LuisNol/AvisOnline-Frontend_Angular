import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { HomeService } from '../../../services/home.service';
import { Category } from '../../../interfaces/category.interface';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados del componente
  isScrolled = false;
  isMobileMenuOpen = false;
  isSearchOpen = false;
  isLoading = false;
  
  // Datos de navegación
  categories: Category[] = [];
  
  // Búsqueda rápida
  searchQuery = '';
  searchLocation = '';
  selectedCategoryIds: number[] = []; // Cambiar a array para múltiples categorías
  
  // Estadísticas para mostrar
  stats = {
    totalAnnouncements: 0,
    totalUsers: 0
  };

  constructor(
    private homeService: HomeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadStats();
    this.listenToRouteChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 50;
  }

  /**
   * Escucha cambios en la ruta para mantener sincronizada la categoría seleccionada
   */
  private listenToRouteChanges(): void {
    // Solo escuchar query params cuando estemos en la página de anuncios
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        // Solo actualizar si estamos en la página de anuncios
        if (this.router.url.includes('/anuncios')) {
          console.log('🔄 Header detectó params en /anuncios:', params);
          if (params['category']) {
            const categoryId = parseInt(params['category']);
            if (!isNaN(categoryId)) {
              console.log('🏷️ Header seleccionando categoría ID:', categoryId);
              this.selectedCategoryIds = [categoryId];
            } else {
              this.selectedCategoryIds = [];
            }
          } else if (params['categorie_id']) {
            // Manejar múltiples categorías
            const categoryIds = Array.isArray(params['categorie_id']) 
              ? params['categorie_id'].map((id: string) => parseInt(id)).filter((id: number) => !isNaN(id))
              : [parseInt(params['categorie_id'])].filter((id: number) => !isNaN(id));
            this.selectedCategoryIds = categoryIds;
          } else {
            // Solo limpiar si no hay ningún parámetro de categoría
            this.selectedCategoryIds = [];
          }
          console.log('📂 Header - categorías seleccionadas:', this.selectedCategoryIds);
        } else {
          // Si no estamos en anuncios, limpiar la selección
          this.selectedCategoryIds = [];
        }
      });
  }

  /**
   * Carga categorías para el menú usando el mismo endpoint que los filtros
   */
  private loadCategories(): void {
    this.homeService.getFilterConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const categories = response?.categories?.data || response?.categories || [];
          // Mapear, ordenar por popularidad y tomar las 6 más populares para el menú
          this.categories = categories
            .filter((cat: any) => cat.state === 1) // Solo categorías activas
            .map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              icon: cat.icon || 'bi-tag',
              count: cat.products_count || 0,
              slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
              isActive: cat.state === 1
            }))
            .sort((a: any, b: any) => (b.count || 0) - (a.count || 0)) // Ordenar por cantidad (más populares primero)
            .slice(0, 6); // Solo las 6 más populares para el menú
            
                      console.log('📂 Header: Categorías cargadas desde filtros:', this.categories.length);
            console.log('🔍 Header: Categorías ordenadas por popularidad:', this.categories.map(c => `${c.name}: ${c.count} anuncios`));
        },
        error: (error: any) => {
          console.warn('No se pudieron cargar las categorías del menú:', error);
          this.loadMockCategories();
        }
      });
  }

  /**
   * Carga estadísticas básicas
   */
  private loadStats(): void {
    this.homeService.getHomeData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data?.stats) {
            this.stats = {
              totalAnnouncements: data.stats.total_announcements || 0,
              totalUsers: data.stats.total_users || 0
            };
          }
        },
        error: () => {
          // Estadísticas de ejemplo si no se pueden cargar
          this.stats = {
            totalAnnouncements: 1250,
            totalUsers: 850
          };
        }
      });
  }

  /**
   * Categorías de ejemplo como fallback
   */
  private loadMockCategories(): void {
    this.categories = [
      { id: 1, name: 'Vehículos', icon: 'bi bi-car-front', count: 0, slug: 'vehiculos', isActive: true },
      { id: 2, name: 'Inmuebles', icon: 'bi bi-house', count: 0, slug: 'inmuebles', isActive: true },
      { id: 3, name: 'Electrónicos', icon: 'bi bi-laptop', count: 0, slug: 'electronicos', isActive: true },
      { id: 4, name: 'Hogar', icon: 'bi bi-house-gear', count: 0, slug: 'hogar', isActive: true },
      { id: 5, name: 'Moda', icon: 'bi bi-bag', count: 0, slug: 'moda', isActive: true },
      { id: 6, name: 'Servicios', icon: 'bi bi-tools', count: 0, slug: 'servicios', isActive: true }
    ];
  }

  /**
   * Maneja la búsqueda rápida (ahora incluye categorías seleccionadas)
   */
  onQuickSearch(): void {
    if (!this.searchQuery.trim() && this.selectedCategoryIds.length === 0) {
      return;
    }
    
    const queryParams: any = {};
    
    // Incluir texto de búsqueda si existe
    if (this.searchQuery.trim()) {
      queryParams.search = this.searchQuery.trim();
    }
    
    // Incluir ubicación si existe
    if (this.searchLocation.trim()) {
      queryParams.location = this.searchLocation.trim();
    }
    
    // Incluir categorías seleccionadas si existen
    if (this.selectedCategoryIds.length > 0) {
      if (this.selectedCategoryIds.length === 1) {
        queryParams.category = this.selectedCategoryIds[0];
        // Incluir nombre de categoría para mejor UX
        const selectedCategory = this.categories.find(cat => cat.id === this.selectedCategoryIds[0]);
        if (selectedCategory) {
          queryParams.categoryName = selectedCategory.name;
        }
      } else {
        // Múltiples categorías
        queryParams.categorie_id = this.selectedCategoryIds;
        const selectedNames = this.categories
          .filter(cat => this.selectedCategoryIds.includes(cat.id))
          .map(cat => cat.name);
        queryParams.categoryNames = selectedNames.join(', ');
      }
    }
    
    console.log('🔍 Búsqueda con parámetros:', queryParams);
    
    this.router.navigate(['/anuncios'], { queryParams });
    this.closeSearch(); // Cerrar el buscador después de buscar
  }

  /**
   * Navega directamente a una categoría específica (desde menú principal, no desde buscador)
   */
  navigateToCategory(category: Category): void {
    console.log('🏷️ Navegación directa a categoría:', category.name);
    this.router.navigate(['/anuncios'], { 
      queryParams: { 
        category: category.id,
        categoryName: category.name,
        filter: 'category'
      } 
    });
    this.closeMobileMenu();
    // NO cerrar el buscador aquí, solo se usa para navegación directa desde menú
  }

  /**
   * Selecciona/deselecciona una categoría en el buscador (NO navega inmediatamente)
   */
  toggleCategorySelection(category: Category): void {
    const index = this.selectedCategoryIds.indexOf(category.id);
    if (index > -1) {
      // Si ya está seleccionada, deseleccionar
      this.selectedCategoryIds.splice(index, 1);
      console.log('❌ Categoría deseleccionada:', category.name);
    } else {
      // Seleccionar nueva categoría
      this.selectedCategoryIds.push(category.id);
      console.log('✅ Categoría seleccionada:', category.name);
    }
    console.log('📂 Categorías actualmente seleccionadas:', this.getSelectedCategoryNames());
    
    // NO navegar aquí, solo actualizar la selección
    // La navegación ocurre cuando el usuario hace clic en "Buscar Anuncios"
  }

  /**
   * Limpia todas las categorías seleccionadas
   */
  clearCategorySelection(): void {
    this.selectedCategoryIds = [];
  }

  /**
   * Verifica si una categoría está seleccionada
   */
  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  /**
   * Obtiene los nombres de las categorías seleccionadas
   */
  getSelectedCategoryNames(): string[] {
    return this.categories
      .filter(cat => this.selectedCategoryIds.includes(cat.id))
      .map(cat => cat.name);
  }

  /**
   * Obtiene una categoría por su ID
   */
  getCategoryById(categoryId: number): Category | undefined {
    return this.categories.find(cat => cat.id === categoryId);
  }

  /**
   * Obtiene el icono de una categoría por su ID
   */
  getCategoryIcon(categoryId: number): string {
    const category = this.getCategoryById(categoryId);
    return category?.icon || 'bi bi-tag';
  }

  /**
   * Obtiene el nombre de una categoría por su ID
   */
  getCategoryName(categoryId: number): string {
    const category = this.getCategoryById(categoryId);
    return category?.name || 'Categoría';
  }

  /**
   * Remueve una categoría específica por ID
   */
  removeCategoryById(categoryId: number): void {
    const category = this.getCategoryById(categoryId);
    if (category) {
      this.toggleCategorySelection(category);
    }
  }

  /**
   * Navega a publicar anuncio (panel admin)
   */
  navigateToPublish(): void {
    window.open('https://www.admin.avisonline.store', '_blank');
  }

  /**
   * Abre/cierra menú móvil
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Prevenir scroll del body cuando el menú está abierto
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Cierra menú móvil
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  /**
   * Abre/cierra búsqueda
   */
  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    
    // Focus en el input cuando se abre
    if (this.isSearchOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  /**
   * Cierra búsqueda y limpia campos
   */
  closeSearch(): void {
    this.isSearchOpen = false;
    this.searchQuery = '';
    this.searchLocation = '';
    this.selectedCategoryIds = []; // Limpiar categorías al cerrar
  }

  /**
   * Maneja teclas en el buscador
   */
  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onQuickSearch();
    } else if (event.key === 'Escape') {
      this.closeSearch();
    }
  }

  /**
   * Formatea números para mostrar
   */
  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
} 