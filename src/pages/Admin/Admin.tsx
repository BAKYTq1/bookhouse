import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button, Input, Loader } from '../../components/common';
import { AdminLayout, AdminLayoutSection } from '../../components/layout';
import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BooksContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getAllOrders, updateOrderStatus } from '../../services/orders';
import { getAllProfiles } from '../../services/profiles';
import { Book, Order, OrderStatus, User as AppUser } from '../../types';
import { localeByLanguage } from '../../i18n/translations';
import styles from './Admin.module.scss';

const emptyForm = {
  title: '',
  author: '',
  description: '',
  price: 0,
  rating: 0,
  coverImage: '',
  category: 'Classic',
  publishedYear: new Date().getFullYear(),
  isbn: '',
  stock: 0,
};

const adminSections = ['dashboard', 'books', 'users', 'orders'] as const;
type AdminSection = (typeof adminSections)[number];

export const Admin = () => {
  const { section } = useParams<{ section?: string }>();
  const currentSection: AdminSection = (section as AdminSection) || 'dashboard';

  const { user, loading: authLoading } = useAuth();
  const { books, categories, loading: booksLoading, createBook, updateBook, deleteBook, refreshBooks } = useBooks();
  const { language, t } = useLanguage();
  const [form, setForm] = useState(emptyForm);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categoryOptions = useMemo(
    () => categories.filter(category => category !== 'All'),
    [categories]
  );

  const categoryKeyMap: Record<string, string> = {
    All: 'category.all',
    Classic: 'category.classic',
    Fantasy: 'category.fantasy',
    'Science Fiction': 'category.scienceFiction',
    Mystery: 'category.mystery',
    Romance: 'category.romance',
    Fiction: 'category.fiction',
  };

  const getCategoryLabel = (category: string) => t(categoryKeyMap[category] ?? category);
  const getStatusLabel = (status: OrderStatus) => t(`status.${status}`);

  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
  const todayOrdersCount = orders.filter(order => {
    const now = new Date();
    const date = new Date(order.createdAt);
    return date.getDate() === now.getDate()
      && date.getMonth() === now.getMonth()
      && date.getFullYear() === now.getFullYear();
  }).length;

  useEffect(() => {
    if (!user || user.role !== 'admin' || !isSupabaseConfigured) {
      return;
    }

    setOrdersLoading(true);
    setUsersLoading(true);

    getAllOrders()
      .then(setOrders)
      .catch(fetchError => {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load orders');
      })
      .finally(() => setOrdersLoading(false));

    getAllProfiles()
      .then(setUsers)
      .catch(fetchError => {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load users');
      })
      .finally(() => setUsersLoading(false));
  }, [user]);

  if (!adminSections.includes(currentSection)) {
    return <Navigate to="/admin" replace />;
  }

  if (authLoading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const resetForm = () => {
    setForm({
      ...emptyForm,
      category: categoryOptions[0] ?? 'Classic',
    });
    setEditingBookId(null);
  };

  const handleEdit = (book: Book) => {
    setEditingBookId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      rating: book.rating,
      coverImage: book.coverImage,
      category: book.category,
      publishedYear: book.publishedYear,
      isbn: book.isbn,
      stock: book.stock,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingBookId) {
        await updateBook(editingBookId, form);
      } else {
        await createBook(form);
      }
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    setError('');
    try {
      await deleteBook(bookId);
      if (editingBookId === bookId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete book');
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order));
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Failed to update order');
    }
  };



  const sections: AdminLayoutSection[] = [
    { key: 'dashboard', to: '/admin', label: t('admin.dashboard') },
    { key: 'books', to: '/admin/books', label: t('admin.booksList') },
    { key: 'users', to: '/admin/users', label: t('admin.usersTitle') },
    { key: 'orders', to: '/admin/orders', label: t('admin.ordersTitle') },
  ];

  return (
    <AdminLayout
      title={t('admin.title')}
      subtitle={t('admin.subtitle')}
      sections={sections}
      actions={(
        <Button variant="outline" onClick={() => void refreshBooks()}>
          {t('admin.refresh')}
        </Button>
      )}
      notices={(
        <>
          {!isSupabaseConfigured && (
            <div className={styles.warning}>{t('admin.supabaseWarning')}</div>
          )}
          {error && <div className={styles.warning}>{error}</div>}
        </>
      )}
    >
      {currentSection === 'dashboard' && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>{t('admin.dashboard')}</h2>
          </div>
          <div className={styles.statsGrid}>
            <article className={styles.statCard}>
              <div className={styles.muted}>{t('admin.booksList')}</div>
              <strong>{books.length}</strong>
            </article>
            <article className={styles.statCard}>
              <div className={styles.muted}>{t('admin.usersTitle')}</div>
              <strong>{users.length}</strong>
            </article>
            <article className={styles.statCard}>
              <div className={styles.muted}>{t('admin.ordersTitle')}</div>
              <strong>{orders.length}</strong>
            </article>
            <article className={styles.statCard}>
              <div className={styles.muted}>{t('admin.pendingOrders')}</div>
              <strong>{pendingOrdersCount}</strong>
            </article>
            <article className={styles.statCard}>
              <div className={styles.muted}>{t('admin.todayOrders')}</div>
              <strong>{todayOrdersCount}</strong>
            </article>
          </div>
        </section>
      )}

      {currentSection === 'books' && (
        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>{editingBookId ? t('admin.editBook') : t('admin.addBook')}</h2>
            </div>

            <form className={styles.bookForm} onSubmit={handleSubmit}>
              <Input
                label={t('admin.bookTitle')}
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                required
                fullWidth
              />
              <Input
                label={t('admin.bookAuthor')}
                value={form.author}
                onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
                required
                fullWidth
              />

              <div className={styles.field}>
                <label>{t('admin.bookDescription')}</label>
                <textarea
                  className={styles.textarea}
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className={styles.row}>
                <Input
                  label={t('admin.bookPrice')}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required
                  fullWidth
                />
                <Input
                  label={t('admin.bookRating')}
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={(e) => setForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  required
                  fullWidth
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>{t('admin.bookCategory')}</label>
                  <select
                    className={styles.select}
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label={t('admin.bookYear')}
                  type="number"
                  value={form.publishedYear}
                  onChange={(e) => setForm(prev => ({ ...prev, publishedYear: Number(e.target.value) }))}
                  required
                  fullWidth
                />
              </div>

              <div className={styles.row}>
                <Input
                  label={t('admin.bookIsbn')}
                  value={form.isbn}
                  onChange={(e) => setForm(prev => ({ ...prev, isbn: e.target.value }))}
                  required
                  fullWidth
                />
                <Input
                  label={t('admin.bookStock')}
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                  required
                  fullWidth
                />
              </div>

              <Input
                label={t('admin.bookCover')}
                value={form.coverImage}
                onChange={(e) => setForm(prev => ({ ...prev, coverImage: e.target.value }))}
                required
                fullWidth
              />

              <div className={styles.formActions}>
                <Button type="submit" disabled={submitting || !isSupabaseConfigured}>
                  {editingBookId ? t('admin.saveChanges') : t('admin.createBook')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('admin.resetForm')}
                </Button>
              </div>
            </form>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>{t('admin.booksList')}</h2>
              <span className={styles.muted}>{books.length}</span>
            </div>

            {booksLoading ? (
              <Loader size="large" />
            ) : (
              <div className={styles.bookList}>
                {books.map(book => (
                  <article key={book.id} className={styles.bookCard}>
                    <div className={styles.bookCardHeader}>
                      <div>
                        <strong>{book.title}</strong>
                        <div className={styles.bookMeta}>
                          {book.author} - {getCategoryLabel(book.category)}
                        </div>
                      </div>
                      <strong>${book.price.toFixed(2)}</strong>
                    </div>
                    <div className={styles.bookMeta}>
                      ISBN: {book.isbn} - {t('admin.bookStock')}: {book.stock}
                    </div>
                    <div className={styles.bookActions}>
                      <Button type="button" variant="outline" onClick={() => handleEdit(book)}>
                        {t('admin.edit')}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => void handleDelete(book.id)}
                        disabled={!isSupabaseConfigured}
                      >
                        {t('admin.delete')}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {currentSection === 'users' && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>{t('admin.usersTitle')}</h2>
            <span className={styles.muted}>{users.length}</span>
          </div>

          {usersLoading ? (
            <Loader size="large" />
          ) : (
            <div className={styles.userList}>
              {users.map(profile => (
                <article key={profile.id} className={styles.userCard}>
                  <div>
                    <strong>{profile.name}</strong>
                    <div className={styles.bookMeta}>{profile.email}</div>
                  </div>
                </article>
              ))}

              {!users.length && <div className={styles.muted}>{t('admin.noUsers')}</div>}
            </div>
          )}
        </section>
      )}

      {currentSection === 'orders' && (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>{t('admin.ordersTitle')}</h2>
          </div>

          {ordersLoading ? (
            <Loader size="large" />
          ) : (
            <div className={styles.orderList}>
              {orders.map(order => (
                <article key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <strong>{t('profile.order', { id: order.id })}</strong>
                      <div className={styles.bookMeta}>
                        {new Date(order.createdAt).toLocaleDateString(localeByLanguage[language])}
                      </div>
                    </div>
                    <strong>${order.total.toFixed(2)}</strong>
                  </div>

                  <div className={styles.orderItems}>
                    {order.items.map(item => (
                      <div key={`${order.id}-${item.book.id}`} className={styles.orderItem}>
                        <span>{item.book.title}</span>
                        <span>{t('profile.quantity', { count: item.quantity })}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.muted}>
                      {order.shippingInfo.name} - {order.shippingInfo.phone}
                    </div>
                    <div className={styles.statusControl}>
                      <span>{t('admin.status')}</span>
                      <select
                        className={styles.select}
                        value={order.status}
                        onChange={(e) => void handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={!isSupabaseConfigured}
                      >
                        {(['pending', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map(status => (
                          <option key={status} value={status}>
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </article>
              ))}

              {!orders.length && <div className={styles.muted}>{t('admin.noOrders')}</div>}
            </div>
          )}
        </section>
      )}
    </AdminLayout>
  );
};
