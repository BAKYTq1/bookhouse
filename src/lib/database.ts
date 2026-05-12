import { Book, Order, OrderStatus, User } from '../types';

export interface BookRecord {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  rating: number;
  cover_image: string;
  category: string;
  published_year: number;
  isbn: string;
  stock: number;
  created_at?: string;
}

export interface OrderRow {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  created_at: string;
  order_items?: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    books: BookRecord | null;
  }>;
}

export interface ProfileRecord {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  role?: 'customer' | 'admin';
}

export const mapBookRecord = (record: BookRecord): Book => ({
  id: record.id,
  title: record.title,
  author: record.author,
  description: record.description,
  price: Number(record.price),
  rating: Number(record.rating),
  coverImage: record.cover_image,
  category: record.category,
  publishedYear: record.published_year,
  isbn: record.isbn,
  stock: record.stock,
});

export const mapProfileRecord = (record: ProfileRecord): User => ({
  id: record.id,
  email: record.email,
  name: record.name?.trim() || record.email.split('@')[0] || 'User',
  phone: record.phone ?? undefined,
  address: record.address ?? undefined,
  role: record.role ?? 'customer',
});

export const mapOrderRow = (row: OrderRow): Order => ({
  id: row.id,
  userId: row.user_id,
  total: Number(row.total),
  status: row.status,
  createdAt: row.created_at,
  shippingInfo: {
    name: row.shipping_name,
    phone: row.shipping_phone,
    address: row.shipping_address,
  },
  items: (row.order_items ?? [])
    .filter(item => item.books)
    .map(item => ({
      quantity: item.quantity,
      book: mapBookRecord(item.books as BookRecord),
    })),
});
