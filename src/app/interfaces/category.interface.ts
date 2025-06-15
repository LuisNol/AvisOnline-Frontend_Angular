export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color?: string;
  count: number;
  parentId?: number;
  children?: Category[];
  image?: string;
  isActive: boolean;
  sortOrder?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithStats extends Category {
  announcementsCount: number;
  featuredAnnouncements?: number;
  averagePrice?: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface CategoryFilters {
  search?: string;
  parentId?: number;
  isActive?: boolean;
  sortBy?: 'name' | 'count' | 'recent';
  limit?: number;
}

export interface CategoryResponse {
  categories: Category[];
  total: number;
} 