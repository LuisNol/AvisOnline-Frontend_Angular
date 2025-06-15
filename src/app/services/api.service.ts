import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api'; // Cambia por tu URL de backend
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar si hay un token guardado al inicializar
    const token = localStorage.getItem('token');
    if (token) {
      this.getCurrentUser().subscribe();
    }
  }

  // Headers con token si existe
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // AUTENTICACIÓN
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login_ecommerce`, credentials)
      .pipe(map((response: any) => {
        if (response.access_token) {
          localStorage.setItem('token', response.access_token);
          this.currentUserSubject.next(response.user);
        }
        return response;
      }));
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }

  logout(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, { headers })
      .pipe(map(() => {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
      }));
  }

  getCurrentUser(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/auth/me`, {}, { headers })
      .pipe(map((user: any) => {
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  // ANUNCIOS PÚBLICOS (sin autenticación requerida)
  getHomeData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ecommerce/home`);
  }

  getMenus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ecommerce/menus`);
  }

  getAnnouncementDetails(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/ecommerce/product/${slug}`);
  }

  getFilterConfig(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ecommerce/config-filter-advance`);
  }

  searchAnnouncements(filters: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ecommerce/filter-advance-product`, filters);
  }

  // GESTIÓN DE ANUNCIOS (requiere autenticación)
  getMyAnnouncements(params: any = {}): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/admin/products/index`, params, { headers });
  }

  createAnnouncement(announcementData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/admin/products`, announcementData, { headers });
  }

  updateAnnouncement(id: number, announcementData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/admin/products/${id}`, announcementData, { headers });
  }

  deleteAnnouncement(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/admin/products/${id}`, { headers });
  }

  getAnnouncementConfig(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/admin/products/config`, { headers });
  }

  getUserStats(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/admin/products/user/stats`, { headers });
  }

  // IMÁGENES
  uploadAnnouncementImages(images: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    return this.http.post(`${this.baseUrl}/admin/products/imagens`, images, { headers });
  }

  deleteAnnouncementImage(imageId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/admin/products/imagens/${imageId}`, { headers });
  }

  // CATEGORÍAS
  getCategories(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/admin/categories`, { headers });
  }

  getCategoryConfig(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/admin/categories/config`, { headers });
  }

  // PERFIL DE USUARIO
  updateProfile(profileData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/ecommerce/profile_client`, profileData, { headers });
  }

  // UTILIDADES
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUserValue(): any {
    return this.currentUserSubject.value;
  }

} 