"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

export function CustomerForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  interface CustomerFormData {
    name: string;
    GSTIN: string;
    phone: string;
    address: string;
    state: string;
    code: number;
  }

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({
    defaultValues: {
      name: "",
      GSTIN: "",
      phone: "",
      address: "",
      state: "KARNATAKA",
      code: 29
    }
  });


  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);

    // Simulate API call
    const res = await fetch("/api/addCustomer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if( !res.ok) {
      toast.error("Failed to create customer");
      setLoading(false);
      return;
    }

    console.log("Customer data:", { ...data });

    toast("Customer created", {
      description: `${data.name} has been added successfully.`,
    });

    setLoading(false);
    onClose?.(); // Close the form if onClose is provided
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento grid layout - Start */}

        {/* Header card - spans 2 columns */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Customer</CardTitle>
            <CardDescription>
              Create a new customer profile in your business database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger className="cursor-pointer" value="basic">Basic Info</TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="address">Address</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Name"
                    error={errors.name?.message}
                  >
                    <Input
                      placeholder="John"
                      {...register("name", { required: "Name is required" })}
                    />
                  </FormField>

                  <FormField
                    label="GSTIN"
                    error={errors.GSTIN?.message}
                  >
                    <Input
                      placeholder="GSTIN..."
                      {...register("GSTIN", { required: "GSTIN is required" })}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Phone"
                    error={errors.phone?.message}
                  >
                    <Input
                      placeholder="12345 67890"
                      {...register("phone", { required: "Phone number is required" })}
                    />
                  </FormField>
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <FormField
                  label="Address"
                  error={errors.address?.message}
                >
                  <Input
                    placeholder="123 Street"
                    {...register("address", { required: "Address is required" })}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="State"
                    error={errors.state?.message}
                  >
                    <Input
                      placeholder="State"
                      {...register("state", { required: "State is required" })}
                    />
                  </FormField>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Submit button - spans 2 columns */}
        <Button
          type="submit"
          className="w-full cursor-pointer"
          size="lg"
          disabled={loading}
        >
          {loading ? "Creating Customer..." : "Create Customer"}
        </Button>
        {/* Bento grid layout - End */}
      </div>
    </form>
  );
}

export function SupplierForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      companyName: "",
      division: "",
      address: "",
      phone: "",
      CIN: "",
      GSTIN: "",
      PAN: "",
      Supp_State: "",
      Code: "",
    }
  });

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

  const onSubmit = async (data: SupplierFormData): Promise<void> => {
    setLoading(true);
    // Simulate API call
    const res = await fetch("/api/addSupplier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Failed to create supplier");
      setLoading(false);
      return;
    }

    console.log("Supplier data:", { ...data });

    toast("Supplier created", {
      description: `${data.companyName} has been added as a supplier.`,
    });
    setLoading(false);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Header card */}
        <div className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Supplier</CardTitle>
            <CardDescription>
              Create a new supplier that your business works with
            </CardDescription>
          </CardHeader>
        </div>

        {/* Company Information */}
        <div className="md:col-span-2">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Basic information about the supplier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Company Name"
                error={errors.companyName?.message}
              >
                <Input
                  placeholder="Acme Corporation"
                  {...register("companyName", { required: "Company name is required" })}
                />
              </FormField>
              <FormField
                label="Division"
                error={errors.division?.message}
              >
                <Input
                  placeholder="Division..."
                  {...register("division", { required: "Division is required" })}
                />
              </FormField>
            </div>

            <FormField
              label="Address"
              error={errors.address?.message}
            >
              <Input
                placeholder="123 Business Ave"
                {...register("address", { required: "Address is required" })}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Phone"
                error={errors.phone?.message}
              >
                <Input
                  placeholder="(123) 456-7890"
                  {...register("phone", { required: "Phone is required" })}
                />
              </FormField>

              <FormField
                label="CIN"
                error={errors.CIN?.message}
              >
                <Input
                  placeholder="CIN..."
                  {...register("CIN", { required: "CIN is required" })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="GSTIN"
                error={errors.GSTIN?.message}
              >
                <Input
                  placeholder="GSTIN..."
                  {...register("GSTIN", { required: "GSTIN is required" })}
                />
              </FormField>

              <FormField
                label="PAN"
                error={errors.PAN?.message}
              >
                <Input
                  placeholder="PAN..."
                  {...register("PAN", { required: "PAN is required" })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Supplier State"
                error={errors.Supp_State?.message}
              >
                <Input
                  placeholder="Supplier State..."
                  {...register("Supp_State", { required: "Supp_State is required" })}
                />
              </FormField>

              <FormField
                label="State Code"
                error={errors.Code?.message}
              >
                <Input
                  placeholder="State Code..."
                  {...register("Code", { required: "State Code is required" })}
                />
              </FormField>
            </div>
          </CardContent>
        </div>

      </div>
      <Button
        type="submit"
        className="cursor-pointer"
        size="lg"
        disabled={loading}
      >
        {loading ? "Creating Supplier..." : "Create Supplier"}
      </Button>
    </form>
  );
}

