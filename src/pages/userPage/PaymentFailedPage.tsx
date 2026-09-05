import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[40px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
        </div>
        
        <h1 className="text-2xl font-bold text-[#151c27] mb-2">Payment Failed</h1>
        <p className="text-[#53606c] mb-6">
          {error === 'verification_failed' 
            ? "We couldn't verify your payment with eSewa. If money was deducted, it will be refunded automatically." 
            : "You canceled the payment process. Your appointment has not been booked."}
        </p>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full py-3.5 bg-gray-100 text-[#151c27] rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
