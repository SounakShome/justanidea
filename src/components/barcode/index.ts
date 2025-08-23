// Core barcode scanning components
export { BarcodeScanner } from './BarcodeScanner';
export type { BarcodeResult, BarcodeScannerProps } from './BarcodeScanner';

// Inventory-focused barcode scanner
export { InventoryBarcodeScanner } from './InventoryBarcodeScanner';
export type { InventoryBarcodeScannerProps } from './InventoryBarcodeScanner';

// Barcode management interface
export { BarcodeManagement } from './BarcodeManagement';

// Service for barcode operations
export { BarcodeService } from '@/lib/barcode-service';
export type { ProductLookupResult } from '@/lib/barcode-service';
