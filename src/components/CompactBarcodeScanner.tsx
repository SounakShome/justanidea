'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, CameraOff, Scan, CheckCircle, AlertCircle } from 'lucide-react';

interface CompactBarcodeScannerProps {
  onScanSuccessAction: (code: string) => void;
  onErrorAction?: (error: string) => void;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

// Validate barcode format (UPC-A, UPC-E, EAN-13, EAN-8)
const isValidBarcode = (code: string): boolean => {
  // Remove any whitespace
  const cleaned = code.trim();
  
  // Check for valid barcode formats
  // UPC-A: 12 digits
  // UPC-E: 8 digits
  // EAN-13: 13 digits
  // EAN-8: 8 digits
  const validFormats = /^(\d{8}|\d{12}|\d{13})$/;
  
  if (!validFormats.test(cleaned)) {
    return false;
  }
  
  // Additional validation: no all zeros or all same digit
  if (/^0+$/.test(cleaned) || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }
  
  return true;
};

export const CompactBarcodeScanner: React.FC<CompactBarcodeScannerProps> = ({
  onScanSuccessAction,
  onErrorAction,
  buttonText = "Scan UPC",
  buttonVariant = "outline",
  buttonSize = "sm"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [scanAttempts, setScanAttempts] = useState(0);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = useRef(`barcode-scanner-${Math.random().toString(36).substr(2, 9)}`);
  const lastScannedRef = useRef<string>('');
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameraDevices(devices);
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(backCamera?.id || devices[0]?.id || '');
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
        setError('Unable to access camera devices.');
      }
    };

    if (isOpen && cameraDevices.length === 0) {
      getCameras();
    }
  }, [isOpen, cameraDevices.length]);

  const handleSuccessfulScan = useCallback(async (decodedText: string) => {
    // Prevent processing if already processing
    if (processingRef.current) return;
    
    // Clean the barcode text
    const cleanedCode = decodedText.trim();
    
    // Check if it's the same as last scanned (debounce duplicate scans)
    if (lastScannedRef.current === cleanedCode) return;
    
    // Validate barcode format
    if (!isValidBarcode(cleanedCode)) {
      setError(`Invalid barcode format: ${cleanedCode}`);
      return;
    }
    
    processingRef.current = true;
    lastScannedRef.current = cleanedCode;
    
    setBarcodeResult(cleanedCode);
    
    try {
      // Stop scanning immediately
      if (html5QrCodeRef.current) {
        try {
          const state = html5QrCodeRef.current.getState();
          if (state === 2) {
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch (err) {
          // Silently handle cleanup errors
        } finally {
          html5QrCodeRef.current = null;
        }
      }
      
      setIsScanning(false);
      
      // Call the success callback
      onScanSuccessAction(cleanedCode);
      
      // Close after showing success message briefly
      setTimeout(() => {
        setIsOpen(false);
        setBarcodeResult(null);
        lastScannedRef.current = '';
        processingRef.current = false;
      }, 800);
    } catch (err) {
      console.error('Error processing barcode:', err);
      setError('Error processing barcode. Please try again.');
      processingRef.current = false;
    }
  }, [onScanSuccessAction]);

  useEffect(() => {
    const startScanning = async () => {
      if (!isScanning || !selectedCamera) return;

      try {
        html5QrCodeRef.current = new Html5Qrcode(scannerDivId.current);
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
          disableFlip: false,
          formatsToSupport: [
            0,  // CODE_128
            1,  // CODE_39
            5,  // EAN_13
            6,  // EAN_8
            12, // UPC_A
            13, // UPC_E
          ]
        };

        await html5QrCodeRef.current.start(
          selectedCamera,
          config,
          (decodedText) => {
            handleSuccessfulScan(decodedText);
          },
          (errorMessage) => {
            // Only log non-NotFoundException errors
            if (!errorMessage.includes('NotFoundException') && !errorMessage.includes('No MultiFormat Readers')) {
              setScanAttempts(prev => prev + 1);
            }
          }
        );
      } catch (err: any) {
        console.error('Error starting scanner:', err);
        const errorMsg = err.message || 'Unable to start camera';
        setError(errorMsg.includes('Permission') ? 
          'Camera permission denied. Please allow camera access.' : 
          'Unable to start camera. Please check permissions and try again.');
        onErrorAction?.(errorMsg);
        setIsScanning(false);
      }
    };

    const stopScanning = async () => {
      if (html5QrCodeRef.current) {
        try {
          const state = html5QrCodeRef.current.getState();
          if (state === 2) { // Html5QrcodeScannerState.SCANNING
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch (err) {
          // Silently handle cleanup errors
        } finally {
          html5QrCodeRef.current = null;
        }
      }
    };

    if (isScanning) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isScanning, selectedCamera, handleSuccessfulScan, onErrorAction]);

  const handleStartScanning = () => {
    setError(null);
    setBarcodeResult(null);
    lastScannedRef.current = '';
    processingRef.current = false;
    setScanAttempts(0);
    setIsScanning(true);
  };

  const handleStopScanning = async () => {
    setIsScanning(false);
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // Html5QrcodeScannerState.SCANNING
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        // Silently handle cleanup errors
      } finally {
        html5QrCodeRef.current = null;
      }
    }
  };

  const handleClose = async () => {
    await handleStopScanning();
    setIsOpen(false);
    setError(null);
    setBarcodeResult(null);
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      await handleClose();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className="flex items-center gap-2">
          <Scan className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            UPC Barcode Scanner
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {cameraDevices.length > 1 && !isScanning && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Camera:</label>
              <select 
                value={selectedCamera} 
                onChange={(e) => setSelectedCamera(e.target.value)} 
                className="w-full p-2 border rounded-md text-sm"
              >
                {cameraDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.label || `Camera ${device.id.substring(0, 5)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="w-full max-w-sm mx-auto">
            <div className="border rounded-lg overflow-hidden relative">
              <div 
                id={scannerDivId.current}
                style={{ 
                  display: isScanning ? 'block' : 'none',
                  width: '100%'
                }}
              />
              
              {!isScanning && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center h-[300px] flex flex-col items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm font-medium">Ready to scan</p>
                  <p className="text-xs text-gray-400 mt-2">Click "Start Scanning" below</p>
                  <p className="text-xs text-gray-400 mt-1">Supports UPC-A, UPC-E, and EAN-13</p>
                </div>
              )}
            </div>
          </div>
          
          {barcodeResult && (
            <div className="text-green-700 text-sm text-center p-3 bg-green-50 rounded-lg flex items-center justify-center gap-2 font-medium animate-pulse">
              <CheckCircle className="h-5 w-5" />
              ✅ Scanned: {barcodeResult}
            </div>
          )}
          
          {error && (
            <div className="text-red-600 text-sm text-center p-3 bg-red-50 rounded-lg font-medium flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            {!isScanning ? (
              <Button 
                onClick={handleStartScanning} 
                className="flex items-center gap-2" 
                disabled={!selectedCamera}
              >
                <Camera className="h-4 w-4" />
                Start Scanning
              </Button>
            ) : (
              <Button 
                onClick={handleStopScanning} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <CameraOff className="h-4 w-4" />
                Stop Scanning
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
          
          {isScanning && !barcodeResult && (
            <div className="text-blue-700 text-xs text-center p-3 bg-blue-50 rounded-lg">
              <p className="font-medium mb-1">Tips for better scanning:</p>
              <ul className="text-left space-y-1 mt-2">
                <li>• Hold the barcode within the frame</li>
                <li>• Ensure good lighting</li>
                <li>• Keep the camera steady</li>
                <li>• Try moving closer or further away</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
