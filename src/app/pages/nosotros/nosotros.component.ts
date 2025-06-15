import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.scss']
})
export class NosotrosComponent implements OnInit {

 // Datos del equipo
 teamMembers = [
  {
    name: 'Jeferson Rodriguez Cotaquispe',
    position: 'Estudiante de Ingeniería en Informática y Sistemas',
    description: 'Estudiante de la Universidad Nacional Agraria de la Selva, apasionado por la tecnología y el desarrollo de software.',
    image: 'assets/images/Jeferson.jpg',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'jeferson@avisonline.com'
    }
  },
   {
    name: 'Nolberto Sumaran Pimentel',
    position: 'Estudiante de Ingeniería en Informática y Sistemas',
    description: 'Estudiante de la Universidad Nacional Agraria de la Selva, motivado por la innovación tecnológica y con interés en el desarrollo de software, la infraestructura TI y la computación en la nube.',
    image: 'assets/images/Sumaran.jpeg',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'luisnolberto@avisonline.com'
    }
  },
  {
    name: 'Jesus Noriel Chavez Durand',
    position: 'Estudiante de Ingeniería en Informática y Sistemas',
    description: 'Estudiante de la Universidad Nacional Agraria de la Selva, entusiasta de la innovación y el trabajo en equipo.',
    image: 'assets/images/Noriel.jpg',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'jesusnoriel@avisonline.com'
    }
  },
  {
    name: 'Junior Edinson Matias Bardales',
    position: 'Estudiante de Ingeniería en Informática y Sistemas',
    description: 'Estudiante de la Universidad Nacional Agraria de la Selva, motivado por los retos tecnológicos y el aprendizaje continuo.',
    image: 'assets/images/Edy.jpeg',
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'junioredinson@avisonline.com'
    }
  }
 
];

  // Estadísticas de la empresa
  stats = [
    {
      number: '50,000+',
      label: 'Usuarios Registrados',
      icon: 'bi-people-fill'
    },
    {
      number: '25,000+',
      label: 'Anuncios Publicados',
      icon: 'bi-megaphone-fill'
    },
    {
      number: '15+',
      label: 'Categorías Disponibles',
      icon: 'bi-grid-3x3-gap-fill'
    },
    {
      number: '99.9%',
      label: 'Tiempo de Actividad',
      icon: 'bi-shield-check-fill'
    }
  ];

  // Valores de la empresa
  values = [
    {
      title: 'Confianza',
      description: 'Construimos relaciones sólidas basadas en la transparencia y la honestidad.',
      icon: 'bi-shield-fill'
    },
    {
      title: 'Innovación',
      description: 'Constantemente mejoramos nuestra plataforma con las últimas tecnologías.',
      icon: 'bi-lightbulb'
    },
    {
      title: 'Comunidad',
      description: 'Fomentamos conexiones genuinas entre compradores y vendedores.',
      icon: 'bi-people-fill'
    },
    {
      title: 'Simplicidad',
      description: 'Hacemos que comprar y vender sea fácil, rápido y seguro.',
      icon: 'bi-check-circle'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Scroll to top when component loads
    window.scrollTo(0, 0);
  }

  // Método para abrir enlaces sociales
  openSocialLink(url: string): void {
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  }

  // Método para enviar email
  sendEmail(email: string): void {
    window.location.href = `mailto:${email}`;
  }

  // Método para hacer scroll suave hacia la sección "about"
  scrollToAbout(): void {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      const elementPosition = aboutSection.offsetTop;
      const offsetPosition = elementPosition - 80; // Offset de 80px hacia arriba
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
} 