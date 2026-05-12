export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  rating: number;
  coverImage: string;
  category: string;
  subcategory?: string;
  publishedYear: number;
  isbn: string;
  stock: number;
  inStock: boolean;
  relatedBooks?: string[];
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role?: 'customer' | 'admin';
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
  };
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  address: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating';
export type Theme = 'light' | 'dark';
