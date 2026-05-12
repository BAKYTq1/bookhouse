import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/common';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './Cart.module.scss';

export const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { t } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <ShoppingBag size={64} />
        <h2>{t('cart.emptyTitle')}</h2>
        <p>{t('cart.emptySubtitle')}</p>
        <Button onClick={() => navigate('/catalog')}>{t('cart.browseCatalog')}</Button>
      </div>
    );
  }

  return (
    <div className={styles.cart}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{t('cart.title')}</h1>
          <Button variant="outline" onClick={clearCart}>{t('cart.clear')}</Button>
        </div>

        <div className={styles.cartLayout}>
          <div className={styles.cartItems}>
            {cart.map(item => (
              <div key={item.book.id} className={styles.cartItem}>
                <img
                  src={item.book.coverImage}
                  alt={item.book.title}
                  className={styles.bookImage}
                  onClick={() => navigate(`/book/${item.book.id}`)}
                />

                <div className={styles.bookInfo}>
                  <h3 onClick={() => navigate(`/book/${item.book.id}`)}>
                    {item.book.title}
                  </h3>
                  <p className={styles.author}>{item.book.author}</p>
                  <p className={styles.price}>${item.book.price.toFixed(2)}</p>
                </div>

                <div className={styles.quantityControl}>
                  <button
                    onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                    className={styles.quantityButton}
                  >
                    -
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>

                <div className={styles.itemTotal}>
                  ${(item.book.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeFromCart(item.book.id)}
                  className={styles.removeButton}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.cartSummary}>
            <h2>{t('cart.summary')}</h2>
            <div className={styles.summaryRow}>
              <span>{t('cart.subtotal')}</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>{t('cart.shipping')}</span>
              <span>{t('cart.free')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>{t('cart.tax')}</span>
              <span>${(getCartTotal() * 0.1).toFixed(2)}</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.summaryTotal}>
              <span>{t('cart.total')}</span>
              <span>${(getCartTotal() * 1.1).toFixed(2)}</span>
            </div>
            <Button fullWidth size="large" onClick={() => navigate('/checkout')}>
              {t('cart.checkout')}
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={() => navigate('/catalog')}
            >
              {t('cart.continue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