export function ProductForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);

  interface ProductFormData {
    name: string;
    HSN: string;
  }

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      HSN: "",
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    // Simulate API call
    const res = await fetch("/api/addProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      onClose?.();
    }
    toast("Product created", {
      description: `${data.name} has been added to your inventory.`,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Header - spans full width */}
        <div className="md:col-span-5">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Product</CardTitle>
            <CardDescription>
              Create a new product to add to your inventory
            </CardDescription>
          </CardHeader>
        </div>

        {/* Basic Info - spans 3 columns */}
        <div className="md:col-span-5">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Product Name"
                error={errors.name?.message}
              >
                <Input
                  placeholder="Premium Widget"
                  {...register("name", { required: "Product name is required" })}
                />
              </FormField>
              <FormField
                label="HSN"
                error={errors.HSN?.message}
              >
                <Input
                  placeholder="WIDGET-001"
                  {...register("HSN", { required: "HSN is required" })}
                />
              </FormField>
            </div>
          </CardContent>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="w-auto px-2"
            disabled={loading}
          >
            {loading ? "Creating Product..." : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function VariantForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [parentProducts, setParentProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string, division: string }>>([]);

  useEffect(() => {
    // Simulate fetching parent products from an API or database
    const fetchParentProducts = async () => {
      // Simulated data
      const products = await fetch("/api/getItems").then((res) => res.json());
      console.log("Fetched parent products:", products);
      setParentProducts(products);
    };

    // Simulate fetching suppliers from an API or database
    const fetchSuppliers = async () => {
      // Simulated data
      const suppliers = await fetch("/api/getSuppliers").then((res) => res.json());
      console.log("Fetched suppliers:", suppliers);
      setSuppliers(suppliers);
    };

    fetchSuppliers();

    fetchParentProducts();
  }, []);

  interface VariantFormData {
    parentProductId: string;
    name: string;
    size: string;
    price: string;
    stock: string;
    suppId: string | undefined;
  }

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<VariantFormData>({
    defaultValues: {
      parentProductId: "",
      name: "",
      size: "",
      price: "",
      stock: "0",
      suppId: "",
    }
  });

  const watchParentProduct = watch("parentProductId");
  const watchSupplier = watch("suppId");

  const onSubmit = async (data: VariantFormData) => {
    setLoading(true);
    // Simulate API call
    const res = await fetch("/api/addVariant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Failed to create variant");
      setLoading(false);
      return;
    }

    console.log("Variant data:", data);
    toast("Variant created", {
      description: `${data.name} variant has been added.`,
    });

    setLoading(false);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Header - spans full width */}
        <div className="md:col-span-4">
          <CardHeader>
            <CardTitle className="text-2xl">Add Product Variant</CardTitle>
            <CardDescription>
              Create a new variant of an existing product
            </CardDescription>
          </CardHeader>
        </div>

        {/* Parent Product Selection - spans 2 columns */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Parent Product</CardTitle>
            <CardDescription>Select the product for this variant</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              label="Select Parent Product"
              error={errors.parentProductId?.message}
            >
              <Select
                onValueChange={(value) => setValue("parentProductId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {parentProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {watchParentProduct && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <h4 className="text-sm font-medium mb-1">Selected Product:</h4>
                <p>{parentProducts.find(p => p.id === watchParentProduct)?.name}</p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Supplier Selection - spans 2 columns */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Supplier</CardTitle>
            <CardDescription>Select the supplier for this variant</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              label="Select Supplier"
              error={errors.suppId?.message}
            >
              <Select
                onValueChange={(value) => setValue("suppId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name} {`(${supplier.division})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {watchSupplier && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <h4 className="text-sm font-medium mb-1">Selected Supplier:</h4>
                <p>{suppliers.find(p => p.id === watchSupplier)?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {suppliers.find(p => p.id === watchSupplier)?.division}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variant Details - spans full width */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Variant Details</CardTitle>
            <CardDescription>Specify the attributes of this variant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Variant Name"
                error={errors.name?.message}
              >
                <Input
                  placeholder="Blue XL"
                  {...register("name", { required: "Variant name is required" })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Size"
                error={errors.size?.message}
              >
                <Input
                  placeholder="S/M/L/XL/..."
                  {...register("size", { required: "Size is required" })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Price (₹)"
                error={errors.price?.message}
              >
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="29.00"
                  {...register("price", { required: "Price is required" })}
                />
              </FormField>

              <FormField
                label="Inventory Count"
              >
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("stock")}
                />
              </FormField>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={loading || !watchParentProduct || !watchSupplier}
            >
              {loading ? "Creating Variant..." : "Create Variant"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}