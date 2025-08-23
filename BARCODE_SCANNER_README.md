# Barcode Scanner System

A robust and modular barcode scanning system for inventory management, built with React, TypeScript, and modern web APIs.

## Features

### 🎯 Core Capabilities
- **Multi-format Support**: CODE128, CODE39, EAN13, EAN8, UPC-A, UPC-E, QR Code, and more
- **Camera Scanning**: Real-time barcode scanning using device cameras
- **Manual Entry**: Fallback option for manual barcode input
- **Product Lookup**: Instant product information retrieval
- **Inventory Actions**: Sales, purchases, adjustments, and returns
- **Barcode Management**: Assign and manage barcodes for products

### 📱 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Camera Selection**: Automatic preference for back/environment cameras
- **Scan History**: Track recent scanning activity
- **Error Handling**: Graceful fallbacks and user feedback
- **Accessibility**: Keyboard navigation and screen reader support

### 🔧 Technical Features
- **TypeScript**: Full type safety and IntelliSense support
- **Modular Architecture**: Reusable components for different use cases
- **Database Integration**: Prisma ORM with PostgreSQL
- **API Endpoints**: RESTful APIs for barcode operations
- **Performance Optimized**: Efficient scanning with configurable delays

## Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Camera-enabled device for scanning

### Dependencies
```bash
npm install @zxing/library @zxing/browser html5-qrcode react-webcam jsbarcode
```

### Database Setup
1. Update your Prisma schema (already included):
```prisma
model Products {
  // ... existing fields
  barcode     String?      @unique
  barcodeType BarcodeType? @default(CODE128)
  // ... rest of model
}

enum BarcodeType {
  CODE128
  CODE39
  CODE93
  EAN13
  EAN8
  UPC_A
  UPC_E
  QR_CODE
  DATA_MATRIX
  PDF417
  AZTEC
  CODABAR
  ITF
}
```

2. Run the migration:
```bash
npx prisma migrate dev --name add_barcode_support
```

## Usage

### Basic Barcode Scanner
```tsx
import { BarcodeScanner } from '@/components/barcode';

function MyComponent() {
  const handleScan = (result) => {
    console.log('Scanned:', result.text, result.format);
  };

  return (
    <BarcodeScanner
      onScanAction={handleScan}
      autoStart={false}
      continuous={true}
    />
  );
}
```

### Inventory Scanner
```tsx
import { InventoryBarcodeScanner } from '@/components/barcode';

function InventoryPage() {
  const handleInventoryAction = (action) => {
    // Handle sale, purchase, adjustment, or return
    console.log('Inventory action:', action);
  };

  const handleProductSelect = (product, variant) => {
    // Handle product selection
    console.log('Product selected:', product, variant);
  };

  return (
    <InventoryBarcodeScanner
      onInventoryAction={handleInventoryAction}
      onProductSelect={handleProductSelect}
      allowInventoryActions={true}
      title="Inventory Scanner"
    />
  );
}
```

### Barcode Management
```tsx
import { BarcodeManagement } from '@/components/barcode';

function BarcodeAdminPage() {
  return <BarcodeManagement />;
}
```

### Service Layer
```tsx
import { BarcodeService } from '@/lib/barcode-service';

// Lookup product by barcode
const result = await BarcodeService.lookupProductByBarcode('123456789');

// Search products
const products = await BarcodeService.searchProducts('query');

// Update product barcode
await BarcodeService.updateProductBarcode(productId, barcode, 'CODE128');
```

## API Endpoints

### GET /api/barcode
- `?action=lookup&barcode=123456789` - Look up product by barcode
- `?action=search&search=query` - Search products by name or barcode
- `?action=list&limit=50` - List products with barcodes

### POST /api/barcode
```json
{
  "action": "update",
  "productId": "prod_123",
  "barcode": "123456789",
  "barcodeType": "CODE128"
}
```

```json
{
  "action": "remove",
  "productId": "prod_123"
}
```

```json
{
  "action": "validate",
  "barcode": "123456789",
  "barcodeType": "CODE128"
}
```

## Component Props

### BarcodeScanner
```tsx
interface BarcodeScannerProps {
  onScanAction?: (result: BarcodeResult) => void;
  onErrorAction?: (error: string) => void;
  className?: string;
  autoStart?: boolean;
  allowedFormats?: string[];
  scanDelay?: number;
  showSettings?: boolean;
  continuous?: boolean;
}
```

