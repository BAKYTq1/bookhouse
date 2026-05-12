import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Loader } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import styles from './Auth.module.scss';

export const ForgotPassword = () => {
  const { requestPasswordReset } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError(t('auth.validation.emailRequired'));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('auth.validation.emailInvalid'));
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(t('auth.resetEmailSent'));
    } catch {
      setError(t('auth.resetEmailFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1>{t('auth.forgotPasswordTitle')}</h1>
        <p className={styles.subtitle}>{t('auth.forgotPasswordSubtitle')}</p>

        {!isSupabaseConfigured && (
          <div className={styles.errorAlert}>{t('auth.resetUnavailable')}</div>
        )}

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label={t('auth.email')}
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={error && !success ? error : ''}
            fullWidth
            required
          />

          <Button type="submit" size="large" fullWidth disabled={loading || !isSupabaseConfigured}>
            {loading ? <Loader size="small" /> : t('auth.sendResetLink')}
          </Button>
        </form>

        <p className={styles.authLink}>
          <Link to="/login">{t('auth.backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
};
