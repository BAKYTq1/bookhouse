import { useNavigate } from 'react-router-dom';
import { BookCard, Button } from '../../components/common';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBooks } from '../../contexts/BooksContext';
import { getCategoryLabel } from '../../i18n/translations';
import styles from './Home.module.scss';

export const Home = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { books, categories } = useBooks();
  const popularBooks = books.slice(0, 6);
  const featuredCategories = categories.filter(cat => cat !== 'All');

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('home.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>{t('home.heroSubtitle')}</p>
          <Button size="large" onClick={() => navigate('/catalog')}>
            {t('home.browseCatalog')}
          </Button>
        </div>
      </section>

      <section className={styles.popularBooks}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('home.popularBooks')}</h2>
          <div className={styles.booksGrid}>
            {popularBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          <div className={styles.viewMore}>
            <Button variant="outline" onClick={() => navigate('/catalog')}>
              {t('home.viewAllBooks')}
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.categories}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('home.browseByCategory')}</h2>
          <div className={styles.categoriesGrid}>
            {featuredCategories.map(category => (
              <div
                key={category}
                className={styles.categoryCard}
                onClick={() => navigate(`/catalog?category=${category}`)}
              >
                <h3>{getCategoryLabel(language, category as Parameters<typeof getCategoryLabel>[1])}</h3>
                <p>{t('home.exploreCategoryBooks', {
                  category: getCategoryLabel(language, category as Parameters<typeof getCategoryLabel>[1]),
                })}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.promo}>
        <div className={styles.promoContent}>
          <h2>{t('home.communityTitle')}</h2>
          <p>{t('home.communitySubtitle')}</p>
          <Button size="large" variant="secondary" onClick={() => navigate('/register')}>
            {t('home.signUpNow')}
          </Button>
        </div>
      </section>
    </div>
  );
};
