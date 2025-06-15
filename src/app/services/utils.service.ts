import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  /**
   * Formatea precio en soles peruanos
   */
  formatPrice(price: number): string {
    if (!price || price === 0) {
      return 'Precio a consultar';
    }
    
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  /**
   * Formatea precio simple con símbolo S/
   */
  formatPriceSimple(price: number): string {
    if (!price || price === 0) {
      return 'S/ --';
    }
    
    return `S/ ${price.toLocaleString('es-PE')}`;
  }

  /**
   * Obtiene tiempo relativo en español peruano
   */
  getTimeAgo(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    if (diffInMinutes < 10080) return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
    if (diffInMinutes < 43200) return `Hace ${Math.floor(diffInMinutes / 10080)} semanas`;
    return `Hace ${Math.floor(diffInMinutes / 43200)} meses`;
  }

  /**
   * Valida número de teléfono peruano
   */
  isValidPeruvianPhone(phone: string): boolean {
    // Formato peruano: +51 9XXXXXXXX o 9XXXXXXXX
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Celular peruano: 9 dígitos empezando con 9
    if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
      return true;
    }
    
    // Con código de país: 11 dígitos (51 + 9XXXXXXXX)
    if (cleanPhone.length === 11 && cleanPhone.startsWith('519')) {
      return true;
    }
    
    return false;
  }

  /**
   * Formatea número de teléfono peruano para WhatsApp
   */
  formatPhoneForWhatsApp(phone: string): string {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Si ya tiene código de país
    if (cleanPhone.startsWith('51') && cleanPhone.length === 11) {
      return cleanPhone;
    }
    
    // Si es número local de 9 dígitos
    if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
      return `51${cleanPhone}`;
    }
    
    return cleanPhone;
  }

  /**
   * Obtiene ubicaciones de Tingo María
   */
  getTingoMariaLocations(): string[] {
    return [
      'Tingo María Centro',
      'Rupa Rupa',
      'Castillo Grande', 
      'Supte San Jorge',
      'Pueblo Nuevo',
      'Las Palmas',
      'Pendencia',
      'Naranjillo',
      'Bella',
      'Monzón'
    ];
  }

  /**
   * Trunca texto con puntos suspensivos
   */
  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Genera mensaje de WhatsApp para contactar vendedor
   */
  generateWhatsAppMessage(productTitle: string, price?: number): string {
    let message = `¡Hola! Vi tu anuncio en AvisOnline: "${productTitle}".`;
    
    if (price && price > 0) {
      message += ` ¿El precio de ${this.formatPriceSimple(price)} es negociable?`;
    }
    
    message += ' ¿Está disponible? ¿Podemos coordinar para verlo?';
    
    return message;
  }
} 