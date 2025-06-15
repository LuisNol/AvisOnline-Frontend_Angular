import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Announcement, AnnouncementFilters } from '../interfaces/announcement.interface';
import { Category } from '../interfaces/category.interface';
import { environment } from '../../environments/environment';

export interface HomeData {
  categories: Category[];
  recent_products: Announcement[];
  featured_products: Announcement[];
  popular_products: Announcement[];
  stats: {
    total_announcements: number;
    total_categories: number;
    total_users: number;
    announcements_today: number;
  };
}

export interface FilterConfig {
  categories: Category[];
  price_range: {
    min_price: number;
    max_price: number;
  };
  locations: string[];
}

export interface SearchResponse {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
  products: Announcement[];
}

export interface ProductDetailResponse {
  product: Announcement;
  related_products: Announcement[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = environment.apiUrl ;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los datos principales para la página de inicio
   * GET /api/ecommerce/home
   */
  getHomeData(): Observable<HomeData> {
    return this.http.get<HomeData>(`${this.baseUrl}/ecommerce/home`)
      .pipe(
        catchError(this.handleError<HomeData>('getHomeData'))
      );
  }

  /**
   * Obtiene categorías para menús de navegación
   * GET /api/ecommerce/menus
   */
  getMenuCategories(): Observable<{ categories: Category[] }> {
    return this.http.get<{ categories: Category[] }>(`${this.baseUrl}/ecommerce/menus`)
      .pipe(
        catchError(this.handleError<{ categories: Category[] }>('getMenuCategories'))
      );
  }

  /**
   * Obtiene detalles de un anuncio específico
   * GET /api/ecommerce/product/{slug}
   */
  getProductDetails(slug: string): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.baseUrl}/ecommerce/product/${slug}`)
      .pipe(
        catchError(this.handleError<ProductDetailResponse>('getProductDetails'))
      );
  }

  /**
   * Obtiene configuración para filtros avanzados
   * GET /api/ecommerce/config-filter-advance
   */
  getFilterConfig(): Observable<FilterConfig> {
    return this.http.get<FilterConfig>(`${this.baseUrl}/ecommerce/config-filter-advance`)
      .pipe(
        catchError(this.handleError<FilterConfig>('getFilterConfig'))
      );
  }

  /**
   * Realiza búsqueda avanzada con filtros
   * POST /api/ecommerce/filter-advance-product
   */
  searchProducts(filters: {
    search?: string;
    categorie_id?: number | number[];
    min_price?: number;
    max_price?: number;
    location?: string;
    sort_by?: 'recent' | 'price_asc' | 'price_desc' | 'popular';
    page?: number;
  }): Observable<SearchResponse> {
    // Preparar los datos para enviar al backend
    const requestData = { ...filters };
    
    // Si categorie_id es un array, convertirlo al formato que espera Laravel
    if (Array.isArray(filters.categorie_id)) {
      // Laravel espera arrays como categorie_id[0], categorie_id[1], etc.
      // Pero con HttpClient de Angular, podemos enviar el array directamente
      // y Angular lo convertirá automáticamente al formato correcto
      requestData.categorie_id = filters.categorie_id;
    }
    
    return this.http.post<SearchResponse>(`${this.baseUrl}/ecommerce/filter-advance-product`, requestData)
      .pipe(
        catchError(this.handleError<SearchResponse>('searchProducts'))
      );
  }

  /**
   * Obtiene anuncios promocionales
   * POST /api/ecommerce/campaing-discount-link
   */
  getPromotionalProducts(): Observable<{ promotional_products: Announcement[] }> {
    return this.http.post<{ promotional_products: Announcement[] }>(`${this.baseUrl}/ecommerce/campaing-discount-link`, {})
      .pipe(
        catchError(this.handleError<{ promotional_products: Announcement[] }>('getPromotionalProducts'))
      );
  }

  /**
   * Incrementa el contador de vistas de un producto
   * POST /api/ecommerce/product/{slug}/view
   */
  incrementProductViews(slug: string): Observable<{ success: boolean; views_count: number }> {
    return this.http.post<{ success: boolean; views_count: number }>(`${this.baseUrl}/ecommerce/product/${slug}/view`, {})
      .pipe(
        catchError(this.handleError<{ success: boolean; views_count: number }>('incrementProductViews', { success: false, views_count: 0 }))
      );
  }

  /**
   * Métodos de conveniencia para obtener datos específicos del home
   */
  getRecentProducts(): Observable<Announcement[]> {
    return this.getHomeData().pipe(
      map(data => data.recent_products),
      catchError(this.handleError<Announcement[]>('getRecentProducts', []))
    );
  }

  getFeaturedProducts(): Observable<Announcement[]> {
    return this.getHomeData().pipe(
      map(data => data.featured_products),
      catchError(this.handleError<Announcement[]>('getFeaturedProducts', []))
    );
  }

  getPopularProducts(): Observable<Announcement[]> {
    return this.getHomeData().pipe(
      map(data => data.popular_products),
      catchError(this.handleError<Announcement[]>('getPopularProducts', []))
    );
  }

  getCategories(): Observable<Category[]> {
    return this.getHomeData().pipe(
      map(data => data.categories),
      catchError(this.handleError<Category[]>('getCategories', []))
    );
  }

  /**
   * Obtiene todos los anuncios recientes (alias para compatibilidad)
   */
  getAnnouncements(): Observable<Announcement[]> {
    return this.getRecentProducts();
  }

  getStats(): Observable<HomeData['stats']> {
    return this.getHomeData().pipe(
      map(data => data.stats),
      catchError(this.handleError<HomeData['stats']>('getStats'))
    );
  }

  /**
   * Manejo de errores genérico
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // En un entorno de producción, enviarías el error a un servicio de logging
      // this.logError(error);
      
      // Retorna un resultado seguro para que la app siga funcionando
      return new BehaviorSubject(result as T).asObservable();
    };
  }
} 