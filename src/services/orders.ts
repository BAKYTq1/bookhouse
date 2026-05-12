import { Order, OrderStatus } from '../types';
import { mapOrderRow, OrderRow } from '../lib/database';
import { supabase } from '../lib/supabase';

export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        books (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as OrderRow[]).map(mapOrderRow);
};

export const getAllOrders = async (): Promise<Order[]> => {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        books (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as OrderRow[]).map(mapOrderRow);
};

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data: createdOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: order.userId,
      total: order.total,
      status: order.status,
      shipping_name: order.shippingInfo.name,
      shipping_phone: order.shippingInfo.phone,
      shipping_address: order.shippingInfo.address,
    })
    .select('*')
    .single();

  if (orderError) {
    throw orderError;
  }

  const itemsPayload = order.items.map(item => ({
    order_id: createdOrder.id,
    book_id: item.book.id,
    quantity: item.quantity,
    unit_price: item.book.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);

  if (itemsError) {
    throw itemsError;
  }

  return mapOrderRow({
    ...(createdOrder as OrderRow),
    order_items: order.items.map(item => ({
      id: `${createdOrder.id}-${item.book.id}`,
      quantity: item.quantity,
      unit_price: item.book.price,
      books: {
        id: item.book.id,
        title: item.book.title,
        author: item.book.author,
        description: item.book.description,
        price: item.book.price,
        rating: item.book.rating,
        cover_image: item.book.coverImage,
        category: item.book.category,
        published_year: item.book.publishedYear,
        isbn: item.book.isbn,
        stock: item.book.stock,
      },
    })),
  });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

  if (error) {
    throw error;
  }
};
