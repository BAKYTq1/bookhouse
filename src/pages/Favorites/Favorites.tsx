import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookCard, Button } from '../../components/common';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './Favorites.module.scss';

export const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, clearFavorites } = useFavorites();
  const { t } = useLanguage();

  if (!favorites.length) {
    return (
      <div className={styles.emptyState}>
        <Heart size={64} />
        <h1>{t('favorites.emptyTitle')}</h1>
        <p>{t('favorites.emptySubtitle')}</p>
        <Button onClick={() => navigate('/catalog')}>{t('favorites.browseCatalog')}</Button>
      </div>
    );
  }

  return (
    <div className={styles.favorites}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>{t('favorites.title')}</h1>
            <p>{t('favorites.count', { count: favorites.length })}</p>
          </div>
          <Button variant="outline" onClick={clearFavorites}>
            {t('favorites.clear')}
          </Button>
        </div>

        <div className={styles.grid}>
          {favorites.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
};
