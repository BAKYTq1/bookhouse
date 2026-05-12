import { mockBooks } from '../data/books';
import { Book } from '../types';
import { mapBookRecord, BookRecord } from '../lib/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type BookInput = Omit<Book, 'id'>;

const toBookRecordInput = (book: BookInput) => ({
  title: book.title,
  author: book.author,
  description: book.description,
  price: book.price,
  rating: book.rating,
  cover_image: book.coverImage,
  category: book.category,
  published_year: book.publishedYear,
  isbn: book.isbn,
  stock: book.stock,
});

export const getBooks = async (): Promise<Book[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return mockBooks;
  }

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as BookRecord[]).map(mapBookRecord);
};

export const createBook = async (book: BookInput): Promise<Book> => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('books')
    .insert(toBookRecordInput(book))
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapBookRecord(data as BookRecord);
};

export const updateBook = async (id: string, book: BookInput): Promise<Book> => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('books')
    .update(toBookRecordInput(book))
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapBookRecord(data as BookRecord);
};

export const deleteBook = async (id: string): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('books').delete().eq('id', id);

  if (error) {
    throw error;
  }
};
