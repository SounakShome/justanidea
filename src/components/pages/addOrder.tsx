"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Types
type Customer = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
};

type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    image?: string;
};

type Address = {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
};

type Item = {
    productId: string;
    quantity: number;
};

type FormValues = {
    customerId: string;
    billingAddress: Address;
    sameAsBilling: boolean;
    deliveryAddress: Address;
    items: Item[];
    paymentMethod: string;
    notes?: string;
};

// Mock API functions
const fetchCustomers = async (): Promise<Customer[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data
    return [
        { id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", phone: "(123) 456-7890" },
        { id: "2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "(234) 567-8901" },
        { id: "3", firstName: "Michael", lastName: "Johnson", email: "michael@example.com", phone: "(345) 678-9012" },
        { id: "4", firstName: "Sarah", lastName: "Williams", email: "sarah@example.com", phone: "(456) 789-0123" },
        { id: "5", firstName: "David", lastName: "Brown", email: "david@example.com", phone: "(567) 890-1234" }
    ];
};

const fetchCustomerAddress = async (customerId: string): Promise<{ billing: Address, delivery?: Address }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return mock data
    return {
        billing: {
            street: "123 Main St",
            city: "Anytown",
            state: "NY",
            zipCode: "10001",
            country: "USA"
        },
        delivery: {
            street: "456 Ship St",
            city: "Anytown",
            state: "NY",
            zipCode: "10001",
            country: "USA"
        }
    };
};

const searchProducts = async (query: string): Promise<Product[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const allProducts = [
        { id: "1", name: "Premium Laptop", price: 1299.99, description: "High-end laptop for professionals", category: "Electronics" },
        { id: "2", name: "Wireless Headphones", price: 199.99, description: "Noise-cancelling wireless headphones", category: "Electronics" },
        { id: "3", name: "Smart Watch", price: 249.99, description: "Fitness and health tracking smartwatch", category: "Electronics" },
        { id: "4", name: "Ergonomic Chair", price: 349.99, description: "Office chair with lumbar support", category: "Furniture" },
        { id: "5", name: "Standing Desk", price: 499.99, description: "Adjustable height standing desk", category: "Furniture" },
        { id: "6", name: "Wireless Mouse", price: 49.99, description: "Bluetooth wireless mouse", category: "Electronics" },
        { id: "7", name: "Monitor", price: 299.99, description: "27-inch 4K monitor", category: "Electronics" },
        { id: "8", name: "Coffee Maker", price: 89.99, description: "Programmable coffee maker", category: "Appliances" }
    ];

    if (!query) return allProducts;

    const lowerCaseQuery = query.toLowerCase();
    return allProducts.filter(product =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.description.toLowerCase().includes(lowerCaseQuery) ||
        product.category.toLowerCase().includes(lowerCaseQuery)
    );
};

// Helper component for form fields
const FormField = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="mb-2">
        <label className="block mb-1">{label}</label>
        {children}
        {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
);

// Address form component to avoid repetition
const AddressForm = ({
    prefix,
    register,
    errors
}: {
    prefix: "billingAddress" | "deliveryAddress";
    register: any; // Should be from react-hook-form
    errors: Record<string, any>;
}) => (
    <>
        <FormField
            label="Street Address"
            error={errors?.[prefix]?.street?.message}
        >
            <Input
                placeholder="123 Street"
                {...register(`${prefix}.street`, { required: "Street is required" })}
            />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
            <FormField
                label="City"
                error={errors?.[prefix]?.city?.message}
            >
                <Input
                    placeholder="City"
                    {...register(`${prefix}.city`, { required: "City is required" })}
                />
            </FormField>

            <FormField
                label="State"
                error={errors?.[prefix]?.state?.message}
            >
                <Input
                    placeholder="State"
                    {...register(`${prefix}.state`, { required: "State is required" })}
                />
            </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
                label="ZIP Code"
                error={errors?.[prefix]?.zipCode?.message}
            >
                <Input
                    placeholder="12345"
                    {...register(`${prefix}.zipCode`, { required: "ZIP code is required" })}
                />
            </FormField>

            <FormField
                label="Country"
                error={errors?.[prefix]?.country?.message}
            >
                <Input
                    placeholder="Country"
                    {...register(`${prefix}.country`, { required: "Country is required" })}
                />
            </FormField>
        </div>
    </>
);

export default function AddOrder() {
    // State for customers and products
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [productSearchQuery, setProductSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Form setup
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            customerId: "",
            billingAddress: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
            },
            sameAsBilling: false,
            deliveryAddress: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
            },
            items: [],
            paymentMethod: "",
            notes: "",
        },
    });

    const watchSameAsBilling = watch("sameAsBilling");
    const watchItems = watch("items");
    const watchCustomerId = watch("customerId");

    // Fetch customers on component mount
    useEffect(() => {
        const getCustomers = async () => {
            setIsLoadingCustomers(true);
            try {
                const data = await fetchCustomers();
                setCustomers(data);
            } catch (error) {
                console.error("Error fetching customers:", error);
                toast.error("Failed to load customers");
            } finally {
                setIsLoadingCustomers(false);
            }
        };

        getCustomers();
    }, []);

    // Fetch products based on search query
    useEffect(() => {
        const getProducts = async () => {
            setIsLoadingProducts(true);
            try {
                const data = await searchProducts(productSearchQuery);
                setProducts(data);
            } catch (error) {
                console.error("Error searching products:", error);
                toast.error("Failed to search products");
            } finally {
                setIsLoadingProducts(false);
            }
        };

        // Debounce the search
        const handler = setTimeout(() => {
            getProducts();
        }, 300);

        return () => clearTimeout(handler);
    }, [productSearchQuery]);

    // Fetch customer address when customer is selected
    useEffect(() => {
        if (!watchCustomerId) return;

        const fetchAddress = async () => {
            try {
                const addressData = await fetchCustomerAddress(watchCustomerId);

                // Update billing address
                setValue("billingAddress", addressData.billing);

                // If delivery address exists and sameAsBilling is false, update delivery address too
                if (addressData.delivery && !watchSameAsBilling) {
                    setValue("deliveryAddress", addressData.delivery);
                }
            } catch (error) {
                console.error("Error fetching customer address:", error);
                toast.error("Failed to load customer address");
            }
        };

        // Update selected customer
        const customer = customers.find(c => c.id === watchCustomerId) || null;
        setSelectedCustomer(customer);

        fetchAddress();
    }, [watchCustomerId, setValue, customers, watchSameAsBilling]);

    // Update delivery address when sameAsBilling changes
    useEffect(() => {
        if (watchSameAsBilling) {
            const billingAddress = getValues("billingAddress");
            setValue("deliveryAddress", billingAddress);
        }
    }, [watchSameAsBilling, getValues, setValue]);

    // Product handling functions
    const toggleProduct = (productId: string) => {
        const currentItems = getValues("items") || [];
        const existingItem = currentItems.find(item => item.productId === productId);

        if (existingItem) {
            setValue("items", currentItems.filter(item => item.productId !== productId));
        } else {
            setValue("items", [...currentItems, { productId, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: string, quantity: number) => {
        const currentItems = getValues("items");
        const updatedItems = currentItems.map(item =>
            item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        setValue("items", updatedItems);
    };

    // Submit handler
    const onSubmit = (data: FormValues) => {
        console.log("Order submitted:", data);
        toast.success("Order created", {
            description: "Your order has been successfully created.",
            duration: 5000,
        });
        // Here you would send data to your API
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Create New Order</h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Grid with adjusted order for mobile */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Customer Selection - Always First */}
                    <Card className="md:col-span-3 order-1">
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                            <CardDescription>Select a customer for this order</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <FormField
                                    label="Select Customer"
                                    error={errors.customerId?.message}
                                >
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        {...register("customerId", { required: "Customer is required" })}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a customer</option>
                                        {customers.map(customer => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.firstName} {customer.lastName} ({customer.email})
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                {selectedCustomer && (
                                    <div className="p-4 border rounded-md bg-muted/30">
                                        <h3 className="font-medium text-lg mb-2">Customer Details</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Name:</p>
                                                <p>{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email:</p>
                                                <p>{selectedCustomer.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Phone:</p>
                                                <p>{selectedCustomer.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>



                    {/* Product Selection - Third on mobile */}
                    <Card className="md:col-span-3 order-3">
                        <CardHeader>
                            <CardTitle>Select Products</CardTitle>
                            <CardDescription>Search and add products to your order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center border rounded-md px-3 py-2 mb-4">
                                <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                                <Input
                                    className="border-0 p-0 shadow-none focus-visible:ring-0"
                                    placeholder="Search products by name, description, or category..."
                                    value={productSearchQuery}
                                    onChange={(e) => setProductSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge
                                    className="cursor-pointer"
                                    variant={productSearchQuery === "" ? "default" : "outline"}
                                    onClick={() => setProductSearchQuery("")}
                                >
                                    All
                                </Badge>
                                <Badge
                                    className="cursor-pointer"
                                    variant={productSearchQuery === "Electronics" ? "default" : "outline"}
                                    onClick={() => setProductSearchQuery("Electronics")}
                                >
                                    Electronics
                                </Badge>
                                <Badge
                                    className="cursor-pointer"
                                    variant={productSearchQuery === "Furniture" ? "default" : "outline"}
                                    onClick={() => setProductSearchQuery("Furniture")}
                                >
                                    Furniture
                                </Badge>
                                <Badge
                                    className="cursor-pointer"
                                    variant={productSearchQuery === "Appliances" ? "default" : "outline"}
                                    onClick={() => setProductSearchQuery("Appliances")}
                                >
                                    Appliances
                                </Badge>
                            </div>

                            {isLoadingProducts ? (
                                <div className="text-center py-8">Loading products...</div>
                            ) : (
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {products.map((product) => {
                                            const selected = watchItems?.find(item => item.productId === product.id);

                                            return (
                                                <div key={product.id} className={`border rounded-lg p-4 ${selected ? 'ring-2 ring-primary' : ''}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-medium">{product.name}</h3>
                                                            <p className="text-sm text-muted-foreground mb-1">{product.description}</p>
                                                            <Badge variant="outline">{product.category}</Badge>
                                                            <p className="text-sm font-medium mt-2">${product.price.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex justify-end">
                                                        <Button
                                                            type="button"
                                                            variant={selected ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => toggleProduct(product.id)}
                                                        >
                                                            {selected ? "Remove" : "Add to Order"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {products.length === 0 && (
                                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                                No products found matching your search.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Summary - Second on mobile */}
                    <Card className="order-6 md:col-span-3">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>Review and update your order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {watchItems && watchItems.length > 0 ? (
                                    watchItems.map((item) => {
                                        const product = products.find(p => p.id === item.productId);
                                        return product ? (
                                            <div key={item.productId} className="flex items-center justify-between border-b pb-2">
                                                <div className="flex-1">
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-muted-foreground text-sm">${product.price.toFixed(2)} each</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    >-</Button>
                                                    <span className="w-6 text-center">{item.quantity}</span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    >+</Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-red-500 hover:text-red-700"
                                                        onClick={() => toggleProduct(item.productId)}
                                                    >×</Button>
                                                </div>
                                            </div>
                                        ) : null;
                                    })
                                ) : (
                                    <p className="text-muted-foreground">No items selected</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={!watchCustomerId || watchItems.length === 0}>
                                Create Order
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </div>
    );
}