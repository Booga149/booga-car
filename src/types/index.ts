// Product Types
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  condition: 'جديد' | 'مستعمل';
  stock: 'متوفر' | 'غير متوفر';
  shipping: 'مجاني' | 'عادي';
  rating: number;
  reviews: number;
  image: string;
  color?: string;
  description?: string;
  seller_id?: string;
  is_verified_seller?: boolean;
  seller_name?: string;
  part_number?: string;
  stock_quantity?: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'seller';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  id: string;
  user_id: string | null;
  total: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  seller_id?: string;
  commission_rate?: number;
  platform_fee?: number;
  seller_net?: number;
}

// Address Types
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

// Vehicle Types
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  description: string;
  images: string[];
  sellerId: string;
  status: 'available' | 'sold' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
