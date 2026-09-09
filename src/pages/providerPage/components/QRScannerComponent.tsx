import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

/**
 * Robust multi-pass QR decoder for images/screenshots.
 * Handles screenshots with surrounding text ("SCAN TO CHECK-IN"),
 * padding, high resolution, dark mode, and low contrast.
 */
async function decodeQRFromImageFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return resolve(null);

      const img = new Image();
      img.onload = async () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) return resolve(null);

        // Pass 1: Native BarcodeDetector (Chrome/Edge/Opera/Chromium)
        if ('BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              return resolve(barcodes[0].rawValue.trim());
            }
          } catch (err) {
            console.debug('BarcodeDetector pass failed, trying jsQR:', err);
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return resolve(null);

          ctx.drawImage(img, 0, 0);
          const fullImgData = ctx.getImageData(0, 0, w, h);

          // Pass 2: jsQR on full natural resolution
          const pass2 = jsQR(fullImgData.data, w, h, { inversionAttempts: 'attemptBoth' });
          if (pass2 && pass2.data) {
            return resolve(pass2.data.trim());
          }

          // Pass 3: Center crop (extract 70% centered rectangle)
          // Many screenshots contain app headers, borders, and margins
          const cropW = Math.round(w * 0.7);
          const cropH = Math.round(h * 0.7);
          const cropX = Math.round((w - cropW) / 2);
          const cropY = Math.round((h - cropH) / 2);
          const centerData = ctx.getImageData(cropX, cropY, cropW, cropH);
          const pass3 = jsQR(centerData.data, cropW, cropH, { inversionAttempts: 'attemptBoth' });
          if (pass3 && pass3.data) {
            return resolve(pass3.data.trim());
          }

          // Pass 4: Downscale if image is high resolution (> 1000px)
          if (w > 1000 || h > 1000) {
            const scale = 800 / Math.max(w, h);
            const sw = Math.round(w * scale);
            const sh = Math.round(h * scale);
            const sCanvas = document.createElement('canvas');
            sCanvas.width = sw;
            sCanvas.height = sh;
            const sCtx = sCanvas.getContext('2d', { willReadFrequently: true });
            if (sCtx) {
              sCtx.drawImage(img, 0, 0, sw, sh);
              const scaledData = sCtx.getImageData(0, 0, sw, sh);
              const pass4 = jsQR(scaledData.data, sw, sh, { inversionAttempts: 'attemptBoth' });
              if (pass4 && pass4.data) {
                return resolve(pass4.data.trim());
              }
            }
          }

          // Pass 5: Grayscale & Contrast Binarization
          const binarized = new Uint8ClampedArray(fullImgData.data.length);
          for (let i = 0; i < fullImgData.data.length; i += 4) {
            const gray = 0.299 * fullImgData.data[i] + 0.587 * fullImgData.data[i + 1] + 0.114 * fullImgData.data[i + 2];
            const val = gray > 135 ? 255 : 0;
            binarized[i] = val;
            binarized[i + 1] = val;
            binarized[i + 2] = val;
            binarized[i + 3] = 255;
          }
          const pass5 = jsQR(binarized, w, h, { inversionAttempts: 'attemptBoth' });
          if (pass5 && pass5.data) {
            return resolve(pass5.data.trim());
          }
        } catch (canvasErr) {
          console.debug('Canvas decoding error:', canvasErr);
        }

        resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

