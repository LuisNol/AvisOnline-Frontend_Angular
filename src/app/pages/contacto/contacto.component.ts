import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss']
})
export class ContactoComponent implements OnInit {

  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;



  // Información de contacto
  contactInfo = {
    address: 'Tingo María, Huánuco',
    phone: '+51 964 261 822',
    email: 'avisonlinestoreperu@gmail.com',
    whatsapp: '+51 964 261 822',
    hours: 'Puede contactar en cualquier momento. Responderemos lo antes posible.'
  };

  // Configuración de EmailJS
  private emailConfig = environment.emailjs;

  // Redes sociales
  socialLinks = [
    {
      name: 'Facebook',
      icon: 'bi-facebook',
      url: 'https://facebook.com/avisonline',
      color: '#1877f2'
    },
    {
      name: 'Instagram',
      icon: 'bi-instagram',
      url: 'https://instagram.com/avisonline',
      color: '#e4405f'
    },
    {
      name: 'WhatsApp',
      icon: 'bi-whatsapp',
      url: 'https://wa.me/51964261822',
      color: '#25d366'
    },
    //{
      //name: 'YouTube',
      //icon: 'bi-youtube',
      //url: 'https://youtube.com/@avisonline',
      //color: '#ff0000'
    //}
  ];

  // Preguntas frecuentes
  faqs = [
    {
      question: '¿Cómo publico un anuncio?',
      answer: 'Publicar un anuncio es muy fácil. Solo haz clic en "Publicar Gratis" en el header, registra tu cuenta o inicia sesión, completa los detalles de tu anuncio y haz clic en "Publicar Anuncio". Tu anuncio estará visible inmediatamente.',
      isOpen: false
    },
    {
      question: '¿Es gratis publicar anuncios?',
      answer: 'Sí, publicar anuncios básicos en AvisOnline es completamente gratis. Tienes hasta 5 anuncios gratuitos. Si deseas destacar tu anuncio o agregar imágenes adicionales, puedes optar por nuestros planes premium que pronto estarán disponibles.',
      isOpen: false
    },
    {
      question: '¿Cómo contacto con un vendedor?',
      answer: 'En cada anuncio encontrarás los datos de contacto que el anunciante ha proporcionado. Puede ser WhatsApp, email o telefóno. También podrás ver algun medio de contacto en la imagen del anuncio.',
      isOpen: false
    },
    {
      question: '¿Puedo editar mi anuncio después de publicarlo?',
      answer: 'Sí, puedes editar tu anuncio en cualquier momento desde tu panel de usuario. Solo necesitas iniciar sesión y acceder a la lista de tu anuncios para que en acciones puedas editarlo.',
      isOpen: false
    },
    {
      question: '¿Qué tipo de anuncio puedo publicar?',
      answer: 'Puedes publicar anuncios de cualquier tipo de producto o servicio que desees vender. Desde artículos nuevos hasta usados, servicios profesionales, alquileres y más. Asegúrate de rellenar bien tus medios de contacto para que puedan comunicarte.',
      isOpen: false
    }
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // Scroll to top when component loads
    window.scrollTo(0, 0);
  }

  // Enviar formulario de contacto
  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitError = false;

      // Preparar los datos del formulario
      const formData = {
        from_name: this.contactForm.get('name')?.value,
        from_email: this.contactForm.get('email')?.value,
        phone: this.contactForm.get('phone')?.value,
        subject: this.contactForm.get('subject')?.value,
        message: this.contactForm.get('message')?.value,
        to_email: this.contactInfo.email // Email de destino
      };

      // Enviar email usando EmailJS
      this.sendEmailWithParams(formData);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  // Verificar si un campo tiene errores
  hasError(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Obtener mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return 'Formato inválido';
    }
    return '';
  }

  // Abrir/cerrar FAQ
  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  // Abrir enlace social
  openSocialLink(url: string): void {
    window.open(url, '_blank');
  }

  // Abrir WhatsApp
  openWhatsApp(): void {
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre AvisOnline.');
    window.open(`https://wa.me/51964261822?text=${message}`, '_blank');
  }

  // Llamar por teléfono
  callPhone(): void {
    window.location.href = `tel:${this.contactInfo.phone}`;
  }

  // Enviar email
  sendEmail(): void {
    window.location.href = `mailto:${this.contactInfo.email}`;
  }

  // Método auxiliar para enviar email con parámetros
  private sendEmailWithParams(params: any): void {
    emailjs.send(
      this.emailConfig.serviceId,
      this.emailConfig.templateId,
      params,
      this.emailConfig.publicKey
    ).then(
      (response) => {
        console.log('Email enviado exitosamente:', response);
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.contactForm.reset();
        
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);
      },
      (error) => {
        console.error('Error al enviar email:', error);
        this.isSubmitting = false;
        this.submitError = true;
        
        // Ocultar mensaje de error después de 5 segundos
        setTimeout(() => {
          this.submitError = false;
        }, 5000);
      }
    );
  }


} 