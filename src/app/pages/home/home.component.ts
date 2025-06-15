import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { HomeService, HomeData } from '../../services/home.service';
import { Announcement } from '../../interfaces/announcement.interface';
import { Category } from '../../interfaces/category.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Loading states
  isLoadingCategories = false;
  isLoadingAnnouncements = false;
  
  // Error states
  categoriesError: string | null = null;
  announcementsError: string | null = null;
  
  // Data
  categories: Category[] = [];
  topCategories: Category[] = []; // Solo las 4 con más anuncios
  remainingCategories: Category[] = []; // Categorías restantes (más pequeñas)
  showAllCategories = false; // Controla si se muestran todas las categorías
  recentAnnouncements: Announcement[] = [];
  popularAnnouncements: Announcement[] = [];
  
  // Control de vista actual
  currentAnnouncementView: 'recent' | 'popular' = 'recent';
  
  // Stats
  stats = {
    total_announcements:0,
    total_users: 0,
    satisfaction: 95,
    support: '24/7'
  };

  constructor(
    private homeService: HomeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.loadHomeData();
  }

  private loadHomeData(): void {
    this.isLoadingCategories = true;
    this.isLoadingAnnouncements = true;
    this.categoriesError = null;
    this.announcementsError = null;

    console.log('🚀 Conectando con el backend Laravel...');

    // Cargar categorías desde el endpoint de filtros para tener todas las categorías
    this.loadCategoriesFromFilter();
    
    // Cargar datos de anuncios desde el endpoint home
    this.homeService.getHomeData()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingCategories = false;
          this.isLoadingAnnouncements = false;
        })
      )
      .subscribe({
        next: (homeData: HomeData) => {
          console.log('✅ Datos del backend recibidos exitosamente:', homeData);
          
          // Las categorías ahora se cargan desde loadCategoriesFromFilter() para tener acceso a todas
          
          // Procesar anuncios recientes - solo los 6 más recientes
          const recentProducts = (homeData.recent_products as any)?.data || homeData.recent_products;
          if (recentProducts && Array.isArray(recentProducts)) {
            // Mapear los datos del backend al formato esperado por el frontend y tomar solo 6
            this.recentAnnouncements = recentProducts
              .slice(0, 6) // Solo los 6 más recientes
              .map(product => ({
                id: product.id,
                slug: product.slug,
                title: product.title,
                description: product.description,
                price: parseFloat(product.price_pen) || 0,
                category: product.categorie_first?.name || 'Sin categoría',
                categoryId: product.categorie_first_id,
                location: product.location || 'No especificada',
                image: product.imagen || 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Sin+Imagen',
                views: product.views_count || 0,
                featured: product.featured === 1 || false,
                created_at: product.created_at,
                updated_at: product.created_at
              }));
            console.log('📢 Anuncios recientes cargados desde backend (6 más recientes):', this.recentAnnouncements.length);
          } else {
            this.announcementsError = 'El backend no devolvió anuncios recientes válidos';
            console.error('❌ Anuncios recientes no válidos:', homeData.recent_products);
          }
          
          // Sección de destacados removida - no se necesita por ahora
          
          // Procesar anuncios populares - solo los 6 con más vistas
          const popularProducts = (homeData.popular_products as any)?.data || homeData.popular_products;
          if (popularProducts && Array.isArray(popularProducts) && popularProducts.length > 0) {
            this.popularAnnouncements = popularProducts
              .slice(0, 6) // Solo los 6 más populares
              .map(product => ({
                id: product.id,
                slug: product.slug,
                title: product.title,
                description: product.description,
                price: parseFloat(product.price_pen) || 0,
                category: product.categorie_first?.name || 'Sin categoría',
                categoryId: product.categorie_first_id,
                location: product.location || 'No especificada',
                image: product.imagen || 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Sin+Imagen',
                views: product.views_count || 0,
                featured: product.featured === 1 || false,
                created_at: product.created_at,
                updated_at: product.created_at
              }));
            console.log('🔥 Anuncios populares cargados desde backend (6 más populares):', this.popularAnnouncements.length);
          } else {
            // Si no hay popular_products, ordenar por views y tomar 6
            this.popularAnnouncements = [...this.recentAnnouncements]
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 6); // Solo los 6 con más vistas
            console.log('🔥 Anuncios populares ordenados por views (6 con más vistas):', this.popularAnnouncements.length);
          }
          
          // Procesar estadísticas
          if (homeData.stats) {
            this.stats = {
              total_announcements: homeData.stats.total_announcements || 0,
              total_users: homeData.stats.total_users || 0,
              satisfaction: 95, // Valor fijo
              support: '24/7' // Valor fijo
            };
            console.log('📊 Estadísticas actualizadas desde backend:', this.stats);
          } else {
            console.warn('⚠️ No se recibieron estadísticas del backend');
          }
        },
        error: (error: any) => {
          console.error('❌ ERROR CONECTANDO CON EL BACKEND HOME:', error);
          console.error('🔍 Detalles del error:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            url: error.url
          });
          
          // Mostrar errores específicos solo para anuncios (las categorías se manejan en loadCategoriesFromFilter)
          if (error.status === 0) {
            this.announcementsError = 'No se puede conectar con el servidor. ¿Está Laravel corriendo en http://localhost:8000?';
          } else if (error.status === 404) {
            this.announcementsError = 'Endpoint /api/ecommerce/home no encontrado. ¿Está el HomeController creado?';
          } else if (error.status === 500) {
            this.announcementsError = 'Error interno del servidor. Revisar logs de Laravel.';
          } else {
            this.announcementsError = `Error del servidor: ${error.status} - ${error.statusText}`;
          }
          
          // NO CARGAR DATOS MOCK - Dejar arrays vacíos para probar la conexión real
          console.log('🚫 NO se cargarán datos mock de anuncios. Arrays permanecen vacíos para testing real.');
        }
      });
  }

  /**
   * Carga categorías desde el endpoint de filtros para obtener todas las categorías disponibles
   */
  private loadCategoriesFromFilter(): void {
    this.homeService.getFilterConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (filterData: any) => {
          console.log('✅ Home: Categorías del filtro recibidas:', filterData);
          
          // Procesar categorías del endpoint de filtros
          const categories = (filterData.categories as any)?.data || filterData.categories;
          if (categories && Array.isArray(categories)) {
            // Mapear los datos del backend al formato esperado por el frontend
            this.categories = categories
              .filter((cat: any) => cat.state === 1) // Solo categorías activas
              .map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                icon: this.getCategoryIcon(cat.name), // Usar iconos dinámicos
                count: cat.products_count || 0,
                slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
                isActive: cat.state === 1
              }));
              
            // Ordenar por cantidad de anuncios
            const sortedCategories = this.categories
              .sort((a, b) => (b.count || 0) - (a.count || 0));
            
            // Separar las 4 más populares del resto
            this.topCategories = sortedCategories.slice(0, 4);
            this.remainingCategories = sortedCategories.slice(4);
            
            console.log('📂 Home: Categorías cargadas desde filtros:', this.categories.length);
            this.isLoadingCategories = false;
          } else {
            this.categoriesError = 'El backend no devolvió categorías válidas en el filtro';
            console.error('❌ Categorías no válidas en filtro:', filterData.categories);
            this.isLoadingCategories = false;
          }
        },
        error: (error: any) => {
          console.error('❌ Home: Error cargando categorías desde filtros:', error);
          this.categoriesError = 'Error cargando categorías desde filtros';
          this.isLoadingCategories = false;
        }
      });
  }

  // Event handlers
  /**
   * Navega a la página de anuncios con sidebar extendido para mostrar todas las categorías
   */
  navigateToAnnouncementsWithSidebar(): void {
    this.router.navigate(['/anuncios'], { 
      queryParams: { 
        sidebar: 'expanded',
        showCategories: 'true' // Indicador para mostrar todas las categorías
      } 
    }).then(() => {
      // Asegurar scroll hacia arriba después de la navegación
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    });
  }

  /**
   * Alterna la vista de todas las categorías en el home
   */
  toggleAllCategories(): void {
    this.showAllCategories = !this.showAllCategories;
    
    // Scroll suave hacia la sección de categorías si se está expandiendo
    if (this.showAllCategories) {
      setTimeout(() => {
        const categoriesSection = document.querySelector('.categories-section');
        if (categoriesSection) {
          categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  /**
   * Navega a la página de anuncios con filtro de categoría específica
   */
  onCategoryClick(categoryId: number, categoryName: string): void {
    this.router.navigate(['/anuncios'], { 
      queryParams: { 
        category: categoryId,
        categoryName: categoryName,
        filter: 'category' // Indicador para que la página de anuncios sepa que debe aplicar el filtro
      } 
    }).then(() => {
      // Asegurar scroll hacia arriba después de la navegación
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    });
  }

  /**
   * Cambia entre la vista de anuncios recientes y populares
   */
  switchAnnouncementView(view: 'recent' | 'popular'): void {
    this.currentAnnouncementView = view;
    console.log(`🔄 Cambiando vista a: ${view === 'recent' ? 'Recientes' : 'Populares'}`);
  }

  /**
   * Obtiene los anuncios a mostrar según la vista actual
   */
  getCurrentAnnouncements(): any[] {
    switch (this.currentAnnouncementView) {
      case 'recent':
        return this.recentAnnouncements;
      case 'popular':
        return this.popularAnnouncements;
      default:
        return this.recentAnnouncements;
    }
  }

  onAnnouncementClick(announcement: any): void {
    // Navegar usando slug si existe, sino usar ID
    if (announcement.slug) {
      this.router.navigate(['/anuncio', announcement.slug]);
    } else {
      this.router.navigate(['/anuncio', announcement.id]);
    }
  }

  // Utility methods
  /**
   * Verifica si un anuncio es nuevo (menos de 7 días)
   */
  isNewAnnouncement(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }

  /**
   * Formatea el precio para mostrar
   */
  formatPrice(price: number): string {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + 'M';
    } else if (price >= 1000) {
      return (price / 1000).toFixed(0) + 'K';
    }
    return price.toLocaleString('es-PE');
  }

  /**
   * Obtiene el tiempo transcurrido desde la creación
   */
  getTimeAgo(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hace 1 día';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    }
  }

  /**
   * Obtiene el icono apropiado según el nombre de la categoría
   */
  getCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase();
    
    // Mapeo de categorías a iconos de Bootstrap Icons
    const iconMap: { [key: string]: string } = {
      // Vehículos y Transporte
      'vehiculos': 'bi bi-car-front-fill',
      'autos': 'bi bi-car-front-fill',
      'carros': 'bi bi-car-front-fill',
      'motos': 'bi bi-motorcycle',
      'motocicletas': 'bi bi-motorcycle',
             'bicicletas': 'bi bi-bicycle',
       'camiones': 'bi bi-truck',
       'buses': 'bi bi-bus-front',
       'transporte': 'bi bi-truck',
       
       // Inmuebles y Propiedades
       'inmuebles': 'bi bi-house-fill',
       'casas': 'bi bi-house-fill',
       'departamentos': 'bi bi-building',
       'terrenos': 'bi bi-geo-alt-fill',
       'oficinas': 'bi bi-building-fill-gear',
       'locales': 'bi bi-shop',
       'alquiler': 'bi bi-key-fill',
       'venta': 'bi bi-house-check-fill',
       
       // Tecnología y Electrónicos
       'tecnologia': 'bi bi-laptop-fill',
       'electronica': 'bi bi-laptop-fill',
       'celulares': 'bi bi-phone-fill',
       'telefonos': 'bi bi-phone-fill',
       'computadoras': 'bi bi-pc-display',
       'laptops': 'bi bi-laptop',
       'tablets': 'bi bi-tablet-fill',
       'televisores': 'bi bi-tv-fill',
       'audio': 'bi bi-speaker-fill',
       'camaras': 'bi bi-camera-fill',
       
       // Hogar y Jardín
       'hogar': 'bi bi-house-heart-fill',
       'muebles': 'bi bi-house-door-fill',
       'electrodomesticos': 'bi bi-lightning-charge-fill',
       'cocina': 'bi bi-cup-hot-fill',
       'jardin': 'bi bi-flower1',
       'decoracion': 'bi bi-palette-fill',
       
       // Ropa y Accesorios
       'ropa': 'bi bi-bag-fill',
       'moda': 'bi bi-bag-fill',
       'zapatos': 'bi bi-shoe-fill',
       'accesorios': 'bi bi-gem',
       'joyas': 'bi bi-gem',
       'relojes': 'bi bi-smartwatch',
       
       // Deportes y Recreación
       'deportes': 'bi bi-trophy-fill',
       'fitness': 'bi bi-heart-pulse-fill',
       'gimnasio': 'bi bi-heart-pulse-fill',
       'futbol': 'bi bi-trophy-fill',
       'bicicleta': 'bi bi-bicycle',
       'camping': 'bi bi-tree-fill',
      
      // Servicios
      'servicios': 'bi bi-tools',
      'construccion': 'bi bi-hammer',
      'reparaciones': 'bi bi-wrench-adjustable',
      'limpieza': 'bi bi-droplet-fill',
      'jardineria': 'bi bi-flower1',
      'plomeria': 'bi bi-wrench-adjustable',
      'electricidad': 'bi bi-lightning-fill',
      
      // Trabajo y Empleo
      'trabajo': 'bi bi-briefcase-fill',
      'empleo': 'bi bi-briefcase-fill',
      'profesional': 'bi bi-person-badge-fill',
      
      // Mascotas y Animales
      'mascotas': 'bi bi-heart-fill',
      'animales': 'bi bi-heart-fill',
      'perros': 'bi bi-heart-fill',
      'gatos': 'bi bi-heart-fill',
      'veterinaria': 'bi bi-heart-pulse-fill',
      
      // Bebés y Niños
      'bebes': 'bi bi-baby-carriage-fill',
      'niños': 'bi bi-baby-carriage-fill',
      'juguetes': 'bi bi-balloon-fill',
      'infantil': 'bi bi-baby-carriage-fill',
      
      // Libros y Educación
      'libros': 'bi bi-book-fill',
      'educacion': 'bi bi-mortarboard-fill',
      'cursos': 'bi bi-journal-bookmark-fill',
      'universidad': 'bi bi-mortarboard-fill',
      
      // Música e Instrumentos
      'musica': 'bi bi-music-note-beamed',
      'instrumentos': 'bi bi-music-note-beamed',
      'guitarra': 'bi bi-music-note-beamed',
      'piano': 'bi bi-music-note-beamed',
      
      // Salud y Belleza
      'salud': 'bi bi-heart-pulse-fill',
      'belleza': 'bi bi-palette2',
      'cosmeticos': 'bi bi-palette2',
      'farmacia': 'bi bi-capsule',
      
      // Comida y Bebidas
      'comida': 'bi bi-cup-hot-fill',
      'restaurante': 'bi bi-cup-hot-fill',
      'bebidas': 'bi bi-cup-straw',
      'alimentos': 'bi bi-basket-fill',
      
      // Arte y Coleccionables
      'arte': 'bi bi-palette-fill',
      'coleccionables': 'bi bi-gem',
      'antiguedades': 'bi bi-hourglass-split',
      
      // Otros
      'otros': 'bi bi-grid-3x3-gap-fill',
      'varios': 'bi bi-grid-3x3-gap-fill',
      'general': 'bi bi-grid-3x3-gap-fill'
    };
    
    // Buscar coincidencias en el nombre de la categoría
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (name.includes(keyword)) {
        return icon;
      }
    }
    
    // Icono por defecto si no se encuentra coincidencia
    return 'bi bi-grid-3x3-gap-fill';
  }

  // TrackBy functions for performance
  trackByCategory(index: number, category: Category): number {
    return category.id;
  }

  trackByAnnouncement(index: number, announcement: Announcement): number {
    return announcement.id;
  }
} 