export interface Product {
  _id?: string;
  id?: string; // For backward compatibility
  name: string;
  slug?: string;
  description: string;
  price: number;
  discountPrice?: number;
  currentPrice?: number;
  category?: Category | string; // Can be ObjectId or populated Category
  sizes?: ProductSize[];
  images?: ProductImage[];
  isDeleted?: boolean;
  deletedAt?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Computed properties for backward compatibility
  stock?: number; // Total stock from all sizes
  imageUrl?: string; // Primary image URL
}

export interface ProductSize {
  size: string;
  stock: number;
  _id?: string;
}

export interface ProductImage {
  url: string;
  publicId?: string;
  _id?: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string; // ObjectId
  sizes?: ProductSize[];
  images?: ProductImage[];
}

export interface Category {
  _id?: string;
  id?: string; // For backward compatibility
  name: string;
  slug?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
