import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize, debounceTime } from 'rxjs';

import { AnnouncementsFilterComponent, FilterOptions, FilterOptionsWithCategoryName } from '../announcements-filter/announcements-filter.component';
import { HomeService, SearchResponse } from '../../../services/home.service';
import { Announcement, AnnouncementFilters } from '../../../interfaces/announcement.interface';
import { Category } from '../../../interfaces/category.interface';
import { ApiResponse, PaginationMeta } from '../../../interfaces/api.interface';

@Component({
  selector: 'app-announcements-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AnnouncementsFilterComponent],
  templateUrl: './announcements-list.component.html',
  styleUrls: ['./announcements-list.component.scss']
})
export class AnnouncementsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private filterSubject$ = new Subject<FilterOptions>();

  // Estados del componente
  isLoading = false;
  isConnected = false;
  error: string | null = null;
  noResults = false;

  // Datos
  announcements: Announcement[] = [];
  totalAnnouncements = 0;
  
  // Paginación
  currentPage = 1;
  lastPage = 1;
  perPage = 12;
  
  // Vista y filtros
  viewMode: 'grid' | 'list' = 'grid';
  currentFilters: FilterOptions = {
    search: '',
    categorie_id: [],
    min_price: null,
    max_price: null,
    location: '',
    sort_by: 'recent'
  };

  // Meta información
  loadingMessage = 'Cargando anuncios...';
  resultsSummary = '';
  activeCategoryNames: string[] = [];

  // Referencia al componente de filtros
  @ViewChild(AnnouncementsFilterComponent) filterComponent!: AnnouncementsFilterComponent;

  constructor(
    private homeService: HomeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkForInitialFilters();
    this.setupFilterDebounce();
  }

  ngAfterViewInit(): void {
    // El ViewChild ya está disponible aquí
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Verifica si hay filtros iniciales desde query parameters (navegación desde home)
   */
  private checkForInitialFilters(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        console.log('🔍 Query params recibidos:', params);
        
        // Limpiar filtros previos
        this.currentFilters = {
          search: '',
          categorie_id: [],
          min_price: null,
          max_price: null,
          location: '',
          sort_by: 'recent'
        };
        this.activeCategoryNames = [];

        // Aplicar filtro de categoría si está presente
        if (params['category']) {
          const categoryId = parseInt(params['category']);
          if (!isNaN(categoryId)) {
            this.currentFilters.categorie_id = [categoryId];
          
          // Guardar nombre de categoría activa desde parámetros
          if (params['categoryName']) {
            this.activeCategoryNames = [params['categoryName']];
            this.loadingMessage = `Cargando anuncios de "${params['categoryName']}"...`;
          }
          
            console.log('🏷️ Filtro de categoría única aplicado:', {
            categoryIds: this.currentFilters.categorie_id,
            categoryNames: this.activeCategoryNames
          });
          }
        } 
        // Manejar múltiples categorías
        else if (params['categorie_id']) {
          let categoryIds: number[] = [];
          
          if (Array.isArray(params['categorie_id'])) {
            categoryIds = params['categorie_id'].map((id: string) => parseInt(id)).filter((id: number) => !isNaN(id));
          } else if (typeof params['categorie_id'] === 'string') {
            const parsed = parseInt(params['categorie_id']);
            if (!isNaN(parsed)) {
              categoryIds = [parsed];
            }
          }
          
          if (categoryIds.length > 0) {
            this.currentFilters.categorie_id = categoryIds;
            
            // Guardar nombres de categorías si están disponibles
            if (params['categoryNames']) {
              this.activeCategoryNames = params['categoryNames'].split(', ');
              this.loadingMessage = `Cargando anuncios de "${params['categoryNames']}"...`;
            }
            
            console.log('🏷️ Filtro de múltiples categorías aplicado:', {
              categoryIds: this.currentFilters.categorie_id,
              categoryNames: this.activeCategoryNames
            });
          }
        }

        // Aplicar otros filtros si existen
        if (params['search']) {
          this.currentFilters.search = params['search'];
          console.log('🔍 Filtro de búsqueda aplicado:', params['search']);
        }
        
        if (params['location']) {
          this.currentFilters.location = params['location'];
          console.log('📍 Filtro de ubicación aplicado:', params['location']);
        }

        // Aplicar ordenamiento si existe
        if (params['sort_by']) {
          this.currentFilters.sort_by = params['sort_by'];
          console.log('📊 Ordenamiento aplicado:', params['sort_by']);
        }

        console.log('🎯 Filtros finales aplicados:', this.currentFilters);

        // Cargar anuncios después de aplicar todos los filtros
        this.loadAnnouncements();
      });
  }

  /**
   * Carga anuncios desde el backend usando filtros avanzados
   * POST /api/ecommerce/filter-advance-product
   */
  public loadAnnouncements(): void {
    this.isLoading = true;
    this.error = null;
    this.noResults = false;
    this.updateLoadingMessage();

    // Preparar parámetros para el backend
    const searchParams = {
      ...this.currentFilters,
      page: this.currentPage
    };

    // Limpiar parámetros vacíos y convertir null a undefined
    const cleanParams: any = {};
    Object.keys(searchParams).forEach(key => {
      const value = (searchParams as any)[key];
      if (value !== null && value !== '') {
        // Manejar array de categorías especialmente
        if (key === 'categorie_id' && Array.isArray(value) && value.length > 0) {
          cleanParams[key] = value;
        } else if (key !== 'categorie_id') {
          cleanParams[key] = value;
        }
      }
    });

    this.homeService.searchProducts(cleanParams)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: SearchResponse) => {
          // Procesar respuesta del backend
          this.processAnnouncementsResponse(response);
          this.isConnected = true;
        },
        error: (error) => {
          this.isConnected = false;
          this.handleLoadingError(error);
        }
      });
  }

  /**
   * Procesa la respuesta de anuncios del backend
   */
  private processAnnouncementsResponse(response: SearchResponse): void {
    // Extraer datos de productos
    const products = (response.products as any)?.data || response.products;

    if (products && Array.isArray(products)) {
      this.announcements = products.map(this.mapBackendProductToAnnouncement);
    } else {
      this.announcements = [];
    }

    // Actualizar información de paginación
    this.totalAnnouncements = response.total || 0;
    this.currentPage = response.current_page || 1;
    this.lastPage = response.last_page || 1;
    this.perPage = response.per_page || 12;

    // Verificar si no hay resultados
    this.noResults = this.announcements.length === 0;

    // Actualizar resumen de resultados
    this.updateResultsSummary();
  }

  /**
   * Mapea producto del backend a interfaz Announcement
   */
  private mapBackendProductToAnnouncement = (product: any): Announcement => {
    const mappedImage = this.getProductImage(product);
    
    return {
      id: product.id,
      title: product.title || product.name || 'Sin título',
      description: product.description || 'Sin descripción disponible',
      price: parseFloat(product.price_pen) || 0,
      location: product.location || 'Ubicación no especificada',
      category: product.categorie_first?.name || 'Sin categoría',
      categoryId: product.categorie_first_id || 0,
      image: mappedImage,
      featured: product.featured || false,
      views: product.views_count || 0,
      created_at: product.created_at || new Date().toISOString(),
      seller: {
        id: product.user?.id || 0,
        name: product.user?.name || 'Usuario anónimo',
        memberSince: product.user?.created_at || new Date().toISOString()
      },
      slug: product.slug
    };
  };

  /**
   * Obtiene la imagen principal del producto
   */
  private getProductImage(product: any): string {
    if (product.imagen) return product.imagen;
    if (product.image_url) return product.image_url;
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) {
      return product.images[0].imagen || product.images[0].url || product.images[0];
    }
    
    return 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Sin+Imagen';
  }

  /**
   * Maneja errores de carga
   */
  private handleLoadingError(error: any): void {
    if (error.status === 0) {
      this.error = 'No se puede conectar con el servidor. ¿Está Laravel corriendo en http://localhost:8000?';
      this.loadMockAnnouncements();
    } else if (error.status === 404) {
      this.error = 'Endpoint de búsqueda no encontrado. Verificar rutas del backend.';
      this.loadMockAnnouncements();
    } else if (error.status === 500) {
      this.error = 'Error interno del servidor. Revisar logs de Laravel.';
      this.loadMockAnnouncements();
    } else {
      this.error = `Error del servidor: ${error.status} - ${error.statusText}`;
      this.loadMockAnnouncements();
    }
  }

  /**
   * Carga anuncios de ejemplo como fallback
   */
  private loadMockAnnouncements(): void {
    this.announcements = [
      {
        id: 1,
        title: 'Apartamento céntrico con vistas panorámicas',
        description: 'Hermoso apartamento de 2 habitaciones en el centro de la ciudad con increíbles vistas panorámicas. Completamente renovado y amueblado.',
        price: 850,
        location: 'Tingo María Centro',
        category: 'Inmuebles',
        categoryId: 1,
        image: 'https://via.placeholder.com/400x300/e3f2fd/1976d2?text=🏠+Apartamento',
        featured: true,
        views: 245,
        created_at: new Date(Date.now() - 86400000).toISOString(), // Ayer
        seller: {
          id: 1,
          name: 'Ana García',
          memberSince: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        slug: 'apartamento-centrico-tingo-maria'
      },
      {
        id: 2,
        title: 'iPhone 14 Pro como nuevo',
        description: 'iPhone 14 Pro de 128GB en perfecto estado, con todos los accesorios originales. Protector de pantalla y funda incluidos.',
        price: 950,
        location: 'Castillo Grande',
        category: 'Electrónicos',
        categoryId: 3,
        image: 'https://via.placeholder.com/400x300/f3e5f5/7b1fa2?text=📱+iPhone',
        featured: false,
        views: 189,
        created_at: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
        seller: {
          id: 2,
          name: 'Carlos López',
          memberSince: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
        },
        slug: 'iphone-14-pro-128gb'
      },
      {
        id: 3,
        title: 'Bicicleta de montaña Trek X-Caliber',
        description: 'Bicicleta Trek X-Caliber de montaña, talla M, perfecta para rutas y aventuras. Muy poco uso, prácticamente nueva.',
        price: 450,
        location: 'Valencia',
        category: 'Deportes',
        categoryId: 6,
        image: 'https://via.placeholder.com/400x300/fff8e1/fbc02d?text=🚴+Bicicleta',
        featured: false,
        views: 156,
        created_at: new Date(Date.now() - 259200000).toISOString(), // Hace 3 días
        seller: {
          id: 3,
          name: 'Miguel Ruiz',
          memberSince: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
        },
        slug: 'bicicleta-trek-montana'
      },
      {
        id: 4,
        title: 'Sofá de diseño italiano',
        description: 'Elegante sofá de 3 plazas de diseño italiano, tapizado en cuero genuino. Perfecto estado, muy cómodo.',
        price: 680,
        location: 'Sevilla',
        category: 'Hogar',
        categoryId: 4,
        image: 'https://via.placeholder.com/400x300/e8f5e8/388e3c?text=🛋️+Sofá',
        featured: true,
        views: 203,
        created_at: new Date(Date.now() - 345600000).toISOString(), // Hace 4 días
        seller: {
          id: 4,
          name: 'Laura Martín',
          memberSince: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
        },
        slug: 'sofa-diseno-italiano'
      }
    ];

    this.totalAnnouncements = 4;
    this.currentPage = 1;
    this.lastPage = 1;
    this.perPage = 12;
    this.noResults = false;
    this.updateResultsSummary();
  }

  /**
   * Actualiza el mensaje de carga
   */
  private updateLoadingMessage(): void {
    const messages = [
      'Buscando anuncios perfectos para ti...',
      'Conectando con el servidor...',
      'Aplicando filtros avanzados...',
      'Cargando resultados...'
    ];
    this.loadingMessage = messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Actualiza el resumen de resultados
   */
  private updateResultsSummary(): void {
    if (this.noResults) {
      this.resultsSummary = 'No se encontraron anuncios que coincidan con tus filtros';
    } else if (this.totalAnnouncements === 1) {
      this.resultsSummary = '1 anuncio encontrado';
    } else {
      const start = ((this.currentPage - 1) * this.perPage) + 1;
      const end = Math.min(this.currentPage * this.perPage, this.totalAnnouncements);
      this.resultsSummary = `Mostrando ${start}-${end} de ${this.totalAnnouncements} anuncios`;
    }
  }

  /**
   * Maneja cambios en tiempo real de filtros
   */
  onFiltersChanged(filters: FilterOptionsWithCategoryName): void {
    this.currentFilters = { ...filters };
    // Actualizar nombre de categoría activa directamente desde el evento
    this.activeCategoryNames = filters.categoryNames || [];
    // Usar subject para debounce
    this.filterSubject$.next(this.currentFilters);
  }

  /**
   * Maneja aplicación de filtros (botón buscar)
   */
  onFiltersApplied(filters: FilterOptionsWithCategoryName): void {
    this.currentFilters = { ...filters };
    // Actualizar nombre de categoría activa directamente desde el evento
    this.activeCategoryNames = filters.categoryNames || [];
    this.currentPage = 1;
    this.scrollToTop(); // Scroll hacia arriba al aplicar filtros
    this.loadAnnouncements();
  }

  /**
   * Cambia modo de vista
   */
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  /**
   * Navega a una página específica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage && page !== this.currentPage) {
      this.currentPage = page;
      this.loadAnnouncements();
      
      // Scroll hacia arriba de la página
      this.scrollToTop();
    }
  }

  /**
   * Obtiene array de páginas para paginación
   */
  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPages = 7; // Máximo de páginas a mostrar
    
    if (this.lastPage <= maxPages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Lógica compleja para páginas con ...
      const start = Math.max(1, this.currentPage - 3);
      const end = Math.min(this.lastPage, this.currentPage + 3);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push(-1); // -1 representa "..."
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < this.lastPage) {
        if (end < this.lastPage - 1) pages.push(-1); // -1 representa "..."
        pages.push(this.lastPage);
      }
    }
    
    return pages;
  }

  /**
   * Navega al detalle del anuncio
   */
  viewAnnouncementDetail(announcement: Announcement): void {
    // Navegar usando slug si existe, sino usar ID
    if (announcement.slug) {
      this.router.navigate(['/anuncio', announcement.slug]);
    } else {
      this.router.navigate(['/anuncio', announcement.id]);
    }
  }

  /**
   * Obtiene información de paginación legible
   */
  getPaginationInfo(): string {
    return this.resultsSummary;
  }

  /**
   * Obtiene tiempo relativo desde la creación
   */
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  }

  /**
   * Formatea precio con símbolo de sol peruano
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  /**
   * Maneja errores de carga de imagen
   */
  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Sin+Imagen';
    img.classList.add('loaded');
  }

  /**
   * Maneja carga exitosa de imagen
   */
  onImageLoad(event: any): void {
    const img = event.target as HTMLImageElement;
    img.classList.add('loaded');
  }

  /**
   * Obtiene imagen con fallback para el template
   */
  getImageWithFallback(imageUrl: string | undefined): string {
    if (!imageUrl) {
      return 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Sin+Imagen';
    }
    return imageUrl;
  }

  /**
   * TrackBy functions para optimización
   */
  trackByAnnouncement(index: number, announcement: Announcement): number {
    return announcement.id;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }

  /**
   * Limpia el filtro de categoría activa
   */
  clearCategoryFilter(): void {
    // Resetear filtros locales
    this.currentFilters.categorie_id = [];
    this.activeCategoryNames = [];
    this.currentPage = 1;
    
    // Actualizar también los filtros en el componente de filtros si está disponible
    if (this.filterComponent) {
      this.filterComponent.resetCategoryFilter();
    } else {
      // Si el ViewChild no está disponible, intentar después de un breve delay
      setTimeout(() => {
        if (this.filterComponent) {
          this.filterComponent.resetCategoryFilter();
        }
      }, 100);
    }
    
    // Actualizar URL para remover parámetros de categoría
    this.router.navigate(['/anuncios'], { 
      queryParams: {},
      replaceUrl: true 
    });
    
    // Scroll hacia arriba y recargar anuncios
    this.scrollToTop();
    this.loadAnnouncements();
  }

  /**
   * Verifica si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return !!(
      this.currentFilters.search ||
      (this.currentFilters.categorie_id && this.currentFilters.categorie_id.length > 0) ||
      this.currentFilters.location ||
      this.currentFilters.min_price ||
      this.currentFilters.max_price
    );
  }

  /**
   * Hace scroll hacia arriba de la página
   */
  private scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }

  private setupFilterDebounce(): void {
    // Configurar debounce para filtros en tiempo real
    this.filterSubject$
      .pipe(
        debounceTime(500), // Esperar 500ms después del último cambio
        takeUntil(this.destroy$)
      )
      .subscribe(filters => {
        this.currentPage = 1; // Reset page on filter change
        this.loadAnnouncements();
      });
  }
} 