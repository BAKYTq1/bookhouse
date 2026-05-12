import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Heart } from 'lucide-react';
import { Button, BookCard, Loader } from '../../components/common';
import { useCart } from '../../contexts/CartContext';
import { Book } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBooks } from '../../contexts/BooksContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { getCategoryLabel } from '../../i18n/translations';
import styles from './BookDetails.module.scss';

export const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language, t } = useLanguage();
  const { books, loading: booksLoading } = useBooks();
  const [book, setBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (booksLoading) {
      setLoading(true);
      return;
    }

    const foundBook = books.find(b => b.id === id);
    setBook(foundBook || null);
    setLoading(false);
  }, [books, booksLoading, id]);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!book) {
    return (
      <div className={styles.notFound}>
        <h2>{t('book.notFound')}</h2>
        <Button onClick={() => navigate('/catalog')}>{t('book.backToCatalog')}</Button>
      </div>
    );
  }

  const relatedBooks = books
    .filter(b => b.category === book.category && b.id !== book.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(book);
    }
  };

  const favorite = isFavorite(book.id);

  return (
    <div className={styles.bookDetails}>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          {t('book.back')}
        </button>

        <div className={styles.detailsGrid}>
          <div className={styles.imageSection}>
            <img src={book.coverImage} alt={book.title} className={styles.coverImage} />
          </div>

          <div className={styles.infoSection}>
            <span className={styles.category}>{getCategoryLabel(language, book.category as Parameters<typeof getCategoryLabel>[1])}</span>
            <h1 className={styles.title}>{book.title}</h1>
            <p className={styles.author}>{t('book.byAuthor', { author: book.author })}</p>

            <div className={styles.rating}>
              <Star size={20} fill="currentColor" />
              <span>{book.rating}</span>
              <span className={styles.ratingCount}>{t('book.reviews', { count: 245 })}</span>
            </div>

            <div className={styles.price}>${book.price.toFixed(2)}</div>

            <div className={styles.description}>
              <h3>{t('book.description')}</h3>
              <p>{book.description}</p>
            </div>

            <div className={styles.bookInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>{t('book.isbn')}</span>
                <span>{book.isbn}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>{t('book.published')}</span>
                <span>{book.publishedYear}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>{t('book.inStock')}</span>
                <span>{t('book.copies', { count: book.stock })}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <div className={styles.quantitySelector}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={styles.quantityButton}
                >
                  -
                </button>
                <span className={styles.quantity}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
              <Button onClick={handleAddToCart} size="large" fullWidth>
                <ShoppingCart size={20} />
                {t('book.addToCart')}
              </Button>
              <button
                type="button"
                className={`${styles.favoriteButton} ${favorite ? styles.favoriteActive : ''}`}
                onClick={() => toggleFavorite(book)}
                aria-label={favorite ? t('favorites.remove') : t('favorites.add')}
              >
                <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {relatedBooks.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className={styles.sectionTitle}>{t('book.related')}</h2>
            <div className={styles.relatedGrid}>
              {relatedBooks.map(relatedBook => (
                <BookCard key={relatedBook.id} book={relatedBook} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
