import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Modal } from '../../components/common';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CheckoutFormData, Order } from '../../types';
import styles from './Checkout.module.scss';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, addOrder, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const validate = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('checkout.validation.nameRequired');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout.validation.phoneRequired');
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = t('checkout.validation.phoneInvalid');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('checkout.validation.addressRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !user) {
      return;
    }

    const order: Order = {
      id: Date.now().toString(),
      userId: user.id,
      items: cart,
      total: getCartTotal() * 1.1,
      status: 'pending',
      createdAt: new Date().toISOString(),
      shippingInfo: formData,
    };

    await updateProfile({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
    });

    const createdOrder = await addOrder(order);
    clearCart();
    setOrderId(createdOrder.id);
    setShowSuccess(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (errors[e.target.name as keyof CheckoutFormData]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: undefined,
      }));
    }
  };

  if (!user) {
    return (
      <div className={styles.emptyCheckout}>
        <h2>{t('profile.loginPrompt')}</h2>
        <Button onClick={() => navigate('/login')}>{t('nav.login')}</Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCheckout}>
        <h2>{t('checkout.emptyTitle')}</h2>
        <Button onClick={() => navigate('/catalog')}>{t('cart.browseCatalog')}</Button>
      </div>
    );
  }

  return (
    <div className={styles.checkout}>
      <div className={styles.container}>
        <h1>{t('checkout.title')}</h1>

        <div className={styles.checkoutLayout}>
          <div className={styles.formSection}>
            <h2>{t('checkout.shippingInfo')}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label={t('checkout.fullName')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                fullWidth
                required
              />

              <Input
                label={t('checkout.phone')}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                fullWidth
                required
              />

              <Input
                label={t('checkout.address')}
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                fullWidth
                required
              />

              <Button type="submit" size="large" fullWidth>
                {t('checkout.placeOrder')}
              </Button>
            </form>
          </div>

          <div className={styles.orderSummary}>
            <h2>{t('checkout.orderSummary')}</h2>
            <div className={styles.items}>
              {cart.map(item => (
                <div key={item.book.id} className={styles.item}>
                  <img src={item.book.coverImage} alt={item.book.title} />
                  <div className={styles.itemInfo}>
                    <h4>{item.book.title}</h4>
                    <p>{t('checkout.qty', { count: item.quantity })}</p>
                  </div>
                  <span>${(item.book.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className={styles.summaryDetails}>
              <div className={styles.row}>
                <span>{t('cart.subtotal')}</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className={styles.row}>
                <span>{t('cart.shipping')}</span>
                <span>{t('cart.free')}</span>
              </div>
              <div className={styles.row}>
                <span>{t('checkout.tax')}</span>
                <span>${(getCartTotal() * 0.1).toFixed(2)}</span>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.total}>
                <span>{t('cart.total')}</span>
                <span>${(getCartTotal() * 1.1).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showSuccess} onClose={() => {}} title={t('checkout.successTitle')}>
        <div className={styles.successModal}>
          <div className={styles.checkmark}>OK</div>
          <h3>{t('checkout.successHeading')}</h3>
          <p>{t('checkout.successMessage')}</p>
          <p>{t('checkout.orderId', { id: orderId })}</p>
          <div className={styles.modalActions}>
            <Button onClick={() => navigate('/profile')}>{t('checkout.viewOrders')}</Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              {t('checkout.backHome')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
