import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Loader } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './Auth.module.scss';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {
      password: '',
      confirmPassword: '',
    };

    if (!formData.password) {
      nextErrors.password = t('auth.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      nextErrors.password = t('auth.validation.passwordMin');
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = t('auth.validation.passwordMismatch');
    }

    setErrors(nextErrors);
    return !nextErrors.password && !nextErrors.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await updatePassword(formData.password);
      setSuccess(t('auth.passwordResetSuccess'));
      window.setTimeout(() => navigate('/login'), 1200);
    } catch {
      setServerError(t('auth.passwordResetFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1>{t('auth.resetPasswordTitle')}</h1>
        <p className={styles.subtitle}>{t('auth.resetPasswordSubtitle')}</p>

        {serverError && <div className={styles.errorAlert}>{serverError}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label={t('auth.password')}
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, password: e.target.value }));
              setErrors((prev) => ({ ...prev, password: '' }));
              setServerError('');
            }}
            error={errors.password}
            fullWidth
            required
          />

          <Input
            label={t('auth.confirmPassword')}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
              setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              setServerError('');
            }}
            error={errors.confirmPassword}
            fullWidth
            required
          />

          <Button type="submit" size="large" fullWidth disabled={loading}>
            {loading ? <Loader size="small" /> : t('auth.saveNewPassword')}
          </Button>
        </form>

        <p className={styles.authLink}>
          <Link to="/login">{t('auth.backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
};
