export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  statusCode?: number;
}

export interface HomePageData {
  featuredAnnouncements: any[];
  recentAnnouncements: any[];
  popularCategories: any[];
  statistics: {
    totalAnnouncements: number;
    totalUsers: number;
    totalCategories: number;
  };
  sliders?: any[];
}

export interface SearchFilters {
  query?: string;
  categoryId?: number;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface UploadResponse {
  success: boolean;
  files: {
    id: number;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  }[];
} 