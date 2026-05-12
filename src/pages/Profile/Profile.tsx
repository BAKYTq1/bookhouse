import { useNavigate } from 'react-router-dom';
import { User, Package, LogOut, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BookCard, Button, Input } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getStatusLabel, localeByLanguage } from '../../i18n/translations';
import styles from './Profile.module.scss';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, orders, logout, updateProfile } = useAuth();
  const { favorites } = useFavorites();
  const { language, t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      name: user.name,
      phone: user.phone ?? '',
      address: user.address ?? '',
    });
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    if (!formData.name.trim()) {
      setSaveError(t('profile.nameRequired'));
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
      setIsEditing(false);
      setSaveSuccess(t('profile.profileSaved'));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : t('profile.profileSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    if (!user) {
      return;
    }

    setIsEditing(false);
    setSaveError('');
    setSaveSuccess('');
    setFormData({
      name: user.name,
      phone: user.phone ?? '',
      address: user.address ?? '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return styles.delivered;
      case 'shipped':
        return styles.shipped;
      case 'processing':
        return styles.processing;
      default:
        return styles.pending;
    }
  };

  if (!user) {
    return (
      <div className={styles.notAuthenticated}>
        <h2>{t('profile.loginPrompt')}</h2>
        <Button onClick={() => navigate('/login')}>{t('nav.login')}</Button>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <div className={styles.container}>
        <div className={styles.profileHeader}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <User size={48} />
            </div>
            <div>
              <h1>{user.name}</h1>
              <p>{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut size={20} />
            {t('nav.logout')}
          </Button>
        </div>

        <div className={styles.profileContent}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>{t('profile.accountInfo')}</h2>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  {t('profile.editProfile')}
                </Button>
              )}
            </div>

            {saveError && <div className={styles.errorBanner}>{saveError}</div>}
            {saveSuccess && <div className={styles.successBanner}>{saveSuccess}</div>}

            {isEditing ? (
              <form className={styles.profileForm} onSubmit={handleSaveProfile}>
                <Input
                  label={t('profile.name')}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                  required
                />
                <Input
                  label={t('profile.phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  fullWidth
                />
                <Input
                  label={t('profile.address')}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  fullWidth
                />
                <div className={styles.formActions}>
                  <Button type="submit" disabled={saving}>
                    {saving ? t('profile.saving') : t('profile.save')}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEditing} disabled={saving}>
                    {t('profile.cancel')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>{t('profile.name')}</span>
                  <span>{user.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>{t('profile.email')}</span>
                  <span>{user.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>{t('profile.phone')}</span>
                  <span>{user.phone || t('profile.notProvided')}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>{t('profile.address')}</span>
                  <span>{user.address || t('profile.notProvided')}</span>
                </div>
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>{t('favorites.title')}</h2>
              <Button variant="outline" onClick={() => navigate('/favorites')}>
                {t('favorites.viewAll')}
              </Button>
            </div>

            {favorites.length === 0 ? (
              <div className={styles.emptyOrders}>
                <Heart size={48} />
                <p>{t('favorites.emptySubtitle')}</p>
                <Button onClick={() => navigate('/catalog')}>
                  {t('favorites.browseCatalog')}
                </Button>
              </div>
            ) : (
              <div className={styles.favoritesGrid}>
                {favorites.slice(0, 4).map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2>{t('profile.orderHistory')}</h2>
            {orders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <Package size={48} />
                <p>{t('profile.noOrders')}</p>
                <Button onClick={() => navigate('/catalog')}>
                  {t('profile.startShopping')}
                </Button>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <h3>{t('profile.order', { id: order.id })}</h3>
                        <p className={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleDateString(localeByLanguage[language])}
                        </p>
                      </div>
                      <div>
                        <span className={`${styles.status} ${getStatusColor(order.status)}`}>
                          {getStatusLabel(language, order.status)}
                        </span>
                        <p className={styles.orderTotal}>${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className={styles.orderItems}>
                      {order.items.map(item => (
                        <div key={item.book.id} className={styles.orderItem}>
                          <img src={item.book.coverImage} alt={item.book.title} />
                          <div className={styles.itemDetails}>
                            <h4>{item.book.title}</h4>
                            <p>{t('profile.quantity', { count: item.quantity })}</p>
                          </div>
                          <span>${(item.book.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.shippingInfo}>
                      <h4>{t('profile.shippingInfo')}</h4>
                      <p>{order.shippingInfo.name}</p>
                      <p>{order.shippingInfo.phone}</p>
                      <p>{order.shippingInfo.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
