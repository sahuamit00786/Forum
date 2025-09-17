import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const useLoginRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAuthAction = (action) => {
    if (!isAuthenticated) {
      // Store the current page path for redirect after login
      const currentPath = location.pathname + location.search;
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      // Show message and redirect to login
      alert('Please login to continue');
      navigate('/login');
      return false;
    }
    return true;
  };

  const redirectAfterLogin = () => {
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    } else {
      navigate('/');
    }
  };

  return {
    handleAuthAction,
    redirectAfterLogin
  };
};
