import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Category, CategoryWithStats, CategoryFilters, CategoryResponse } from '../interfaces/category.interface';
import { ApiResponse } from '../interfaces/api.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = environment.apiUrl;
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las categorías
   */
  getCategories(filters: CategoryFilters = {}): Observable<Category[]> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/ecommerce/categories`, { params })
      .pipe(
        map(response => {
          const categories = response.data || response as any; // Fallback para diferentes formatos de respuesta
          this.categoriesSubject.next(categories);
          return categories;
        }),
        catchError(this.handleError<Category[]>('getCategories', []))
      );
  }

  /**
   * Obtiene categorías populares
   */
  getPopularCategories(limit: number = 8): Observable<Category[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('sortBy', 'count');

    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/ecommerce/popular-categories`, { params })
      .pipe(
        map(response => response.data || response as any),
        catchError(this.handleError<Category[]>('getPopularCategories', []))
      );
  }

  /**
   * Obtiene una categoría específica por ID
   */
  getCategoryById(id: number): Observable<CategoryWithStats> {
    return this.http.get<ApiResponse<CategoryWithStats>>(`${this.baseUrl}/ecommerce/categories/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError<CategoryWithStats>('getCategoryById'))
      );
  }

  /**
   * Obtiene una categoría específica por slug
   */
  getCategoryBySlug(slug: string): Observable<CategoryWithStats> {
    return this.http.get<ApiResponse<CategoryWithStats>>(`${this.baseUrl}/ecommerce/categories/slug/${slug}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError<CategoryWithStats>('getCategoryBySlug'))
      );
  }

  /**
   * Obtiene categorías principales (sin padre)
   */
  getMainCategories(): Observable<Category[]> {
    const filters: CategoryFilters = {
      parentId: undefined, // Solo categorías principales
      isActive: true
    };

    return this.getCategories(filters);
  }

  /**
   * Obtiene subcategorías de una categoría específica
   */
  getSubcategories(parentId: number): Observable<Category[]> {
    const filters: CategoryFilters = {
      parentId,
      isActive: true
    };

    return this.getCategories(filters);
  }

  /**
   * Busca categorías por nombre
   */
  searchCategories(query: string): Observable<Category[]> {
    const filters: CategoryFilters = {
      search: query,
      isActive: true
    };

    return this.getCategories(filters);
  }

  /**
   * Obtiene el árbol completo de categorías
   */
  getCategoryTree(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/ecommerce/categories/tree`)
      .pipe(
        map(response => response.data || response as any),
        catchError(this.handleError<Category[]>('getCategoryTree', []))
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