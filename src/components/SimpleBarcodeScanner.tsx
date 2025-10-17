'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, RotateCcw, Copy, Check, AlertTriangle } from 'lucide-react';

interface SimpleBarcodeResult {
  text: string;
  format: string;
  timestamp: Date;
}

export const SimpleBarcodeScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [scanResults, setScanResults] = useState<SimpleBarcodeResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    // Configure to only scan UPC-A and UPC-E formats
    reader.hints.set(2, [BarcodeFormat.UPC_A, BarcodeFormat.UPC_E]);
    setCodeReader(reader);
    
    return () => {
      reader.reset();
    };
  }, []);

  const onScanSuccess = useCallback((result: any) => {
    if (!result) return;
    
    const decodedText = result.getText();
    const format = result.getBarcodeFormat().toString().replace(/_/g, ' ');
    
    console.log('Barcode detected:', { text: decodedText, format });

    const newResult: SimpleBarcodeResult = {
      text: decodedText,
      format: format,
      timestamp: new Date()
    };
    
    setScanResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
  }, []);

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
            onScanSuccess(result);
          }
          if (error && !(error instanceof NotFoundException)) {
            console.warn('Decode error:', error);
          }
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scanning');
      setIsScanning(false);
    }
  }, [codeReader, onScanSuccess]);

  const stopScanning = useCallback(() => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  }, [codeReader]);

  const clearResults = useCallback(() => {
    setScanResults([]);
  }, []);

  const copyToClipboard = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const getBarcodeFormatColor = (format: string) => {
    const lowerFormat = format.toLowerCase();
    if (lowerFormat.includes('upc')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            UPC Barcode Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scanner Container */}
          <div className="w-full max-w-md mx-auto">
            <div className="border rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-[300px] object-cover"
                style={{ display: isScanning ? 'block' : 'none' }}
                autoPlay
                playsInline
              />
              {!isScanning && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-[300px] flex flex-col items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Click "Start Scanning" to activate camera</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports UPC-A and UPC-E barcodes only
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
            
            {scanResults.length > 0 && (
              <Button onClick={clearResults} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Clear Results
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Debug Info */}
          {isScanning && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700 text-sm">
                📹 Camera is active. Point at any UPC barcode to scan.
                <br />
                💡 Supports: UPC-A (12 digits) and UPC-E (8 digits) barcodes only
                <br />
                🔍 Check browser console (F12) for detailed scan results.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Scan Results */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Results ({scanResults.length})</CardTitle>
        </CardHeader> 
        <CardContent>
          {scanResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">No UPC barcodes scanned yet</p>
              <p className="text-gray-400 text-sm">Start scanning to see UPC barcode results here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scanResults.map((result, index) => (
                <div key={index} className="group p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBarcodeFormatColor(result.format)}`}>
                          {result.format}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(result.timestamp)}
                        </span>
                      </div>
                      <div className="font-mono text-sm bg-gray-100 p-3 rounded border break-all">
                        {result.text}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(result.text, index)}
                      className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
