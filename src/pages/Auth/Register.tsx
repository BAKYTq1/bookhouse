import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Loader } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './Auth.module.scss';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = t('auth.validation.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.validation.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.validation.passwordMin');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const success = await register(formData.email, formData.password, formData.name);
      if (success) {
        navigate('/');
      }
    } catch {
      setServerError(t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1>{t('auth.registerTitle')}</h1>
        <p className={styles.subtitle}>{t('auth.registerSubtitle')}</p>

        {serverError && (
          <div className={styles.errorAlert}>{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label={t('checkout.fullName')}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            fullWidth
            required
          />

          <Input
            label={t('auth.email')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            fullWidth
            required
          />

          <Input
            label={t('auth.password')}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            fullWidth
            required
          />

          <Input
            label={t('auth.confirmPassword')}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            fullWidth
            required
          />

          <Button type="submit" size="large" fullWidth disabled={loading}>
            {loading ? <Loader size="small" /> : t('auth.createAccount')}
          </Button>
        </form>

        <p className={styles.authLink}>
          {t('auth.haveAccount')} <Link to="/login">{t('auth.signIn')}</Link>
        </p>

        <p className={styles.authLink}>
          <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
        </p>
      </div>
    </div>
  );
};

