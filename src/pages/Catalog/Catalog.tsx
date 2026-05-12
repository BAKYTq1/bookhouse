import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { BookCard, Input, Pagination, Loader } from '../../components/common';
import { SortOption } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBooks } from '../../contexts/BooksContext';
import { getCategoryLabel } from '../../i18n/translations';
import styles from './Catalog.module.scss';

const ITEMS_PER_PAGE = 9;

export const Catalog = () => {
  const { language, t } = useLanguage();
  const { books, categories, loading: booksLoading } = useBooks();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = sortedBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setLoading(true);
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category !== 'All') {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
    setTimeout(() => setLoading(false), 300);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.catalog}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('catalog.title')}</h1>

        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <Input
              type="text"
              placeholder={t('catalog.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              fullWidth
            />
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>{t('catalog.category')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={styles.select}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryLabel(language, category as Parameters<typeof getCategoryLabel>[1])}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>{t('catalog.sortBy')}</label>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className={styles.select}
              >
                <option value="default">{t('catalog.sort.default')}</option>
                <option value="price-asc">{t('catalog.sort.priceAsc')}</option>
                <option value="price-desc">{t('catalog.sort.priceDesc')}</option>
                <option value="rating">{t('catalog.sort.rating')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.results}>
          <p>{t('catalog.booksFound', { count: sortedBooks.length })}</p>
        </div>

        {loading || booksLoading ? (
          <div className={styles.loadingContainer}>
            <Loader size="large" />
          </div>
        ) : paginatedBooks.length > 0 ? (
          <>
            <div className={styles.booksGrid}>
              {paginatedBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>{t('catalog.noBooks')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
