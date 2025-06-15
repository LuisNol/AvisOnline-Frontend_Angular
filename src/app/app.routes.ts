import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'anuncios',
    loadComponent: () => import('./pages/announcements/announcements-list/announcements-list.component').then(m => m.AnnouncementsListComponent)
  },
  {
    path: 'anuncio/:slug',
    loadComponent: () => import('./pages/announcements/announcement-detail/announcement-detail.component').then(m => m.AnnouncementDetailComponent)
  },
  {
    path: 'categorias',
    loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./pages/nosotros/nosotros.component').then(m => m.NosotrosComponent)
  },
  {
    path: 'contactanos',
    loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
