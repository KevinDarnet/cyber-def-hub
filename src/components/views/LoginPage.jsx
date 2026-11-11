import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandingPage from '../landing/LandingPage';
import AuthModal from '../auth/AuthModal';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  return (
    <>
      <LandingPage onOpenAuth={(targetMode) => navigate(`/login?mode=${targetMode}`)} />
      <AuthModal
        isOpen={true}
        initialMode={mode}
        onClose={() => navigate('/')}
      />
    </>
  );
};

export default LoginPage;
