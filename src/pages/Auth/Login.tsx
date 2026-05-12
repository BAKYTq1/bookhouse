import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Loader } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './Auth.module.scss';

export const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!shouldRedirect || !user) {
      return;
    }

    navigate(user.role === 'admin' ? '/admin' : '/');
    setShouldRedirect(false);
  }, [shouldRedirect, user, navigate]);

  const validate = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
    };

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

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        setShouldRedirect(true);
      }
    } catch {
      setServerError(t('auth.invalidCredentials'));
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
        <h1>{t('auth.loginTitle')}</h1>
        <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>

        {serverError && (
          <div className={styles.errorAlert}>{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
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

          <div className={styles.inlineAction}>
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          </div>

          <Button type="submit" size="large" fullWidth disabled={loading}>
            {loading ? <Loader size="small" /> : t('auth.signIn')}
          </Button>
        </form>

        <p className={styles.authLink}>
          {t('auth.noAccount')} <Link to="/register">{t('auth.signUp')}</Link>
        </p>
      </div>
    </div>
  );
};
