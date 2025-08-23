import { NextRequest, NextResponse } from 'next/server';
import { BarcodeService } from '@/lib/barcode-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');
    const search = searchParams.get('search');
    const action = searchParams.get('action') || 'lookup';

    if (action === 'lookup' && barcode) {
      const result = await BarcodeService.lookupProductByBarcode(barcode);
      return NextResponse.json(result);
    }

    if (action === 'search' && search) {
      const results = await BarcodeService.searchProducts(search);
      return NextResponse.json({ success: true, results });
    }

    if (action === 'list') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const results = await BarcodeService.getProductsWithBarcodes(limit);
      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Barcode API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, barcode, barcodeType, action } = body;

    if (action === 'update') {
      if (!productId || !barcode) {
        return NextResponse.json(
          { success: false, error: 'Product ID and barcode are required' },
          { status: 400 }
        );
      }

      const result = await BarcodeService.updateProductBarcode(
        productId,
        barcode,
        barcodeType
      );
      return NextResponse.json(result);
    }

    if (action === 'remove') {
      if (!productId) {
        return NextResponse.json(
          { success: false, error: 'Product ID is required' },
          { status: 400 }
        );
      }

      const result = await BarcodeService.removeProductBarcode(productId);
      return NextResponse.json(result);
    }

    if (action === 'validate') {
      if (!barcode) {
        return NextResponse.json(
          { success: false, error: 'Barcode is required' },
          { status: 400 }
        );
      }

      const validation = BarcodeService.validateBarcode(barcode, barcodeType);
      return NextResponse.json({ success: true, validation });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Barcode API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
