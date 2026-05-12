import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCategoryLabel } from '../../i18n/translations';
import styles from './Footer.module.scss';

export const Footer = () => {
  const { language, t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.logo}>
              <BookOpen size={28} />
              <span>BookHouse</span>
            </div>
            <p className={styles.description}>
              {t('footer.description')}
            </p>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>{t('footer.quickLinks')}</h3>
            <ul className={styles.linkList}>
              <li><a href="/">{t('nav.home')}</a></li>
              <li><a href="/catalog">{t('nav.catalog')}</a></li>
              <li><a href="/cart">{t('nav.cart')}</a></li>
              <li><a href="/login">{t('nav.login')}</a></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>{t('footer.categories')}</h3>
            <ul className={styles.linkList}>
              <li><a href="/catalog?category=Classic">{getCategoryLabel(language, 'Classic')}</a></li>
              <li><a href="/catalog?category=Fantasy">{getCategoryLabel(language, 'Fantasy')}</a></li>
              <li><a href="/catalog?category=Mystery">{getCategoryLabel(language, 'Mystery')}</a></li>
              <li><a href="/catalog?category=Romance">{getCategoryLabel(language, 'Romance')}</a></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.sectionTitle}>{t('footer.contact')}</h3>
            <ul className={styles.contactList}>
              <li>
                <Mail size={16} />
                <span>info@bookhouse.com</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>123 Book Street, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; 2024 BookHouse. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};
