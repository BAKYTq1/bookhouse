import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { categories as fallbackCategories } from '../data/books';
import { Book } from '../types';
import { BookInput, createBook, deleteBook, getBooks, updateBook } from '../services/books';

interface BooksContextType {
  books: Book[];
  categories: string[];
  loading: boolean;
  error: string;
  refreshBooks: () => Promise<void>;
  createBook: (book: BookInput) => Promise<void>;
  updateBook: (id: string, book: BookInput) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export const BooksProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshBooks = async () => {
    setLoading(true);
    setError('');

    try {
      const nextBooks = await getBooks();
      setBooks(nextBooks);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshBooks();
  }, []);

  const value = useMemo<BooksContextType>(() => {
    const categories = Array.from(
      new Set([...fallbackCategories, ...books.map(book => book.category)])
    );

    return {
      books,
      categories,
      loading,
      error,
      refreshBooks,
      createBook: async (book) => {
        const created = await createBook(book);
        setBooks(prev => [created, ...prev]);
      },
      updateBook: async (id, book) => {
        const updated = await updateBook(id, book);
        setBooks(prev => prev.map(item => item.id === id ? updated : item));
      },
      deleteBook: async (id) => {
        await deleteBook(id);
        setBooks(prev => prev.filter(book => book.id !== id));
      },
    };
  }, [books, loading, error]);

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};

export const useBooks = () => {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks must be used within BooksProvider');
  }

  return context;
};
