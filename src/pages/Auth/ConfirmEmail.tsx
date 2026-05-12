import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../components/common';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from './Auth.module.scss';

export const ConfirmEmail = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Проверяем, есть ли hash из Supabase
        const hash = window.location.hash;
        
        if (!hash || !supabase) {
          setStatus('error');
          setMessage(t('auth.confirmEmailFailed'));
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Supabase сам обрабатывает token из URL и обновляет session
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: hash,
          type: 'email',
        });

        if (error || !data.user) {
          setStatus('error');
          setMessage(t('auth.confirmEmailFailed'));
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        setStatus('success');
        setMessage(t('auth.confirmEmailSuccess'));
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        setStatus('error');
        setMessage(t('auth.confirmEmailFailed'));
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    confirmEmail();
  }, [navigate, t]);

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        {status === 'loading' && (
          <>
            <h1>{t('auth.confirmingEmail')}</h1>
            <p className={styles.subtitle}>{t('auth.pleaseWait')}</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <Loader size="large" />
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h1>✅ {t('auth.emailConfirmed')}</h1>
            <p className={styles.subtitle}>{message}</p>
            <p className={styles.subtitle}>{t('auth.redirecting')}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1>❌ {t('auth.confirmEmailTitle')}</h1>
            <p className={`${styles.subtitle} ${styles.errorAlert}`}>{message}</p>
            <p className={styles.subtitle}>{t('auth.redirecting')}</p>
          </>
        )}
      </div>
    </div>
  );
};
