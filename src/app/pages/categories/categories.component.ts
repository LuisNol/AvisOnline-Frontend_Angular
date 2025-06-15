import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

import { Category } from '../../interfaces/category.interface';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estado del componente
  isLoading = false;
  isConnected = false;
  error: string | null = null;
  
  // Datos
  categories: Category[] = [];

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.error = null;

    console.log('🚀 Cargando categorías desde el backend...');

    this.homeService.getHomeData()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (homeData) => {
          console.log('✅ Datos recibidos para categorías:', homeData);
          
          // Procesar categorías del backend
          const categories = (homeData.categories as any)?.data || homeData.categories;
          if (categories && Array.isArray(categories)) {
            this.categories = categories.map(cat => ({
              id: cat.id,
              name: cat.name,
              icon: this.mapBackendIconToBootstrap(cat.icon),
              count: cat.products_count || 0,
              slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
              isActive: cat.state === 1
            }));
            
            this.isConnected = true;
            console.log('📂 Categorías cargadas exitosamente:', this.categories.length);
          } else {
            throw new Error('Formato de categorías inválido');
          }
        },
        error: (error) => {
          console.error('❌ Error cargando categorías:', error);
          this.isConnected = false;
          
          // Mostrar error específico
          if (error.status === 0) {
            this.error = 'No se puede conectar con el servidor. ¿Está Laravel corriendo?';
          } else if (error.status === 404) {
            this.error = 'Endpoint no encontrado. Verificar rutas del backend.';
          } else if (error.status === 500) {
            this.error = 'Error interno del servidor. Revisar logs de Laravel.';
          } else {
            this.error = `Error del servidor: ${error.status} - ${error.statusText}`;
          }
          
          // Cargar datos de ejemplo como fallback
          this.loadMockCategories();
        }
      });
  }

  private mapBackendIconToBootstrap(backendIcon: string): string {
    // Mapear iconos de Font Awesome a Bootstrap Icons
    const iconMap: { [key: string]: string } = {
      'fas fa-home': 'bi-house-fill',
      'fas fa-couch': 'bi-house-gear-fill',
      'fas fa-football-ball': 'bi-trophy-fill',
      'fas fa-tools': 'bi-tools',
      'fas fa-paw': 'bi-heart-fill',
      'fas fa-briefcase': 'bi-briefcase-fill',
      'fas fa-ellipsis-h': 'bi-three-dots',
      'fas fa-laptop': 'bi-laptop',
      'fas fa-car': 'bi-car-front-fill',
      'fas fa-tshirt': 'bi-bag-fill'
    };
    
    return iconMap[backendIcon] || 'bi-grid';
  }

  private loadMockCategories(): void {
    // Datos de ejemplo como fallback
    this.categories = [
      { id: 1, name: 'Vehículos', slug: 'vehiculos', icon: 'bi-car-front-fill', count: 1250, isActive: true },
      { id: 2, name: 'Inmuebles', slug: 'inmuebles', icon: 'bi-house-fill', count: 890, isActive: true },
      { id: 3, name: 'Electrónicos', slug: 'electronicos', icon: 'bi-laptop', count: 675, isActive: true },
      { id: 4, name: 'Moda', slug: 'moda', icon: 'bi-bag-fill', count: 543, isActive: true },
      { id: 5, name: 'Hogar', slug: 'hogar', icon: 'bi-house-gear-fill', count: 432, isActive: true },
      { id: 6, name: 'Deportes', slug: 'deportes', icon: 'bi-trophy-fill', count: 321, isActive: true },
      { id: 7, name: 'Mascotas', slug: 'mascotas', icon: 'bi-heart-fill', count: 234, isActive: true },
      { id: 8, name: 'Servicios', slug: 'servicios', icon: 'bi-tools', count: 654, isActive: true }
    ];
    console.log('📂 Cargadas categorías de ejemplo como fallback');
  }

  trackByCategory(index: number, category: Category): number {
    return category.id;
  }
} 