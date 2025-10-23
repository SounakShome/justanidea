"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CompactBarcodeScanner } from "@/components/CompactBarcodeScanner";

// Interface for combobox items
interface ComboboxItem {
  id: string;
  name: string;
  division?: string;
  [key: string]: string | undefined;
}

// Helper component for form inputs with labels and errors
const FormField = ({
  label,
  error,
  children,
  className = ""
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium mb-1">{label}</label>
    {children}
    {error && <span className="text-red-500 text-xs">{error}</span>}
  </div>
);

// Custom Combobox component for forms
const FormCombobox = ({
  placeholder,
  items,
  value,
  onValueChange,
  displayKey = "name",
  valueKey = "id"
}: {
  placeholder: string;
  items: ComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  displayKey?: string;
  valueKey?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? items.find((item) => item[valueKey] === value)?.[displayKey] || placeholder
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item[valueKey]}
                  value={item[displayKey]}
                  onSelect={() => {
                    const selectedValue = item[valueKey];
                    if (selectedValue) {
                      onValueChange(selectedValue);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item[valueKey] ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item[displayKey]}
                  {item.division && ` (${item.division})`}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export function CustomerForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerFormData[]>([{
    name: "",
    GSTIN: "",
    phone: "",
    address: "",
    state: "KARNATAKA",
    code: 29
  }]);

  interface CustomerFormData {
    name: string;
    GSTIN: string;
    phone: string;
    address: string;
    state: string;
    code: number;
  }

  const addCustomerInstance = () => {
    setCustomers([...customers, {
      name: "",
      GSTIN: "",
      phone: "",
      address: "",
      state: "KARNATAKA",
      code: 29
    }]);
  };

  const removeCustomerInstance = (index: number) => {
    if (customers.length > 1) {
      setCustomers(customers.filter((_, i) => i !== index));
    }
  };

  const updateCustomer = (index: number, field: keyof CustomerFormData, value: string | number) => {
    const updated = [...customers];
    updated[index] = { ...updated[index], [field]: value };
    setCustomers(updated);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = customers.map(async (customer) => {
        const res = await fetch("/api/addCustomer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customer),
        });

        if (!res.ok) {
          throw new Error(`Failed to create customer: ${customer.name}`);
        }
        return customer;
      });

      await Promise.all(promises);

      toast("Customers created", {
        description: `${customers.length} customer(s) have been added successfully.`,
      });

      setLoading(false);
      onClose?.();
    } catch {
      toast.error("Failed to create some customers");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mobile-first header */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Add New Customers</h2>
          <p className="text-sm text-muted-foreground">
            Create customer profiles for your business
          </p>
        </div>

        {/* Customer instances */}
        {customers.map((customer, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Customer {index + 1}</CardTitle>
                {customers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomerInstance(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mobile-first: Single column on mobile */}
              <div className="space-y-4">
                <FormField label="Name" error="">
                  <Input
                    placeholder="Customer Name"
                    value={customer.name}
                    onChange={(e) => updateCustomer(index, "name", e.target.value)}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="GSTIN" error="">
                    <Input
                      placeholder="GSTIN Number"
                      value={customer.GSTIN}
                      onChange={(e) => updateCustomer(index, "GSTIN", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Phone" error="">
                    <Input
                      placeholder="Phone Number"
                      value={customer.phone}
                      onChange={(e) => updateCustomer(index, "phone", e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Address" error="">
                  <Input
                    placeholder="Full Address"
                    value={customer.address}
                    onChange={(e) => updateCustomer(index, "address", e.target.value)}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="State" error="">
                    <Input
                      placeholder="State"
                      value={customer.state}
                      onChange={(e) => updateCustomer(index, "state", e.target.value)}
                    />
                  </FormField>

                  <FormField label="State Code" error="">
                    <Input
                      type="number"
                      placeholder="29"
                      value={customer.code}
                      onChange={(e) => updateCustomer(index, "code", Number(e.target.value))}
                    />
                  </FormField>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Action buttons - mobile-first layout */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addCustomerInstance}
            className="w-full sm:w-auto"
          >
            Add Another Customer
          </Button>
          
          <div className="flex gap-2 sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:w-auto"
            >
              {loading ? "Creating..." : `Create ${customers.length} Customer${customers.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function SupplierForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierFormData[]>([{
    companyName: "",
    division: "",
    address: "",
    phone: "",
    CIN: "",
    GSTIN: "",
    PAN: "",
    Supp_State: "",
    Code: "",
  }]);

  interface SupplierFormData {
    companyName: string;
    division: string;
    address: string;
    phone: string;
    CIN: string;
    GSTIN: string;
    PAN: string;
    Supp_State: string;
    Code: string;
  }

  const addSupplierInstance = () => {
    setSuppliers([...suppliers, {
      companyName: "",
      division: "",
      address: "",
      phone: "",
      CIN: "",
      GSTIN: "",
      PAN: "",
      Supp_State: "",
      Code: "",
    }]);
  };

  const removeSupplierInstance = (index: number) => {
    if (suppliers.length > 1) {
      setSuppliers(suppliers.filter((_, i) => i !== index));
    }
  };

  const updateSupplier = (index: number, field: keyof SupplierFormData, value: string) => {
    const updated = [...suppliers];
    updated[index] = { ...updated[index], [field]: value };
    setSuppliers(updated);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = suppliers.map(async (supplier) => {
        const res = await fetch("/api/addSupplier", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplier),
        });

        if (!res.ok) {
          throw new Error(`Failed to create supplier: ${supplier.companyName}`);
        }
        return supplier;
      });

      await Promise.all(promises);

      toast("Suppliers created", {
        description: `${suppliers.length} supplier(s) have been added successfully.`,
      });

      setLoading(false);
      onClose?.();
    } catch {
      toast.error("Failed to create some suppliers");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mobile-first header */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Add New Suppliers</h2>
          <p className="text-sm text-muted-foreground">
            Create supplier profiles for your business
          </p>
        </div>

        {/* Supplier instances */}
        {suppliers.map((supplier, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Supplier {index + 1}</CardTitle>
                {suppliers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSupplierInstance(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Company basics - mobile-first */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Company Name" error="">
                    <Input
                      placeholder="Acme Corporation"
                      value={supplier.companyName}
                      onChange={(e) => updateSupplier(index, "companyName", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Division" error="">
                    <Input
                      placeholder="Manufacturing Division"
                      value={supplier.division}
                      onChange={(e) => updateSupplier(index, "division", e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Address" error="">
                  <Input
                    placeholder="123 Business Ave, City"
                    value={supplier.address}
                    onChange={(e) => updateSupplier(index, "address", e.target.value)}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Phone" error="">
                    <Input
                      placeholder="(123) 456-7890"
                      value={supplier.phone}
                      onChange={(e) => updateSupplier(index, "phone", e.target.value)}
                    />
                  </FormField>

                  <FormField label="CIN" error="">
                    <Input
                      placeholder="CIN Number"
                      value={supplier.CIN}
                      onChange={(e) => updateSupplier(index, "CIN", e.target.value)}
                    />
                  </FormField>
                </div>

                {/* Tax details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="GSTIN" error="">
                    <Input
                      placeholder="GSTIN Number"
                      value={supplier.GSTIN}
                      onChange={(e) => updateSupplier(index, "GSTIN", e.target.value)}
                    />
                  </FormField>

                  <FormField label="PAN" error="">
                    <Input
                      placeholder="PAN Number"
                      value={supplier.PAN}
                      onChange={(e) => updateSupplier(index, "PAN", e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Supplier State" error="">
                    <Input
                      placeholder="State Name"
                      value={supplier.Supp_State}
                      onChange={(e) => updateSupplier(index, "Supp_State", e.target.value)}
                    />
                  </FormField>

                  <FormField label="State Code" error="">
                    <Input
                      placeholder="State Code"
                      value={supplier.Code}
                      onChange={(e) => updateSupplier(index, "Code", e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Action buttons - mobile-first layout */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addSupplierInstance}
            className="w-full sm:w-auto"
          >
            Add Another Supplier
          </Button>
          
          <div className="flex gap-2 sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:w-auto"
            >
              {loading ? "Creating..." : `Create ${suppliers.length} Supplier${suppliers.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ProductForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string, division: string }>>([]);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [currentSizeContext, setCurrentSizeContext] = useState<{ productIndex: number; variantIndex: number; sizeIndex?: number } | null>(null);
  const [tempSizeData, setTempSizeData] = useState<SizeData>({ size: "", buyingPrice: "", sellingPrice: "", stock: "0" });
  const [products, setProducts] = useState<ProductFormData[]>([{
    name: "",
    HSN: "",
    includeVariants: false,
    variants: []
  }]);

  interface SizeData {
    size: string;
    buyingPrice: string;
    sellingPrice: string;
    stock: string;
  }

  interface VariantData {
    name: string; // variant code
    suppId: string;
    barcode: string;
    sizes: SizeData[];
  }

  interface ProductFormData {
    name: string;
    HSN: string;
    includeVariants: boolean;
    variants: VariantData[];
  }

  const [expandedVariants, setExpandedVariants] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const suppliers = await fetch("/api/getSuppliers").then((res) => res.json());
        setSuppliers(suppliers);
      } catch {
        console.error("Failed to fetch suppliers");
      }
    };
    fetchSuppliers();
  }, []);

  const toggleVariantExpanded = (productIndex: number, variantIndex: number) => {
    const key = `${productIndex}-${variantIndex}`;
    setExpandedVariants(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isVariantExpanded = (productIndex: number, variantIndex: number) => {
    const key = `${productIndex}-${variantIndex}`;
    return expandedVariants[key] !== false; // Default to expanded (true)
  };

  const addProductInstance = () => {
    setProducts([...products, {
      name: "",
      HSN: "",
      includeVariants: false,
      variants: []
    }]);
  };

  const removeProductInstance = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof ProductFormData, value: string | boolean) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const addVariantToProduct = (productIndex: number) => {
    const updated = [...products];
    if (!updated[productIndex].variants) {
      updated[productIndex].variants = [];
    }
    updated[productIndex].variants.push({
      name: "",
      suppId: "",
      barcode: "",
      sizes: []
    });
    setProducts(updated);
    // Auto-expand the newly added variant
    const newVariantIndex = updated[productIndex].variants.length - 1;
    setExpandedVariants(prev => ({
      ...prev,
      [`${productIndex}-${newVariantIndex}`]: true
    }));
  };

  const removeVariantFromProduct = (productIndex: number, variantIndex: number) => {
    const updated = [...products];
    updated[productIndex].variants = updated[productIndex].variants.filter((_, i) => i !== variantIndex);
    setProducts(updated);
  };

  const updateVariant = (productIndex: number, variantIndex: number, field: keyof VariantData, value: string) => {
    const updated = [...products];
    updated[productIndex].variants[variantIndex] = {
      ...updated[productIndex].variants[variantIndex],
      [field]: value
    };
    setProducts(updated);
  };

  const addSizeToVariant = (productIndex: number, variantIndex: number) => {
    setCurrentSizeContext({ productIndex, variantIndex });
    setTempSizeData({ size: "", buyingPrice: "", sellingPrice: "", stock: "0" });
    setSizeDialogOpen(true);
  };

  const editSize = (productIndex: number, variantIndex: number, sizeIndex: number) => {
    const sizeData = products[productIndex].variants[variantIndex].sizes[sizeIndex];
    setCurrentSizeContext({ productIndex, variantIndex, sizeIndex });
    setTempSizeData({ ...sizeData });
    setSizeDialogOpen(true);
  };

  const saveSizeData = () => {
    if (!currentSizeContext) return;

    if (!tempSizeData.size || !tempSizeData.buyingPrice) {
      toast.error("Please fill size and buying price");
      return;
    }

    const updated = [...products];
    const { productIndex, variantIndex, sizeIndex } = currentSizeContext;

    if (sizeIndex !== undefined) {
      // Edit existing size
      updated[productIndex].variants[variantIndex].sizes[sizeIndex] = { ...tempSizeData };
    } else {
      // Check if size contains commas for bulk add
      const sizes = tempSizeData.size.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      if (sizes.length > 1) {
        // Bulk add multiple sizes
        sizes.forEach(size => {
          updated[productIndex].variants[variantIndex].sizes.push({
            size: size,
            buyingPrice: tempSizeData.buyingPrice,
            sellingPrice: tempSizeData.sellingPrice,
            stock: tempSizeData.stock
          });
        });
        toast.success(`Added ${sizes.length} sizes`);
      } else {
        // Add single size
        updated[productIndex].variants[variantIndex].sizes.push({ ...tempSizeData });
      }
    }

    setProducts(updated);
    setSizeDialogOpen(false);
    setCurrentSizeContext(null);
    setTempSizeData({ size: "", buyingPrice: "", sellingPrice: "", stock: "0" });
  };

  const removeSizeFromVariant = (productIndex: number, variantIndex: number, sizeIndex: number) => {
    const updated = [...products];
    updated[productIndex].variants[variantIndex].sizes = updated[productIndex].variants[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
    setProducts(updated);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = products.map(async (product) => {
        // Flatten the hierarchical structure for the API
        const flattenedVariants = product.includeVariants 
          ? product.variants.flatMap(variant => 
              variant.sizes.map(size => ({
                name: variant.name,
                size: size.size,
                price: size.buyingPrice,
                sellingPrice: size.sellingPrice,
                stock: size.stock,
                suppId: variant.suppId,
                barcode: variant.barcode
              }))
            )
          : [];

        const res = await fetch("/api/addProduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: product.name,
            HSN: product.HSN,
            variants: flattenedVariants
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to create product: ${product.name}`);
        }
        return product;
      });

      await Promise.all(promises);

      const totalVariants = products.reduce((sum, p) => 
        sum + (p.includeVariants ? p.variants.reduce((vSum, v) => vSum + v.sizes.length, 0) : 0), 0
      );

      toast("Products created", {
        description: `${products.length} product(s) with ${totalVariants} variant(s) have been added to your inventory.`,
      });

      setLoading(false);
      onClose?.();
    } catch {
      toast.error("Failed to create some products");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mobile-first header */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Add New Products</h2>
          <p className="text-sm text-muted-foreground">
            Create products to add to your inventory
          </p>
        </div>

        {/* Product instances */}
        {products.map((product, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Product {index + 1}</CardTitle>
                {products.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProductInstance(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mobile-first: Stack on mobile, row on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Product Name" error="">
                  <Input
                    placeholder="Premium Widget"
                    value={product.name}
                    onChange={(e) => updateProduct(index, "name", e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="HSN Code" error="">
                  <Input
                    placeholder="12345678"
                    value={product.HSN}
                    onChange={(e) => updateProduct(index, "HSN", e.target.value)}
                  />
                </FormField>
              </div>

              {/* Add Variants Option */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id={`includeVariants-${index}`}
                    checked={product.includeVariants}
                    onChange={(e) => updateProduct(index, "includeVariants", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`includeVariants-${index}`} className="text-sm font-medium cursor-pointer">
                    Add Variants Now (Optional)
                  </label>
                </div>

                {/* Variants Section */}
                {product.includeVariants && (
                  <Card className="bg-muted/30 border-dashed">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          Variants for {product.name || "this product"}
                          {product.variants.length > 0 && (
                            <span className="text-xs font-normal text-muted-foreground">
                              ({product.variants.length})
                            </span>
                          )}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {product.variants.map((variant, vIndex) => {
                        const isExpanded = isVariantExpanded(index, vIndex);
                        const variantSummary = `${variant.name || 'Variant Code'} - ${variant.sizes.length} size(s)`;
                        
                        return (
                          <Card key={vIndex} className="bg-background border-l-4 border-l-primary/30">
                            <CardContent className="p-3 space-y-3">
                              <div 
                                className="flex items-center justify-between cursor-pointer hover:bg-accent/50 -m-3 p-3 rounded-lg transition-colors"
                                onClick={() => toggleVariantExpanded(index, vIndex)}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <ChevronsUpDown className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium truncate">
                                      Variant {vIndex + 1}
                                    </span>
                                    {!isExpanded && (
                                      <span className="text-xs text-muted-foreground truncate">
                                        {variantSummary}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeVariantFromProduct(index, vIndex);
                                  }}
                                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                                >
                                  Remove
                                </Button>
                              </div>

                              {isExpanded && (
                                <div className="space-y-3 pt-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FormField label="Variant Code" error="">
                                      <Input
                                        placeholder="e.g., 1001 BOYLEG"
                                        value={variant.name}
                                        onChange={(e) => updateVariant(index, vIndex, "name", e.target.value)}
                                        className="h-9"
                                      />
                                    </FormField>

                                    <FormField label="Supplier" error="">
                                      <FormCombobox
                                        placeholder="Select supplier"
                                        items={suppliers}
                                        value={variant.suppId}
                                        onValueChange={(value) => updateVariant(index, vIndex, "suppId", value)}
                                        displayKey="name"
                                        valueKey="id"
                                      />
                                    </FormField>
                                  </div>

                                  <FormField label="Barcode (Optional)" error="">
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="123456789012"
                                        value={variant.barcode}
                                        onChange={(e) => updateVariant(index, vIndex, "barcode", e.target.value)}
                                        className="h-9 flex-1"
                                      />
                                      <CompactBarcodeScanner 
                                        onScanSuccessAction={(code) => updateVariant(index, vIndex, "barcode", code)}
                                        buttonText="Scan"
                                        buttonVariant="outline"
                                      />
                                    </div>
                                  </FormField>

                                  {/* Sizes Section */}
                                  <div className="border-t pt-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">Sizes ({variant.sizes.length})</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addSizeToVariant(index, vIndex)}
                                        className="h-7 text-xs"
                                      >
                                        + Add Size
                                      </Button>
                                    </div>

                                    {variant.sizes.length === 0 ? (
                                      <div className="text-center py-3 text-xs text-muted-foreground bg-muted/30 rounded-md">
                                        No sizes added yet. Click "+ Add Size" to add.
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        {variant.sizes.map((sizeData, sIndex) => (
                                          <div 
                                            key={sIndex} 
                                            className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors group"
                                          >
                                            <div className="flex items-center gap-3 text-xs">
                                              <span className="font-medium min-w-[60px]">Size: {sizeData.size}</span>
                                              <span className="text-muted-foreground">Buy: ₹{sizeData.buyingPrice}</span>
                                              <span className="text-muted-foreground">Sell: ₹{sizeData.sellingPrice}</span>
                                              <span className="text-muted-foreground">Qty: {sizeData.stock}</span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => editSize(index, vIndex, sIndex)}
                                                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                                              >
                                                ✎
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSizeFromVariant(index, vIndex, sIndex)}
                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                              >
                                                ×
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}

                  {product.variants.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No variants added yet. Click below to add sizes.
                    </div>
                  )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addVariantToProduct(index)}
                        className="w-full"
                      >
                        + Add Variant Code
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Action buttons - mobile-first layout */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addProductInstance}
            className="w-full sm:w-auto"
          >
            Add Another Product
          </Button>
          
          <div className="flex gap-2 sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:w-auto"
            >
              {loading ? "Creating..." : (() => {
                const totalVariants = products.reduce((sum, p) => 
                  sum + (p.includeVariants ? p.variants.reduce((vSum, v) => vSum + v.sizes.length, 0) : 0), 0
                );
                const productText = `${products.length} Product${products.length > 1 ? 's' : ''}`;
                const variantText = totalVariants > 0 ? ` with ${totalVariants} Variant${totalVariants > 1 ? 's' : ''}` : '';
                return `Create ${productText}${variantText}`;
              })()}
            </Button>
          </div>
        </div>
      </form>

      {/* Size Dialog Modal */}
      <Dialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentSizeContext?.sizeIndex !== undefined ? 'Edit Size' : 'Add Size'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField label="Size" error="">
              <Input
                placeholder="e.g., 100, XL, M"
                value={tempSizeData.size}
                onChange={(e) => setTempSizeData({ ...tempSizeData, size: e.target.value })}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground mt-1">
                💡 Tip: Enter multiple sizes separated by commas (e.g., "S, M, L, XL") to add them all at once
              </p>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Buying Price (₹)" error="">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="92.00"
                  value={tempSizeData.buyingPrice}
                  onChange={(e) => {
                    const buyPrice = e.target.value;
                    // Auto-fill selling price only if it's empty or equals the old buying price
                    const shouldAutoFill = !tempSizeData.sellingPrice || tempSizeData.sellingPrice === tempSizeData.buyingPrice;
                    setTempSizeData({ 
                      ...tempSizeData, 
                      buyingPrice: buyPrice,
                      sellingPrice: shouldAutoFill ? buyPrice : tempSizeData.sellingPrice
                    });
                  }}
                  className="h-9"
                />
              </FormField>

              <FormField label="Selling Price (₹)" error="">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Same as buying"
                  value={tempSizeData.sellingPrice}
                  onChange={(e) => {
                    setTempSizeData({ 
                      ...tempSizeData, 
                      sellingPrice: e.target.value
                    });
                  }}
                  className="h-9"
                />
              </FormField>
            </div>

            <FormField label="Stock Quantity" error="">
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={tempSizeData.stock}
                onChange={(e) => setTempSizeData({ ...tempSizeData, stock: e.target.value })}
                className="h-9"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSizeDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveSizeData}>
              {currentSizeContext?.sizeIndex !== undefined ? 'Update' : 'Add'} Size
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function VariantForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [parentProducts, setParentProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string, division: string }>>([]);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [currentSizeContext, setCurrentSizeContext] = useState<{ variantIndex: number; sizeIndex?: number } | null>(null);
  const [tempSizeData, setTempSizeData] = useState<SizeData>({ size: "", buyingPrice: "", sellingPrice: "", stock: "0" });
  const [variants, setVariants] = useState<VariantFormData[]>([{
    parentProductId: "",
    name: "",
    barcode: "",
    suppId: "",
    sizes: []
  }]);

  interface SizeData {
    size: string;
    buyingPrice: string;
    sellingPrice: string;
    stock: string;
  }

  interface VariantFormData {
    parentProductId: string;
    name: string;
    barcode: string;
    suppId: string;
    sizes: SizeData[];
  }

  useEffect(() => {
    const fetchParentProducts = async () => {
      try {
        const products = await fetch("/api/getItems").then((res) => res.json());
        setParentProducts(products);
      } catch {
        console.error("Failed to fetch products");
      }
    };

    const fetchSuppliers = async () => {
      try {
        const suppliers = await fetch("/api/getSuppliers").then((res) => res.json());
        setSuppliers(suppliers);
      } catch {
        console.error("Failed to fetch suppliers");
      }
    };

    fetchSuppliers();
    fetchParentProducts();
  }, []);

  const addVariantInstance = () => {
    setVariants([...variants, {
      parentProductId: "",
      name: "",
      barcode: "",
      suppId: "",
      sizes: []
    }]);
  };

  const removeVariantInstance = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof VariantFormData, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Size management functions
  const addSizeToVariant = (variantIndex: number) => {
    setCurrentSizeContext({ variantIndex });
    setTempSizeData({ size: "", buyingPrice: "", sellingPrice: "", stock: "0" });
    setSizeDialogOpen(true);
  };

  const editSize = (variantIndex: number, sizeIndex: number) => {
    const sizeData = variants[variantIndex].sizes[sizeIndex];
    setCurrentSizeContext({ variantIndex, sizeIndex });
    setTempSizeData({ ...sizeData });
    setSizeDialogOpen(true);
  };

  const saveSizeData = () => {
    if (!currentSizeContext) return;

    if (!tempSizeData.size || !tempSizeData.buyingPrice) {
      toast.error("Please fill size and buying price");
      return;
    }

    const updated = [...variants];
    const { variantIndex, sizeIndex } = currentSizeContext;

    if (sizeIndex !== undefined) {
      // Edit existing size
      updated[variantIndex].sizes[sizeIndex] = { ...tempSizeData };
    } else {
      // Check if size contains commas for bulk add
      const sizes = tempSizeData.size.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      if (sizes.length > 1) {
        // Bulk add multiple sizes
        sizes.forEach(size => {
          updated[variantIndex].sizes.push({
            size: size,
            buyingPrice: tempSizeData.buyingPrice,
            sellingPrice: tempSizeData.sellingPrice,
            stock: tempSizeData.stock
          });
        });
        toast.success(`Added ${sizes.length} sizes`);
      } else {
        // Add single size
        updated[variantIndex].sizes.push({ ...tempSizeData });
      }
    }

    setVariants(updated);
    setSizeDialogOpen(false);
    setCurrentSizeContext(null);
    setTempSizeData({ size: "", buyingPrice: "", sellingPrice: "", stock: "0" });
  };

  const removeSizeFromVariant = (variantIndex: number, sizeIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].sizes = updated[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
    setVariants(updated);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = variants.map(async (variant) => {
        const res = await fetch("/api/addVariant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parentProductId: variant.parentProductId,
            name: variant.name,
            suppId: variant.suppId,
            barcode: variant.barcode,
            sizes: variant.sizes
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to create variant: ${variant.name}`);
        }
        return variant;
      });

      await Promise.all(promises);

      toast("Variants created", {
        description: `${variants.length} variant(s) with ${variants.reduce((sum, v) => sum + v.sizes.length, 0)} size(s) have been added successfully.`,
      });

      setLoading(false);
      onClose?.();
    } catch {
      toast.error("Failed to create some variants");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mobile-first header */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Add Product Variants</h2>
          <p className="text-sm text-muted-foreground">
            Create variants for existing products
          </p>
        </div>

        {/* Variant instances */}
        {variants.map((variant, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Variant {index + 1}
                  {variant.name && (
                    <span className="text-sm text-muted-foreground font-normal ml-2">
                      - {variant.name}
                    </span>
                  )}
                </CardTitle>
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVariantInstance(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Product and Supplier Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Parent Product" error="">
                    <FormCombobox
                      placeholder="Select product"
                      items={parentProducts}
                      value={variant.parentProductId}
                      onValueChange={(value) => updateVariant(index, "parentProductId", value)}
                      displayKey="name"
                      valueKey="id"
                    />
                  </FormField>

                  <FormField label="Supplier" error="">
                    <FormCombobox
                      placeholder="Select supplier"
                      items={suppliers}
                      value={variant.suppId}
                      onValueChange={(value) => updateVariant(index, "suppId", value)}
                      displayKey="name"
                      valueKey="id"
                    />
                  </FormField>
                </div>

                {/* Variant Code */}
                <FormField label="Variant Code" error="">
                  <Input
                    placeholder="e.g., 1001 BOYLEG"
                    value={variant.name}
                    onChange={(e) => updateVariant(index, "name", e.target.value)}
                  />
                </FormField>

                {/* Barcode */}
                <FormField label="Barcode (Optional)" error="">
                  <div className="flex gap-2">
                    <Input
                      placeholder="123456789012"
                      value={variant.barcode}
                      onChange={(e) => updateVariant(index, "barcode", e.target.value)}
                      className="flex-1"
                    />
                    <CompactBarcodeScanner 
                      onScanSuccessAction={(code) => updateVariant(index, "barcode", code)}
                      buttonText="Scan"
                      buttonVariant="outline"
                    />
                  </div>
                </FormField>

                {/* Sizes Section */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sizes ({variant.sizes.length})</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSizeToVariant(index)}
                      className="h-8 text-xs"
                    >
                      + Add Size
                    </Button>
                  </div>

                  {variant.sizes.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground bg-muted/30 rounded-md">
                      No sizes added yet. Click "+ Add Size" to add.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {variant.sizes.map((sizeData, sIndex) => (
                        <div 
                          key={sIndex} 
                          className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-medium min-w-[60px]">Size: {sizeData.size}</span>
                            <span className="text-muted-foreground">Buy: ₹{sizeData.buyingPrice}</span>
                            <span className="text-muted-foreground">Sell: ₹{sizeData.sellingPrice}</span>
                            <span className="text-muted-foreground">Qty: {sizeData.stock}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => editSize(index, sIndex)}
                              className="h-6 w-6 p-0"
                            >
                              ✎
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSizeFromVariant(index, sIndex)}
                              className="h-6 w-6 p-0 text-red-600"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
          </Card>
        ))}

        {/* Action buttons - mobile-first layout */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addVariantInstance}
            className="w-full sm:w-auto"
          >
            Add Another Variant
          </Button>
          
          <div className="flex gap-2 sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || variants.some(v => !v.parentProductId || !v.suppId || v.sizes.length === 0)}
              className="flex-1 sm:w-auto"
            >
              {loading ? "Creating..." : (() => {
                const totalSizes = variants.reduce((sum, v) => sum + v.sizes.length, 0);
                return `Create ${variants.length} Variant${variants.length > 1 ? 's' : ''} with ${totalSizes} Size${totalSizes !== 1 ? 's' : ''}`;
              })()}
            </Button>
          </div>
        </div>
      </form>

      {/* Size Dialog Modal */}
      <Dialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentSizeContext?.sizeIndex !== undefined ? 'Edit Size' : 'Add Size'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField label="Size" error="">
              <Input
                placeholder="e.g., 100, XL, M"
                value={tempSizeData.size}
                onChange={(e) => setTempSizeData({ ...tempSizeData, size: e.target.value })}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground mt-1">
                💡 Tip: Enter multiple sizes separated by commas (e.g., "S, M, L, XL") to add them all at once
              </p>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Buying Price (₹)" error="">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="92.00"
                  value={tempSizeData.buyingPrice}
                  onChange={(e) => {
                    const buyPrice = e.target.value;
                    const shouldAutoFill = !tempSizeData.sellingPrice || tempSizeData.sellingPrice === tempSizeData.buyingPrice;
                    setTempSizeData({ 
                      ...tempSizeData, 
                      buyingPrice: buyPrice,
                      sellingPrice: shouldAutoFill ? buyPrice : tempSizeData.sellingPrice
                    });
                  }}
                  className="h-9"
                />
              </FormField>

              <FormField label="Selling Price (₹)" error="">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Same as buying"
                  value={tempSizeData.sellingPrice}
                  onChange={(e) => {
                    setTempSizeData({ 
                      ...tempSizeData, 
                      sellingPrice: e.target.value
                    });
                  }}
                  className="h-9"
                />
              </FormField>
            </div>

            <FormField label="Stock Quantity" error="">
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={tempSizeData.stock}
                onChange={(e) => setTempSizeData({ ...tempSizeData, stock: e.target.value })}
                className="h-9"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSizeDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveSizeData}>
              {currentSizeContext?.sizeIndex !== undefined ? 'Update' : 'Add'} Size
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}