### InventoryBarcodeScanner
```tsx
interface InventoryBarcodeScannerProps {
  onInventoryAction?: (action: InventoryAction) => void;
  onProductSelect?: (product: Product, variant: ProductVariant) => void;
  allowInventoryActions?: boolean;
  title?: string;
  className?: string;
}
```

## Integration Examples

### Order Management
```tsx
function OrderPage() {
  const [orderItems, setOrderItems] = useState([]);

  const handleProductSelect = (product, variant) => {
    setOrderItems(prev => [...prev, { product, variant, quantity: 1 }]);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <InventoryBarcodeScanner onProductSelect={handleProductSelect} />
      <OrderSummary items={orderItems} />
    </div>
  );
}
```

### Inventory Tracking
```tsx
function InventoryAdjustment() {
  const handleInventoryAction = async (action) => {
    // Update local state
    updateInventory(action);
    
    // Sync with backend
    await fetch('/api/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(action)
    });
  };

  return (
    <InventoryBarcodeScanner
      onInventoryAction={handleInventoryAction}
      allowInventoryActions={true}
    />
  );
}
```

### Receiving Shipments
```tsx
function ReceivingPage() {
  const [receivedItems, setReceivedItems] = useState([]);

  const handleProductSelect = (product, variant) => {
    setReceivedItems(prev => {
      const existing = prev.find(item => item.variantId === variant.id);
      if (existing) {
        return prev.map(item =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...variant, quantity: 1 }];
    });
  };

  return (
    <InventoryBarcodeScanner
      onProductSelect={handleProductSelect}
      allowInventoryActions={false}
      title="Receiving Scanner"
    />
  );
}
```

## Configuration

### Supported Barcode Formats
- **CODE128**: Most versatile, supports all ASCII characters
- **CODE39**: Legacy format, alphanumeric + special characters
- **EAN13**: 13-digit European Article Number
- **EAN8**: 8-digit short EAN
- **UPC-A**: 12-digit Universal Product Code
- **UPC-E**: 6-digit compressed UPC
- **QR_CODE**: 2D matrix barcode
- **DATA_MATRIX**: Compact 2D barcode
- **PDF417**: High-capacity 2D barcode

### Camera Settings
```tsx
const cameraConstraints = {
  video: {
    facingMode: { ideal: 'environment' }, // Back camera
    width: { ideal: 1280 },
    height: { ideal: 720 },
    focusMode: 'continuous',
    exposureMode: 'continuous'
  }
};
```

### Performance Optimization
- **Scan Delay**: Configurable delay between scans (default: 500ms)
- **Format Filtering**: Specify allowed barcode formats to improve speed
- **Continuous Scanning**: Enable/disable continuous scanning mode
- **Error Handling**: Graceful handling of camera and scanning errors

## Security Considerations

### Data Privacy
- Camera access requires user permission
- No barcode data is stored locally unless explicitly saved
- All API calls should be authenticated and authorized

### Input Validation
- Barcode format validation before database operations
- SQL injection prevention through Prisma ORM
- Rate limiting on API endpoints recommended

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   - Ensure HTTPS connection (required for camera access)
   - Check browser permissions
   - Verify camera is not in use by another application

2. **Barcode Not Recognized**
   - Check barcode format compatibility
   - Ensure good lighting conditions
   - Clean camera lens
   - Try manual entry as fallback

3. **Performance Issues**
   - Increase scan delay for slower devices
   - Reduce camera resolution
   - Limit allowed barcode formats

4. **Database Errors**
   - Verify Prisma schema is up to date
   - Check database connection
   - Ensure unique constraint on barcode field

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Requires iOS 11+ / macOS High Sierra+
- **Mobile**: Best performance on native browsers

## Development

### File Structure
```
src/
├── components/barcode/
│   ├── BarcodeScanner.tsx           # Core scanner component
│   ├── InventoryBarcodeScanner.tsx  # Inventory-focused scanner
│   ├── BarcodeManagement.tsx        # Admin interface
│   └── index.ts                     # Exports
├── lib/
│   └── barcode-service.ts           # Service layer
└── app/api/barcode/
    └── route.ts                     # API endpoints
```

### Testing
- Unit tests for service layer functions
- Integration tests for API endpoints
- E2E tests for scanner workflows
- Camera simulation for CI/CD environments

### Contributing
1. Follow TypeScript strict mode
2. Use proper error handling
3. Include JSDoc comments
4. Test on multiple devices/browsers
5. Update documentation for new features

## License
MIT License - see LICENSE file for details
