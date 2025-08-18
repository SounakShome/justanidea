"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [products, setProducts] = useState<ProductFormData[]>([{
    name: "",
    HSN: "",
  }]);

  interface ProductFormData {
    name: string;
    HSN: string;
  }

  const addProductInstance = () => {
    setProducts([...products, {
      name: "",
      HSN: "",
    }]);
  };

  const removeProductInstance = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof ProductFormData, value: string) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = products.map(async (product) => {
        const res = await fetch("/api/addProduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        });

        if (!res.ok) {
          throw new Error(`Failed to create product: ${product.name}`);
        }
        return product;
      });

      await Promise.all(promises);

      toast("Products created", {
        description: `${products.length} product(s) have been added to your inventory.`,
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
              {loading ? "Creating..." : `Create ${products.length} Product${products.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function VariantForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [parentProducts, setParentProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string, division: string }>>([]);
  const [variants, setVariants] = useState<VariantFormData[]>([{
    parentProductId: "",
    name: "",
    size: "",
    price: "",
    stock: "0",
    suppId: "",
  }]);

  interface VariantFormData {
    parentProductId: string;
    name: string;
    size: string;
    price: string;
    stock: string;
    suppId: string;
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
      size: "",
      price: "",
      stock: "0",
      suppId: "",
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
          body: JSON.stringify(variant),
        });

        if (!res.ok) {
          throw new Error(`Failed to create variant: ${variant.name}`);
        }
        return variant;
      });

      await Promise.all(promises);

      toast("Variants created", {
        description: `${variants.length} variant(s) have been added successfully.`,
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
                <CardTitle className="text-lg">Variant {index + 1}</CardTitle>
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
              {/* Product and Supplier Selection - Mobile-first */}
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
              {/* Variant Details */}
              <div className="space-y-4">
                <FormField label="Variant Name" error="">
                  <Input
                    placeholder="Blue XL"
                    value={variant.name}
                    onChange={(e) => updateVariant(index, "name", e.target.value)}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Size" error="">
                    <Input
                      placeholder="XL"
                      value={variant.size}
                      onChange={(e) => updateVariant(index, "size", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Price (₹)" error="">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="29.00"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, "price", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Initial Stock" error="">
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, "stock", e.target.value)}
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
              disabled={loading || variants.some(v => !v.parentProductId || !v.suppId)}
              className="flex-1 sm:w-auto"
            >
              {loading ? "Creating..." : `Create ${variants.length} Variant${variants.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}