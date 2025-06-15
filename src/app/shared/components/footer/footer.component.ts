import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HomeService } from '../../../services/home.service';
import { Category } from '../../../interfaces/category.interface';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  
  currentYear = new Date().getFullYear();
  
  // Enlaces útiles
  quickLinks = [
    { name: 'Inicio', route: '/' },
    { name: 'Buscar Anuncios', route: '/anuncios' },
    { name: 'Nosotros', route: '/nosotros' },
    { name: 'Contáctanos', route: '/contactanos' },
    { name: 'Publicar Gratis', route: 'https://www.admin.avisonline.store', external: true }
  ];
  
  // Todas las categorías activas (se cargarán dinámicamente desde el backend)
  popularCategories: Category[] = [];
  
  // Información de contacto
  contactInfo = {
    address: 'Tingo María, Huánuco, Perú',
    phone: '+51 964 261 822',
    email: 'avisonlinestoreperu@gmail.com',
    whatsapp: '+51964261822'
  };
  
  // Redes sociales
  socialLinks = [
    { name: 'Facebook', icon: 'bi bi-facebook', url: 'https://www.facebook.com/profile.php?id=61575796703310', color: '#1877f2' },
    { name: 'Instagram', icon: 'bi bi-instagram', url: 'https://www.instagram.com/avisonline.store/', color: '#e4405f' },
    { name: 'TikTok', icon: 'bi bi-tiktok', url: 'https://www.tiktok.com/@avisoonline7', color: '#000000' }
  ];
  
  // Estadísticas
  stats = {
    totalUsers: '1.2K+',
    totalAnnouncements: '850+',
    citiesCovered: '1',
    yearsActive: '1+'
  };

  constructor(
    private homeService: HomeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Carga las categorías desde el backend usando el mismo endpoint que los filtros
   */
  private loadCategories(): void {
    console.log('🏷️ Footer: Cargando categorías desde el endpoint de filtros...');
    
    // Usar getFilterConfig() que es el mismo endpoint que usan los filtros
    this.homeService.getFilterConfig().subscribe({
      next: (filterData) => {
        console.log('✅ Footer: Datos del filtro recibidos:', filterData);
        
        // Procesar categorías del endpoint de filtros
        const categories = (filterData.categories as any)?.data || filterData.categories;
        if (categories && Array.isArray(categories)) {
          console.log('🔍 Footer: Categorías RAW del backend:', categories);
          
          // Mapear los datos del backend al formato esperado (igual que en home)
          const processedCategories = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: this.mapCategoryIcon(cat.name), // Usar iconos dinámicos
            count: cat.products_count || 0,
            slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
            isActive: cat.state === 1,
            description: `${cat.products_count || 0} anuncios disponibles`,
            // Agregar info de debug
            originalState: cat.state
          }));
          
          console.log('🔍 Footer: Todas las categorías procesadas:', processedCategories);
          
          // Mostrar todas las categorías activas ordenadas por cantidad de anuncios
          const activeCategories = processedCategories.filter(cat => cat.isActive);
          const inactiveCategories = processedCategories.filter(cat => !cat.isActive);
          
          console.log('✅ Footer: Categorías ACTIVAS:', activeCategories);
          console.log('❌ Footer: Categorías INACTIVAS:', inactiveCategories);
          
          // TEMPORAL: Para debugging, puedes cambiar esto a 'true' para ver TODAS las categorías (incluso inactivas)
          const showAllForDebug = false;
          
          this.popularCategories = (showAllForDebug ? processedCategories : activeCategories)
            .sort((a, b) => (b.count || 0) - (a.count || 0)); // Ordenar por cantidad (todas)
            
          console.log('📂 Footer: Categorías finales para mostrar:', this.popularCategories);
        } else {
          console.warn('⚠️ Footer: No se recibieron categorías válidas del backend, usando fallback');
          this.loadMockCategories();
        }
      },
      error: (error) => {
        console.error('❌ Footer: Error cargando datos del filtro:', error);
        console.log('🔄 Footer: Usando categorías de ejemplo como fallback');
        this.loadMockCategories();
      }
    });
  }

  /**
   * Carga categorías mock como fallback
   */
  private loadMockCategories(): void {
    this.popularCategories = [
      { id: 1, name: 'Vehículos', slug: 'vehiculos', icon: 'bi bi-car-front', description: 'Autos, motos y más', count: 0, isActive: true },
      { id: 2, name: 'Inmuebles', slug: 'inmuebles', icon: 'bi bi-house', description: 'Casas, departamentos', count: 0, isActive: true },
      { id: 3, name: 'Electrónicos', slug: 'electronicos', icon: 'bi bi-phone', description: 'Celulares, laptops', count: 0, isActive: true },
      { id: 4, name: 'Hogar y Jardín', slug: 'hogar-jardin', icon: 'bi bi-house-gear', description: 'Muebles, decoración', count: 0, isActive: true },
      { id: 5, name: 'Moda y Belleza', slug: 'moda-belleza', icon: 'bi bi-bag', description: 'Ropa, accesorios', count: 0, isActive: true },
      { id: 6, name: 'Servicios', slug: 'servicios', icon: 'bi bi-tools', description: 'Servicios profesionales', count: 0, isActive: true }
    ];
  }

  /**
   * Navega a enlace externo
   */
  navigateToExternal(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Abre WhatsApp con mensaje predefinido para contacto directo
   */
  openWhatsApp(): void {
    const message = encodeURIComponent('¡Hola! Me gustaría obtener más información sobre AvisOnline.');
    const whatsappUrl = `https://wa.me/${this.contactInfo.whatsapp}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Abre el grupo de WhatsApp de la comunidad
   */
  joinWhatsAppGroup(): void {
    const groupUrl = 'https://chat.whatsapp.com/Io3PlFTlasB38v4B9Vm2Us';
    window.open(groupUrl, '_blank');
  }

  /**
   * Copia email al portapapeles
   */
  copyEmail(): void {
    navigator.clipboard.writeText(this.contactInfo.email).then(() => {
      // Aquí podrías mostrar un toast de confirmación
      console.log('Email copiado al portapapeles');
    }).catch(() => {
      // Fallback para navegadores que no soportan clipboard API
      prompt('Copia este email:', this.contactInfo.email);
    });
  }

  /**
   * Navega directamente a una categoría específica
   */
  navigateToCategory(category: Category): void {
    console.log('🏷️ Navegación desde footer a categoría:', category.name);
    this.router.navigate(['/anuncios'], { 
      queryParams: { 
        category: category.id,
        categoryName: category.name,
        filter: 'category'
      } 
    });
  }

  /**
   * Scroll hacia arriba
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Genera un slug desde el nombre de la categoría
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno solo
  }

  /**
   * Mapea el icono de la categoría a Bootstrap Icons
   */
  private mapCategoryIcon(iconOrName: string): string {
    // Si ya tiene el prefijo bi bi-, retornarlo tal como está
    if (iconOrName && iconOrName.startsWith('bi bi-')) {
      return iconOrName;
    }
    
    const name = iconOrName.toLowerCase();
    
    // Mapeo de categorías a iconos de Bootstrap Icons
    const iconMap: { [key: string]: string } = {
      // Vehículos y Transporte
      'vehiculos': 'bi bi-car-front',
      'autos': 'bi bi-car-front',
      'carros': 'bi bi-car-front',
      'motos': 'bi bi-motorcycle',
      'motocicletas': 'bi bi-motorcycle',
      'bicicletas': 'bi bi-bicycle',
      'camiones': 'bi bi-truck',
      'buses': 'bi bi-bus-front',
      'transporte': 'bi bi-truck',
      
      // Inmuebles y Propiedades
      'inmuebles': 'bi bi-house',
      'casas': 'bi bi-house',
      'departamentos': 'bi bi-building',
      'terrenos': 'bi bi-geo-alt',
      'oficinas': 'bi bi-building-gear',
      'locales': 'bi bi-shop',
      'alquiler': 'bi bi-key',
      'venta': 'bi bi-house-check',
      
      // Tecnología y Electrónicos
      'tecnologia': 'bi bi-laptop',
      'electronica': 'bi bi-laptop',
      'electronicos': 'bi bi-phone',
      'celulares': 'bi bi-phone',
      'telefonos': 'bi bi-phone',
      'computadoras': 'bi bi-pc-display',
      'laptops': 'bi bi-laptop',
      'tablets': 'bi bi-tablet',
      'televisores': 'bi bi-tv',
      'audio': 'bi bi-speaker',
      'camaras': 'bi bi-camera',
      
      // Hogar y Jardín
      'hogar': 'bi bi-house-gear',
      'muebles': 'bi bi-house-door',
      'electrodomesticos': 'bi bi-lightning-charge',
      'cocina': 'bi bi-cup-hot',
      'jardin': 'bi bi-flower1',
      'decoracion': 'bi bi-palette',
      
      // Ropa y Accesorios
      'ropa': 'bi bi-bag',
      'moda': 'bi bi-bag',
      'belleza': 'bi bi-bag',
      'zapatos': 'bi bi-shoe',
      'accesorios': 'bi bi-gem',
      'joyas': 'bi bi-gem',
      'relojes': 'bi bi-smartwatch',
      
      // Deportes y Recreación
      'deportes': 'bi bi-trophy',
      'fitness': 'bi bi-heart-pulse',
      'gimnasio': 'bi bi-heart-pulse',
      'futbol': 'bi bi-trophy',
      'bicicleta': 'bi bi-bicycle',
      'camping': 'bi bi-tree',
      
      // Servicios
      'servicios': 'bi bi-tools',
      'construccion': 'bi bi-hammer',
      'reparaciones': 'bi bi-wrench-adjustable',
      'limpieza': 'bi bi-droplet',
      'jardineria': 'bi bi-flower1',
      'plomeria': 'bi bi-wrench-adjustable',
      'electricidad': 'bi bi-lightning',
      
      // Trabajo y Empleo
      'trabajo': 'bi bi-briefcase',
      'empleo': 'bi bi-briefcase',
      'profesional': 'bi bi-person-badge',
      
      // Mascotas y Animales
      'mascotas': 'bi bi-heart',
      'animales': 'bi bi-heart',
      'perros': 'bi bi-heart',
      'gatos': 'bi bi-heart',
      'veterinaria': 'bi bi-heart-pulse',
      
      // Bebés y Niños
      'bebes': 'bi bi-baby-carriage',
      'niños': 'bi bi-baby-carriage',
      'juguetes': 'bi bi-balloon',
      'infantil': 'bi bi-baby-carriage',
      
      // Libros y Educación
      'libros': 'bi bi-book',
      'educacion': 'bi bi-mortarboard',
      'cursos': 'bi bi-journal-bookmark',
      'universidad': 'bi bi-mortarboard',
      
      // Música e Instrumentos
      'musica': 'bi bi-music-note-beamed',
      'instrumentos': 'bi bi-music-note-beamed',
      'guitarra': 'bi bi-music-note-beamed',
      'piano': 'bi bi-music-note-beamed',
      
      // Salud y Belleza
      'salud': 'bi bi-heart-pulse',
      'cosmeticos': 'bi bi-palette2',
      'farmacia': 'bi bi-capsule',
      
      // Comida y Bebidas
      'comida': 'bi bi-cup-hot',
      'restaurante': 'bi bi-cup-hot',
      'bebidas': 'bi bi-cup-straw',
      'alimentos': 'bi bi-basket'
    };
    
    // Buscar por coincidencia exacta o parcial
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key) || key.includes(name)) {
        return icon;
      }
    }
    
    // Icono por defecto si no se encuentra coincidencia
    return 'bi bi-tag';
  }
} 