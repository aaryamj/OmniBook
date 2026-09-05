import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oid = searchParams.get('oid'); // The transaction ID

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-[#005438]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[40px] text-[#005438]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        
        <h1 className="text-2xl font-bold text-[#151c27] mb-2">Booking Confirmed!</h1>
        <p className="text-[#53606c] mb-6">Your payment was successful and your appointment has been scheduled.</p>
        
        <div className="bg-[#f8f9fc] rounded-2xl p-5 mb-8 text-left border border-[#c3c5d7]/30">
          <p className="text-[12px] font-medium text-[#8c9bab] uppercase tracking-wider mb-1">Transaction ID</p>
          <p className="text-[16px] font-bold text-[#151c27] font-mono break-all">{oid}</p>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center mb-8 pt-6 border-t border-[#c3c5d7]/30">
          <p className="text-[#53606c] text-sm font-medium mb-4">Scan this QR Code at the clinic for quick check-in</p>
          <div className="bg-white p-3 rounded-2xl shadow-[0_4px_14px_rgba(0,0,0,0.05)] border border-[#e2e8f0]">
            <QRCodeSVG value={oid || "unknown-id"} size={160} fgColor="#151c27" />
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full py-3.5 bg-[#005438] text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_14px_rgba(0,84,56,0.3)]"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
