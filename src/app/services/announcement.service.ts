import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { 
  Announcement, 
  AnnouncementFilters, 
  AnnouncementResponse, 
  CreateAnnouncementRequest,
  BackendProductResponse,
  BackendProduct,
  AnnouncementSeller
} from '../interfaces/announcement.interface';
import { ApiResponse } from '../interfaces/api.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private baseUrl = environment.apiUrl || 'http://localhost:8000/api';
  private announcementsSubject = new BehaviorSubject<Announcement[]>([]);
  public announcements$ = this.announcementsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Mapea un BackendProduct a Announcement
   */
  private mapBackendProductToAnnouncement(product: BackendProduct): Announcement {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price_pen,
      location: product.location,
      category: product.categorie_first?.name || 'Sin categoría',
      categoryId: product.categorie_first_id,
      image: product.imagen,
      images: product.images?.map(img => img.imagen) || [],
      created_at: product.created_at,
      updated_at: product.created_at,
      views: product.views_count,
      featured: false, // No está disponible en el backend
      slug: product.slug,
      status: product.state === 1 ? 'active' : 'inactive',
      seller: product.user ? this.mapBackendUserToSeller(product.user) : undefined,
      contactInfo: {
        phone: product.contact_phone,
        email: product.contact_email,
        preferredContact: 'phone'
      }
    };
  }

  /**
   * Mapea un usuario del backend a AnnouncementSeller
   */
  private mapBackendUserToSeller(user: BackendProduct['user']): AnnouncementSeller | undefined {
    if (!user) return undefined;
    
    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || undefined,
      bio: user.bio,
      city: user.address_city,
      memberSince: user.member_since
    };
  }

  /**
   * Obtiene anuncios con filtros
   */
  getAnnouncements(filters: AnnouncementFilters = {}): Observable<AnnouncementResponse> {
    let params = new HttpParams();
    
    console.log('🔍 Service: Aplicando filtros:', filters);
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        // Manejar arrays (como categorie_id)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // Para arrays, enviar cada elemento por separado o como string separado por comas
            if (key === 'categorie_id') {
              // Laravel espera categorie_id[] para arrays
              value.forEach((item, index) => {
                params = params.append(`${key}[]`, item.toString());
              });
            } else {
              params = params.set(key, value.join(','));
            }
          }
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    console.log('📤 Service: Parámetros enviados al backend:', params.toString());

    return this.http.post<AnnouncementResponse>(`${this.baseUrl}/ecommerce/filter-advance-product`, params)
      .pipe(
        map(response => {
          console.log('📥 Service: Respuesta del backend:', response);
          this.announcementsSubject.next(response.announcements);
          return response;
        }),
        catchError(error => {
          console.error('❌ Service: Error en getAnnouncements:', error);
          return this.handleError<AnnouncementResponse>('getAnnouncements')(error);
        })
      );
  }

  /**
   * Obtiene un anuncio específico por ID o slug
   */
  getAnnouncementById(id: number | string): Observable<Announcement> {
    console.log('🔍 Service: Getting announcement by ID:', id);
    
    return this.http.get<BackendProductResponse>(`${this.baseUrl}/ecommerce/product/${id}`)
      .pipe(
        map(response => {
          console.log('📥 Service: Raw backend response:', response);
          
          if (!response?.product) {
            throw new Error('Product not found in response');
          }

          const announcement = this.mapBackendProductToAnnouncement(response.product);
          console.log('✅ Service: Mapped announcement:', announcement);
          
          return announcement;
        }),
        catchError(error => {
          console.error('❌ Service: Error getting announcement:', error);
          return this.handleError<Announcement>('getAnnouncementById')(error);
        })
      );
  }

  /**
   * Obtiene anuncios relacionados (simplificado - usar el endpoint principal)
   */
  getRelatedAnnouncementsBySlug(slug: string): Observable<Announcement[]> {
    return this.http.get<BackendProductResponse>(`${this.baseUrl}/ecommerce/product/${slug}`)
      .pipe(
        map(response => {
          console.log('🔍 Related products response:', response?.related_products);
          
          if (!response?.related_products || !Array.isArray(response.related_products)) {
            console.warn('⚠️ No related products found or not an array');
            return [];
          }
          
          return response.related_products.map(product => 
            this.mapBackendProductToAnnouncement(product)
          );
        }),
        catchError(error => {
          console.error('❌ Error loading related products:', error);
          return this.handleError<Announcement[]>('getRelatedAnnouncementsBySlug', [])(error);
        })
      );
  }

  /**
   * Obtiene anuncios relacionados
   */
  getRelatedAnnouncements(categoryId: number, excludeId: number, limit: number = 4): Observable<Announcement[]> {
    const params = new HttpParams()
      .set('categoryId', categoryId.toString())
      .set('excludeId', excludeId.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<Announcement[]>>(`${this.baseUrl}/ecommerce/related-announcements`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<Announcement[]>('getRelatedAnnouncements', []))
      );
  }

  /**
   * Obtiene anuncios destacados
   */
  getFeaturedAnnouncements(limit: number = 8): Observable<Announcement[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<ApiResponse<Announcement[]>>(`${this.baseUrl}/ecommerce/featured-announcements`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<Announcement[]>('getFeaturedAnnouncements', []))
      );
  }

  /**
   * Obtiene anuncios recientes
   */
  getRecentAnnouncements(limit: number = 12): Observable<Announcement[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<ApiResponse<Announcement[]>>(`${this.baseUrl}/ecommerce/recent-announcements`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<Announcement[]>('getRecentAnnouncements', []))
      );
  }

  /**
   * Busca anuncios
   */
  searchAnnouncements(query: string, filters: Partial<AnnouncementFilters> = {}): Observable<AnnouncementResponse> {
    const searchFilters: AnnouncementFilters = {
      search: query,
      ...filters
    };

    return this.getAnnouncements(searchFilters);
  }

  /**
   * Obtiene anuncios por categoría
   */
  getAnnouncementsByCategory(categoryId: number, filters: Partial<AnnouncementFilters> = {}): Observable<AnnouncementResponse> {
    const categoryFilters: AnnouncementFilters = {
      categoryId,
      ...filters
    };

    return this.getAnnouncements(categoryFilters);
  }

  /**
   * Incrementa el contador de vistas de un anuncio
   */
  incrementViews(announcementId: number): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/ecommerce/announcements/${announcementId}/view`, {})
      .pipe(
        map(response => response.data),
        catchError(this.handleError<boolean>('incrementViews', false))
      );
  }

  /**
   * Obtiene configuración para filtros
   */
  getFilterConfig(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ecommerce/config-filter-advance`)
      .pipe(
        catchError(this.handleError('getFilterConfig'))
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