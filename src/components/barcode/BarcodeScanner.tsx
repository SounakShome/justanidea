'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, RotateCcw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BarcodeResult {
  text: string;
  format: string;
  timestamp: Date;
  confidence?: number;
}

export interface BarcodeScannerProps {
  /** Client-side callback function triggered when a barcode is successfully scanned */
  onScanAction?: (result: BarcodeResult) => void;
  /** Client-side callback function triggered when an error occurs during scanning */
  onErrorAction?: (error: string) => void;
  className?: string;
  autoStart?: boolean;
  allowedFormats?: string[];
  scanDelay?: number;
  showSettings?: boolean;
  continuous?: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanAction,
  onErrorAction,
  className,
  autoStart = false,
  allowedFormats = ['CODE_128', 'CODE_39', 'EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'QR_CODE'],
  scanDelay = 500,
  showSettings = true,
  continuous = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [lastScan, setLastScan] = useState<BarcodeResult | null>(null);
  const [scanCount, setScanCount] = useState(0);

  // Initialize reader
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    
    // Get available video devices
    navigator.mediaDevices.enumerateDevices()
      .then(deviceInfos => {
        const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          // Prefer back camera if available
          const backCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('environment')
          );
          setSelectedDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
        }
      })
      .catch(err => {
        setError('Failed to access camera devices');
        onErrorAction?.(err.message);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId, onErrorAction]);

  // Auto start effect - moved after startScanning definition
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (readerRef.current) {
      readerRef.current.reset();
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (!readerRef.current || !videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: selectedDeviceId ? undefined : { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Start scanning
      const scan = () => {
        if (!isScanning || !readerRef.current || !videoRef.current) return;

        try {
          const result = readerRef.current.decodeFromVideoDevice(
            selectedDeviceId || null,
            videoRef.current,
            (result, error) => {
              if (result) {
                const barcodeResult: BarcodeResult = {
                  text: result.getText(),
                  format: result.getBarcodeFormat().toString(),
                  timestamp: new Date(),
                };

                setLastScan(barcodeResult);
                setScanCount(prev => prev + 1);
                onScanAction?.(barcodeResult);

                if (!continuous) {
                  stopScanning();
                }
              } else if (error && !(error instanceof NotFoundException)) {
                console.warn('Barcode scan error:', error);
                if (error instanceof ChecksumException || error instanceof FormatException) {
                  setError('Invalid barcode format detected');
                }
              }
            }
          );
        } catch (err) {
          console.error('Scanning error:', err);
          setError('Failed to scan barcode');
          onErrorAction?.(err instanceof Error ? err.message : 'Unknown scanning error');
        }
      };

      // Start scanning with delay
      scanTimeoutRef.current = setTimeout(scan, scanDelay);

    } catch (err) {
      console.error('Camera access error:', err);
      setError('Failed to access camera');
      setIsScanning(false);
      onErrorAction?.(err instanceof Error ? err.message : 'Camera access failed');
    }
  }, [selectedDeviceId, onScanAction, onErrorAction, scanDelay, continuous, stopScanning, isScanning]);

  // Auto start effect
  useEffect(() => {
    if (autoStart && !isScanning) {
      startScanning();
    }
  }, [autoStart, startScanning, isScanning]);

  const resetScanner = useCallback(() => {
    stopScanning();
    setError(null);
    setLastScan(null);
    setScanCount(0);
  }, [stopScanning]);

  const switchCamera = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (isScanning) {
      stopScanning();
      setTimeout(() => startScanning(), 100);
    }
  }, [isScanning, stopScanning, startScanning]);

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Barcode Scanner</CardTitle>
          <div className="flex gap-2">
            {scanCount > 0 && (
              <Badge variant="secondary">
                Scanned: {scanCount}
              </Badge>
            )}
            {showSettings && devices.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextDevice = devices[
                    (devices.findIndex(d => d.deviceId === selectedDeviceId) + 1) % devices.length
                  ];
                  switchCamera(nextDevice.deviceId);
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Preview */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 border-2 border-green-500 rounded-lg">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-32 border-2 border-red-500 border-dashed rounded animate-pulse" />
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="absolute top-2 right-2">
            {isScanning ? (
              <Badge className="bg-green-500">
                <Camera className="h-3 w-3 mr-1" />
                Scanning
              </Badge>
            ) : (
              <Badge variant="secondary">
                <CameraOff className="h-3 w-3 mr-1" />
                Stopped
              </Badge>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Last Scan Result */}
        {lastScan && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-800">
              <div className="font-medium">Last Scan:</div>
              <div className="font-mono">{lastScan.text}</div>
              <div className="text-xs text-green-600">
                Format: {lastScan.format} | {lastScan.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="flex-1">
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
          
          <Button onClick={resetScanner} variant="outline" size="icon">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Camera Selection */}
        {showSettings && devices.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Camera:</label>
            <select
              value={selectedDeviceId}
              onChange={(e) => switchCamera(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.substring(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
