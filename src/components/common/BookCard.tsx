import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Book } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Card } from './Card';
import { Button } from './Button';
import { getCategoryLabel } from '../../i18n/translations';
import styles from './BookCard.module.scss';

interface BookCardProps {
  book: Book;
}

export const BookCard = ({ book }: BookCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language, t } = useLanguage();
  const favorite = isFavorite(book.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(book);
  };

  return (
    <Card className={styles.bookCard} onClick={() => navigate(`/book/${book.id}`)} hover>
      <div className={styles.imageWrapper}>
        <button
          type="button"
          className={`${styles.favoriteButton} ${favorite ? styles.active : ''}`}
          onClick={handleToggleFavorite}
          aria-label={favorite ? t('favorites.remove') : t('favorites.add')}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <img src={book.coverImage} alt={book.title} className={styles.coverImage} />
        <div className={styles.overlay}>
          <Button onClick={handleAddToCart} size="small">
            <ShoppingCart size={16} />
            {t('book.addToCart')}
          </Button>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>{book.author}</p>
        <div className={styles.rating}>
          <Star size={16} fill="currentColor" />
          <span>{book.rating}</span>
        </div>
        <div className={styles.footer}>
          <span className={styles.price}>${book.price.toFixed(2)}</span>
          <span className={styles.category}>{getCategoryLabel(language, book.category as Parameters<typeof getCategoryLabel>[1])}</span>
        </div>
      </div>
    </Card>
  );
};
