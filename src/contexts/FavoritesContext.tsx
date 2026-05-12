import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Book } from '../types';

interface FavoritesContextType {
  favorites: Book[];
  isFavorite: (bookId: string) => boolean;
  toggleFavorite: (book: Book) => void;
  clearFavorites: () => void;
  getFavoritesCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'bookhouse_favorites';

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Book[]>(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const value = useMemo<FavoritesContextType>(() => ({
    favorites,
    isFavorite: (bookId) => favorites.some((book) => book.id === bookId),
    toggleFavorite: (book) => {
      setFavorites((prevFavorites) => {
        const exists = prevFavorites.some((item) => item.id === book.id);
        if (exists) {
          return prevFavorites.filter((item) => item.id !== book.id);
        }

        return [book, ...prevFavorites];
      });
    },
    clearFavorites: () => setFavorites([]),
    getFavoritesCount: () => favorites.length,
  }), [favorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }

  return context;
};
