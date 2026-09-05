import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'

// Global interceptor to handle token expiration or account suspension
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log out on 401 (Unauthorized / Invalid Token / Suspended). 
    // Do NOT log out on 403 (Forbidden / Permission Denied).
    if (error.response && error.response.status === 401) {
      // Clear token and user info
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('fullName');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="470122914021-bi0qlpv79l9318nl2dl60i2hjoiuha44.apps.googleusercontent.com">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>,
)
