import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLoginModule from 'react-facebook-login/dist/facebook-login-render-props';
const FacebookLogin = (FacebookLoginModule as any).default || FacebookLoginModule;
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface SocialLoginProps {
  role?: string;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({ role = 'user', onSuccess, onError }) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || '';

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post('http://localhost:8080/api/auth/oauth/google', {
        token: credentialResponse.credential,
        role: role
      });
      onSuccess(res.data);
    } catch (error) {
      onError(error);
    }
  };

  const handleFacebookResponse = async (response: any) => {
    if (response.accessToken) {
      try {
        const res = await axios.post('http://localhost:8080/api/auth/oauth/facebook', {
          token: response.accessToken,
          role: role
        });
        onSuccess(res.data);
      } catch (error) {
        onError(error);
      }
    } else {
      onError(new Error("Facebook login failed"));
    }
  };

  return (
    <div className="mt-6 flex flex-col space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        {googleClientId && (
          <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => onError(new Error("Google login failed"))}
              useOneTap={false}
              shape="rectangular"
              theme="outline"
              size="large"
            />
          </GoogleOAuthProvider>
        )}

        {facebookAppId && (
          <FacebookLogin
            appId={facebookAppId}
            autoLoad={false}
            fields="name,email,picture"
            callback={handleFacebookResponse}
            render={(renderProps: any) => (
              <button
                onClick={renderProps.onClick}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 h-[40px]"
                type="button"
              >
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
                Facebook
              </button>
            )}
          />
        )}
      </div>
    </div>
  );
};
