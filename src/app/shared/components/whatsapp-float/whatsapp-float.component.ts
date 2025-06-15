import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-float.component.html',
  styleUrls: ['./whatsapp-float.component.scss']
})
export class WhatsappFloatComponent implements OnInit {
  
  isVisible = true;
  isExpanded = false;
  
  // Información de contacto
  contactInfo = {
    phone: '+51964261822',
    name: 'AvisOnline',
    message: 'Estoy interesado en publicar un aviso, me gustaría recibir información.'
  };

  constructor() { }

  ngOnInit(): void {
    // Mostrar el botón después de 3 segundos
    setTimeout(() => {
      this.isVisible = true;
    }, 3000);
  }

  /**
   * Abre WhatsApp con mensaje predefinido
   */
  openWhatsApp(): void {
    const message = encodeURIComponent(this.contactInfo.message);
    const whatsappUrl = `https://wa.me/${this.contactInfo.phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Abre el grupo de WhatsApp
   */
  joinWhatsAppGroup(): void {
    const groupUrl = 'https://chat.whatsapp.com/Io3PlFTlasB38v4B9Vm2Us';
    window.open(groupUrl, '_blank');
  }

  /**
   * Expande/contrae el widget
   */
  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Cierra el widget
   */
  closeWidget(): void {
    this.isVisible = false;
  }

  /**
   * Obtiene la hora actual formateada
   */
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
} 