import { useNavigate } from 'react-router';
import { LandingPage } from './LandingPage';

export function LandingPageWrapper() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth?tab=signup');
  };

  const handleLogin = () => {
    navigate('/auth?tab=login');
  };

  return (
    <LandingPage 
      onGetStarted={handleGetStarted}
      onLogin={handleLogin}
    />
  );
}