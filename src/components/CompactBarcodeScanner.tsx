'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, CameraOff, Scan } from 'lucide-react';

interface CompactBarcodeScannerProps {
  onScanSuccessAction: (code: string) => void;
  onErrorAction?: (error: string) => void;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

export const CompactBarcodeScanner: React.FC<CompactBarcodeScannerProps> = ({
  onScanSuccessAction,
  onErrorAction,
  buttonText = "Scan UPC",
  buttonVariant = "outline",
  buttonSize = "sm"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Create a reader that should work with UPC formats
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);
    
    return () => {
      reader.reset();
    };
  }, []);

  const stopScanning = useCallback(() => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  }, [codeReader]);

  const handleScanSuccess = useCallback((result: any) => {
    if (!result) return;
    
    const decodedText = result.getText();
    const format = result.getBarcodeFormat().toString();
    
    console.log('Barcode detected:', { text: decodedText, format });
    
    // Only process UPC-A and UPC-E barcodes
    if (format === 'UPC_A' || format === 'UPC_E') {
      // Call the callback with the scanned code
      onScanSuccessAction(decodedText);
      
      // Close the dialog and stop scanning
      stopScanning();
      setIsOpen(false);
    } else {
      console.log('Ignoring non-UPC barcode format:', format);
      // Continue scanning for UPC codes
    }
  }, [onScanSuccessAction, stopScanning]);

  const startScanning = useCallback(async () => {
    if (!codeReader || !videoRef.current) return;

    try {
      setError('');
      setIsScanning(true);

      // Get video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('No camera device found');
      }

      // Use the first available camera (usually back camera on mobile)
      const deviceId = videoDevices[0].deviceId;

      codeReader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            handleScanSuccess(result);
          }
          if (error && !(error instanceof NotFoundException)) {
            console.warn('Decode error:', error);
          }
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start scanning';
      setError(errorMessage);
      onErrorAction?.(errorMessage);
      setIsScanning(false);
    }
  }, [codeReader, handleScanSuccess, onErrorAction]);

  const handleClose = () => {
    stopScanning();
    setIsOpen(false);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          className="flex items-center gap-2"
        >
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
          {/* Scanner Container */}
          <div className="w-full max-w-sm mx-auto">
            <div className="border rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-[250px] object-cover"
                style={{ display: isScanning ? 'block' : 'none' }}
                autoPlay
                playsInline
              />
              {!isScanning && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center h-[250px] flex flex-col items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm">Click "Start Scanning" to activate camera</p>
                  <p className="text-xs text-gray-400 mt-2">
                    UPC-A and UPC-E barcodes only
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Start Scanning
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex items-center gap-2">
                <CameraOff className="h-4 w-4" />
                Stop Scanning
              </Button>
            )}
            
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          {/* Instructions */}
          {isScanning && (
            <div className="text-blue-700 text-xs text-center p-2 bg-blue-50 rounded">
              📹 Point your camera at a UPC barcode. The scanner will automatically detect and add the code to your form.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
