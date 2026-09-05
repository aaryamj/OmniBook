import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QRScannerComponent: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [scanError, setScanError] = useState<string>('');
  
  useEffect(() => {
    // Create instance
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    // Render it
    html5QrcodeScanner.render(
      (decodedText) => {
        // Stop scanning after success to prevent multiple scans
        html5QrcodeScanner.clear().then(() => {
          onScanSuccess(decodedText);
        }).catch(err => {
          console.error("Failed to clear html5QrcodeScanner", err);
          onScanSuccess(decodedText);
        });
      },
      (error) => {
        // Ignore normal scan errors (e.g. no QR code found in frame)
        if (!String(error).includes('No MultiFormat Readers were able to detect the code')) {
           setScanError("Searching for QR Code...");
        }
      }
    );

    // Cleanup on unmount
    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner on cleanup", error);
      });
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8c9bab] hover:text-[#151c27] transition-colors bg-[#f1f5f9] hover:bg-[#e2e8f0] p-2 rounded-full"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#005438]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#005438]">
            <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
          </div>
          <h2 className="text-2xl font-bold text-[#151c27]">Scan Check-in QR</h2>
          <p className="text-[#53606c] text-sm mt-2">Align the patient's QR code within the frame to check them in automatically.</p>
        </div>
        
        <div className="rounded-2xl overflow-hidden border-2 border-[#e2e8f0] bg-[#f8f9fc]">
          <div id="qr-reader" className="w-full"></div>
        </div>
        
        {scanError && (
          <p className="text-center text-sm text-[#8c9bab] mt-4 animate-pulse">{scanError}</p>
        )}
      </div>
    </div>
  );
};

export default QRScannerComponent;
