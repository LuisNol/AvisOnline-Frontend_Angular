import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnnouncementService } from '../../../services/announcement.service';
import { Announcement, AnnouncementSeller } from '../../../interfaces/announcement.interface';

@Component({
  selector: 'app-announcement-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-detail.component.html',
  styleUrls: ['./announcement-detail.component.scss']
})
export class AnnouncementDetailComponent implements OnInit, OnDestroy {
  announcement: Announcement | null = null;
  relatedAnnouncements: Announcement[] = [];
  loading = true;
  error: string | null = null;
  currentImageIndex = 0;
  images: string[] = [];
  
  private destroy$ = new Subject<void>();
  // Imagen placeholder en base64 para evitar errores 404
  private readonly PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4=';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['slug'] || params['id']) {
        this.loadAnnouncement(params['slug'] || params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAnnouncement(id: string): void {
    this.loading = true;
    this.error = null;
    
    console.log('🔍 Loading announcement with ID:', id);
    
    this.announcementService.getAnnouncementById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (announcement: Announcement) => {
        console.log('📥 Received mapped announcement:', announcement);
        
        // Verificar que tenemos los campos mínimos necesarios
        if (!announcement.id || !announcement.title) {
          console.error('❌ Missing required fields in announcement:', announcement);
          this.error = 'Los datos del anuncio están incompletos.';
          this.loading = false;
          return;
        }

        this.announcement = announcement;
        console.log('✅ Announcement loaded successfully:', this.announcement);
        
        this.setupImages();
        
        // Cargar productos relacionados
        this.loadRelatedAnnouncements();
        
        // El backend ya incrementa las vistas automáticamente en el controlador
        // No necesitamos hacer una llamada adicional
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error loading announcement:', error);
        
        // Mensaje de error más específico basado en el código de estado
        if (error.status === 404) {
          this.error = 'El anuncio solicitado no existe o ha sido eliminado.';
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else {
          this.error = `Error al cargar el anuncio: ${error.message || 'Error desconocido'}`;
        }
        
        this.loading = false;
      }
    });
  }

  private setupImages(): void {
    if (this.announcement) {
      this.images = [];
      
      // Imagen principal
      if (this.announcement.image) {
        this.images.push(this.announcement.image);
      }
      
      // Imágenes adicionales si existen
      if (this.announcement.images && this.announcement.images.length > 0) {
        this.images.push(...this.announcement.images);
      }
      
      // Si no hay imágenes, usar placeholder
      if (this.images.length === 0) {
        this.images.push(this.PLACEHOLDER_IMAGE);
      }
    }
  }

  private loadRelatedAnnouncements(): void {
    if (this.announcement?.slug) {
      this.announcementService.getRelatedAnnouncementsBySlug(this.announcement.slug).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (announcements: Announcement[]) => {
          this.relatedAnnouncements = announcements;
          console.log('✅ Related announcements loaded:', this.relatedAnnouncements.length);
        },
        error: (error: any) => {
          console.error('❌ Error loading related announcements:', error);
          this.relatedAnnouncements = [];
        }
      });
    } else {
      console.log('⚠️ No slug available for loading related announcements');
      this.relatedAnnouncements = [];
    }
  }

  private incrementViewsIfPossible(id: number): void {
    // Solo intentar incrementar vistas si el endpoint existe
    // Esto evita errores 404 en bucle
    try {
      this.announcementService.incrementViews(id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          // Views incrementadas exitosamente
        },
        error: (error: any) => {
          // Silenciosamente ignorar errores del conteo
          console.warn('View increment not available:', error);
        }
      });
    } catch (error) {
      // Silenciosamente ignorar si el método no existe
      console.warn('View increment method not available');
    }
  }

  // Navegación de imágenes
  nextImage(): void {
    if (this.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }
  }

  previousImage(): void {
    if (this.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Métodos de utilidad
  getImageWithFallback(imageUrl?: string): string {
    return imageUrl || this.PLACEHOLDER_IMAGE;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  }

  // Métodos de navegación
  goBack(): void {
    this.router.navigate(['/anuncios']);
  }

  viewRelatedAnnouncement(announcement: Announcement): void {
    this.router.navigate(['/anuncio', announcement.slug || announcement.id]);
  }

  // Métodos de interacción
  contactSeller(): void {
    if (this.announcement?.seller?.phone) {
      const message = `Hola, me interesa tu anuncio: ${this.announcement.title}`;
      const whatsappUrl = `https://wa.me/${this.announcement.seller.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  saveAnnouncement(): void {
    // TODO: Implementar guardar anuncio
    console.log('Guardar anuncio');
  }

  shareAnnouncement(): void {
    if (navigator.share) {
      navigator.share({
        title: this.announcement?.title,
        text: this.announcement?.description,
        url: window.location.href
      });
    } else {
      // Fallback: copiar URL al clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }

  reportAnnouncement(): void {
    // TODO: Implementar reportar anuncio
    console.log('Reportar anuncio');
  }

  onImageError(event: any): void {
    event.target.src = this.PLACEHOLDER_IMAGE;
  }

  trackByAnnouncement(index: number, announcement: Announcement): number {
    return announcement.id;
  }

  /**
   * Guarda/desguarda el anuncio en favoritos
   */
  onSave(): void {
    // TODO: Implementar sistema de favoritos cuando esté listo
    console.log('💾 Guardando en favoritos:', this.announcement?.title);
    alert('Función de favoritos próximamente disponible');
  }

  /**
   * Contacta al vendedor por WhatsApp
   */
  onContactWhatsApp(): void {
    if (!this.announcement?.seller?.phone) {
      alert('⚠️ El vendedor no ha proporcionado número de teléfono');
      return;
    }

    const phone = this.announcement.seller.phone.replace(/[^\d]/g, ''); // Solo números
    const message = encodeURIComponent(
      `¡Hola! Vi tu anuncio en AvisOnline: "${this.announcement.title}". ¿Está disponible? ¿Podemos coordinar para verlo?`
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Comparte el anuncio
   */
  onShare(): void {
    const url = window.location.href;
    const title = this.announcement?.title || 'Anuncio en AvisOnline';
    
    if (navigator.share) {
      // API Web Share (móviles modernos)
      navigator.share({
        title: title,
        text: 'Mira este anuncio en AvisOnline',
        url: url
      }).catch(console.error);
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(url).then(() => {
        alert('📋 Enlace copiado al portapapeles');
      }).catch(() => {
        // Fallback del fallback: mostrar el enlace
        prompt('📋 Copia este enlace:', url);
      });
    }
  }
} 