const QRScannerComponent: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStoppingRef = useRef(false);

  // Stop camera helper
  const stopCamera = useCallback(async () => {
    if (html5QrRef.current && !isStoppingRef.current) {
      try {
        if (html5QrRef.current.isScanning) {
          isStoppingRef.current = true;
          await html5QrRef.current.stop();
          html5QrRef.current.clear();
        }
      } catch (err) {
        console.debug('Camera stop error (ignored):', err);
      } finally {
        isStoppingRef.current = false;
      }
    }
  }, []);

  // Process a chosen or dropped image file
  const processImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please provide a valid image file (PNG, JPEG, WebP).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessCode(null);

    // Create thumbnail preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    try {
      // Decode using robust multi-pass pipeline
      let decoded = await decodeQRFromImageFile(file);

      // Fallback to Html5Qrcode.scanFile if jsQR pipeline didn't detect it
      if (!decoded && html5QrRef.current) {
        try {
          decoded = await html5QrRef.current.scanFile(file, false);
        } catch {
          // Ignore ZXing internal exception
        }
      }

      if (decoded && decoded.trim()) {
        const cleanCode = decoded.trim();
        setSuccessCode(cleanCode);
        setTimeout(() => {
          onScanSuccess(cleanCode);
        }, 400);
      } else {
        setErrorMessage(
          'No QR code detected in this image. Please ensure the QR code is clearly visible, in focus, and not cropped.'
        );
      }
    } catch (err) {
      console.error('File scan error:', err);
      setErrorMessage('Failed to process image. Please try another image or use camera mode.');
    } finally {
      setIsProcessing(false);
    }
  }, [onScanSuccess]);

  // Handle clipboard paste (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setActiveTab('upload');
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processImageFile]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Start or stop camera based on active tab
  useEffect(() => {
    let isCancelled = false;

    const initAndStartCamera = async () => {
      if (activeTab !== 'camera') {
        await stopCamera();
        return;
      }

      setCameraError(null);

      // Ensure scanner instance exists
      if (!html5QrRef.current) {
        const elem = document.getElementById('qr-camera-viewport');
        if (!elem) {
          console.debug('Waiting for qr-camera-viewport element');
          return;
        }

        try {
          html5QrRef.current = new Html5Qrcode('qr-camera-viewport', {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
          });
        } catch (initErr) {
          console.warn('Failed to construct Html5Qrcode:', initErr);
          setCameraError('Unable to initialize camera component.');
          return;
        }
      }

      // Query available cameras if not yet queried
      if (cameras.length === 0) {
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0 && !isCancelled) {
            setCameras(devices.map((d) => ({ id: d.id, label: d.label || `Camera ${d.id}` })));
            if (!selectedCameraId) {
              setSelectedCameraId(devices[0].id);
            }
          }
        } catch (camListErr) {
          console.debug('Could not query cameras list:', camListErr);
        }
      }

      const scanner = html5QrRef.current;
      if (!scanner || isCancelled) return;

      // If already scanning, don't restart
      if (scanner.isScanning) return;

      const cameraIdOrConfig = selectedCameraId ? { deviceId: { exact: selectedCameraId } } : { facingMode: 'environment' };

      try {
        await scanner.start(
          cameraIdOrConfig,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minDim = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.floor(minDim * 0.72);
              return { width: size, height: size };
            },
          },
          (decodedText) => {
            const clean = decodedText.trim();
            setSuccessCode(clean);
            stopCamera().then(() => {
              onScanSuccess(clean);
            });
          },
          () => {
            // Ignore ongoing frame search misses
          }
        );
      } catch (startErr) {
        if (!isCancelled) {
          console.warn('Unable to start camera:', startErr);
          setCameraError(
            'Could not access camera. Please allow camera permissions in your browser or use the Upload Image tab.'
          );
        }
      }
    };

    initAndStartCamera();

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [activeTab, selectedCameraId, onScanSuccess, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl relative border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full flex items-center justify-center cursor-pointer"
          title="Close scanner (Esc)"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="material-symbols-outlined text-[30px]">qr_code_scanner</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Scan Check-in QR</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Upload a screenshot of the patient QR code or use your camera to check them in.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setActiveTab('upload');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Upload Screenshot / Image</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setActiveTab('camera');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span>Live Camera</span>
          </button>
        </div>

        {/* Tab 1: Upload / Drop / Paste Image */}
        <div className={activeTab === 'upload' ? 'space-y-4' : 'hidden'}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processImageFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group ${
              isProcessing
                ? 'border-emerald-400 bg-emerald-50/40'
                : 'border-slate-300 hover:border-emerald-600 bg-slate-50/50 hover:bg-emerald-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />

            {isProcessing ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-emerald-800 font-semibold text-sm">Decoding QR Code...</p>
                <p className="text-slate-400 text-xs">Scanning across multi-pass filters</p>
              </div>
            ) : imagePreview ? (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="relative max-h-48 max-w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white p-2">
                  <img
                    src={imagePreview}
                    alt="Uploaded QR Code"
                    className="max-h-44 object-contain mx-auto rounded-lg"
                  />
                  {successCode && (
                    <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white p-3 text-center rounded-lg animate-in fade-in">
                      <span className="material-symbols-outlined text-[36px] mb-1">check_circle</span>
                      <span className="font-bold text-sm">QR Code Verified!</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline mt-1 cursor-pointer"
                >
                  Choose another image or screenshot
                </button>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">
                  Click to select or drag & drop QR screenshot
                </h3>
                <p className="text-slate-500 text-xs max-w-xs mb-3">
                  Upload the patient's check-in QR code screenshot (PNG, JPG, WebP)
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/70 text-slate-700 text-xs font-medium">
                  <span className="material-symbols-outlined text-[15px]">content_paste</span>
                  <span>Tip: You can press <b>Ctrl + V</b> to paste anytime</span>
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-[22px] text-rose-600 shrink-0 mt-0.5">error</span>
              <div className="text-xs sm:text-sm flex-1">
                <p className="font-semibold text-rose-900">QR Detection Failed</p>
                <p className="mt-0.5 text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successCode && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-[22px] text-emerald-600 shrink-0">check_circle</span>
              <div className="text-xs sm:text-sm flex-1">
                <p className="font-semibold text-emerald-950">QR Code Detected</p>
                <p className="text-emerald-700 text-xs truncate">Token: {successCode}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab 2: Live Camera Viewport */}
        <div className={activeTab === 'camera' ? 'space-y-4' : 'hidden'}>
          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-black relative aspect-square sm:aspect-4/3 flex items-center justify-center">
            <div id="qr-camera-viewport" className="w-full h-full"></div>

            {/* Viewfinder Target Graphic */}
            {!cameraError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="w-56 h-56 relative border-2 border-emerald-400/70 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                  {/* Animated scanning laser */}
                  <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_8px_#34d399] animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Camera Error State */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[42px] text-amber-400 mb-2">videocam_off</span>
                <p className="font-semibold text-sm text-slate-100 max-w-xs">{cameraError}</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Switch to Upload Image</span>
                </button>
              </div>
            )}
          </div>

          {/* Camera Selector (if multiple cameras available) */}
          {cameras.length > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">switch_camera</span>
                Camera Device:
              </span>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-center text-xs text-slate-400">
            Point your camera at the QR code to check in automatically.
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Supported: Check-in tokens & transaction IDs</span>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannerComponent;
