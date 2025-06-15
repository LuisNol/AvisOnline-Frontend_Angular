export interface Announcement {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  categoryId: number;
  image?: string;
  images?: string[];
  created_at: string;
  updated_at?: string;
  views: number;
  featured: boolean;
  condition?: 'nuevo' | 'como_nuevo' | 'buen_estado' | 'usado' | 'necesita_reparacion';
  seller?: AnnouncementSeller;
  slug?: string;
  status?: 'active' | 'inactive' | 'sold' | 'expired';
  contactInfo?: ContactInfo;
}

export interface AnnouncementSeller {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  memberSince: string;
  rating?: number;
  totalAnnouncements?: number;
  avatar?: string;
  bio?: string;
  city?: string;
  surname?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  preferredContact: 'phone' | 'email' | 'both';
  availableHours?: string;
}

// INTERFACES PARA EL BACKEND (ProductResource)
export interface BackendProductResponse {
  product: BackendProduct;
  related_products: BackendProduct[];
}

export interface BackendProduct {
  id: number;
  title: string;
  slug: string;
  sku: string;
  price_pen: number;
  imagen: string;
  state: number;
  description: string;
  tags: string[];
  categorie_first_id: number;
  categorie_first: {
    id: number;
    name: string;
  } | null;
  location: string;
  contact_phone: string;
  contact_email: string;
  expires_at: string;
  views_count: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    avatar: string | null;
    bio: string;
    address_city: string;
    member_since: string;
  } | null;
  created_at: string;
  images: Array<{
    id: number;
    imagen: string;
  }>;
}

export interface AnnouncementFilters {
  search?: string;
  category?: string;
  categoryId?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: 'recent' | 'price-low' | 'price-high' | 'views' | 'featured';
  page?: number;
  limit?: number;
}

export interface AnnouncementResponse {
  announcements: Announcement[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CreateAnnouncementRequest {
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId: number;
  condition?: string;
  images?: File[];
  contactInfo: ContactInfo;
} 