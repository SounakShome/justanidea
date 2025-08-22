"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DatePicker from "@/components/ui/datePicker";
import { Package, Plus, Search, Trash2 } from "lucide-react";
import { SiteHeader } from "../site-header";
import Loading from "@/app/loading"
import { PurchaseFormValues, Supplier, Variants } from "@/types/addPurchases";
import { usePurchaseStore } from "@/store";

// Form field component
const FormField = ({
	label,
	error,
	children
}: {
	label: string;
	error?: string;
	children: React.ReactNode;
}) => (
	<div className="mb-3">
		<label className="block text-sm font-medium mb-1">{label}</label>
		{children}
		{error && <span className="text-red-500 text-xs">{error}</span>}
	</div>
);

export default function PurchaseEntryForm() {
	// Zustand store
	const {
		suppliers,
		products,
		selectedSupplier,
		purchaseForm,
		isLoadingSuppliers,
		isLoadingProducts,
		isSaving,
		productSearchQuery,
		setProductSearchQuery,
		fetchSuppliers,
		fetchProducts,
		addProductToItems,
		updateItemQuantity,
		updateItemDiscount,
		removeItem,
		updateFormField,
		resetForm,
		calculateSubtotal,
		calculateTaxableAmount,
		calculateTaxAmount,
		calculateRoundingOff,
		calculateTotal,
		updateCalculations,
		savePurchase
	} = usePurchaseStore();

	// Local state for UI
	const [activeTab, setActiveTab] = useState("products");

	// Form - we'll sync this with Zustand
	const { register, handleSubmit, setValue, getValues, watch, formState: { errors }, reset } = useForm<PurchaseFormValues>({
		defaultValues: purchaseForm
	});

	const watchItems = watch("items", purchaseForm.items);
	const watchSupplierId = watch("supplierId", purchaseForm.supplierId);
	const watchTax = watch("tax", purchaseForm.tax);
	const watchIGST = watch("igst", purchaseForm.igst);
	const watchCGST = watch("cgst", purchaseForm.cgst);
	const watchSGST = watch("sgst", purchaseForm.sgst);
	const watchDiscount = watch("discount", purchaseForm.discount);
	const watchPurchaseDate = watch("purchaseDate", purchaseForm.purchaseDate);

	// Load suppliers on component mount
	useEffect(() => {
		fetchSuppliers().catch((error) => {
			toast("Error", {
				description: "Failed to load suppliers"
			});
		});
	}, [fetchSuppliers]);

	// Search products when query changes
	useEffect(() => {
		if (watchSupplierId) {
			const searchProductsDebounced = setTimeout(async () => {
				try {
					await fetchProducts(watchSupplierId, productSearchQuery);
				} catch (error) {
					toast("Error", {
						description: "Failed to search products"
					});
				}
			}, 300);

			return () => clearTimeout(searchProductsDebounced);
		}
	}, [productSearchQuery, watchSupplierId, fetchProducts]);

	// Update selected supplier when supplier ID changes
	useEffect(() => {
		if (watchSupplierId !== purchaseForm.supplierId) {
			updateFormField('supplierId', watchSupplierId);
		}
	}, [watchSupplierId, purchaseForm.supplierId, updateFormField]);

	// Sync form values with store and trigger calculations when needed
	useEffect(() => {
		setValue("items", purchaseForm.items);
		setValue("subTotal", purchaseForm.subTotal);
		setValue("taxableAmount", purchaseForm.taxableAmount);
		setValue("totalAmount", purchaseForm.totalAmount);
	}, [purchaseForm.items, purchaseForm.subTotal, purchaseForm.taxableAmount, purchaseForm.totalAmount, setValue]);

	// Update calculations when discount or tax values change
	useEffect(() => {
		if (watchDiscount !== purchaseForm.discount) {
			updateFormField('discount', watchDiscount);
			updateCalculations();
		}
	}, [watchDiscount, purchaseForm.discount, updateFormField, updateCalculations]);

	useEffect(() => {
		if (watchTax !== purchaseForm.tax) {
			updateFormField('tax', watchTax);
			updateCalculations();
		}
	}, [watchTax, purchaseForm.tax, updateFormField, updateCalculations]);

	useEffect(() => {
		if (watchIGST !== purchaseForm.igst) {
			updateFormField('igst', watchIGST || 0);
			updateCalculations();
		}
	}, [watchIGST, purchaseForm.igst, updateFormField, updateCalculations]);

	useEffect(() => {
		if (watchCGST !== purchaseForm.cgst) {
			updateFormField('cgst', watchCGST || 0);
			updateCalculations();
		}
	}, [watchCGST, purchaseForm.cgst, updateFormField, updateCalculations]);

	useEffect(() => {
		if (watchSGST !== purchaseForm.sgst) {
			updateFormField('sgst', watchSGST || 0);
			updateCalculations();
		}
	}, [watchSGST, purchaseForm.sgst, updateFormField, updateCalculations]);

	// Update purchase date when it changes
	useEffect(() => {
		if (watchPurchaseDate !== purchaseForm.purchaseDate) {
			updateFormField('purchaseDate', watchPurchaseDate);
		}
	}, [watchPurchaseDate, purchaseForm.purchaseDate, updateFormField]);

	// Form submission
	const onSubmit = async (data: PurchaseFormValues) => {
		if (!data.items.length) {
			toast("No items added", {
				description: "Please add at least one item to the purchase order"
			});
			return;
		}

		try {
			// Update form data in store
			Object.keys(data).forEach((key) => {
				updateFormField(key as keyof PurchaseFormValues, data[key as keyof PurchaseFormValues]);
			});

			const result = await savePurchase();

			if (result?.success) {
				toast("Purchase order created", {
					description: `Purchase order ${result.id} has been created`,
				});
				resetForm();
				reset();
				setProductSearchQuery("");
			}
		} catch (error) {
			console.error("Error saving purchase:", error);
			toast("Error", {
				description: "Failed to save purchase order"
			});
		}
	};

	return (
		<Suspense fallback={<Loading />}>
			<div className="container mx-auto p-6 py-2">
				<SiteHeader name="Purchase Order" />

				<form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
						{/* --- FIRST ROW --- */}

						{/* Purchase Info - 8 columns */}
						<Card className="lg:col-span-12">
							<CardHeader className="pb-3">
								<CardTitle>Purchase Information</CardTitle>
								<CardDescription>Basic details for this purchase order</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-4">
										<FormField label="Supplier" error={errors.supplierId?.message}>
											<Select
												onValueChange={(value) => setValue("supplierId", value)}
												disabled={isLoadingSuppliers}
												value={watchSupplierId}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select supplier" />
												</SelectTrigger>
												<SelectContent>
													{suppliers.map(supplier => (
														<SelectItem key={supplier.id} value={supplier.id}>
															{`${supplier.name} (${supplier.division})`}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormField>

										<FormField label="Invoice Number" error={errors.invoiceNo?.message}>
											<Input
												placeholder="PO-12345"
												{...register("invoiceNo", { required: "Reference number is required" })}
											/>
										</FormField>
									</div>

									<div className="space-y-4">
										<DatePicker
											setPurchase={(date: Date) => setValue('purchaseDate', date)}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Supplier Info Card - 8 columns */}
						<Card className="lg:col-span-8">
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">Supplier Details</CardTitle>
									{selectedSupplier && (
										<Badge variant="outline" className="hidden sm:inline-flex">
											{selectedSupplier.Supp_State}
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent>
								{selectedSupplier ? (
									<div>
										{/* Mobile layout - stacked */}
										<div className="space-y-3 sm:hidden">
											<div className="flex justify-between items-start pb-2 border-b">
												<div>
													<p className="text-sm text-muted-foreground">Company</p>
													<p className="font-medium text-base">{selectedSupplier.name}</p>
												</div>
												<Badge>{selectedSupplier.Supp_State}</Badge>
											</div>

											<div className="pb-2 border-b">
												<p className="text-sm text-muted-foreground">Division</p>
												<p>{selectedSupplier.division}</p>
											</div>

											<div className="grid grid-cols-1 gap-3 pb-2 border-b">
												<div>
													<p className="text-sm text-muted-foreground">CIN</p>
													<p className="overflow-x-auto whitespace-nowrap text-sm">{selectedSupplier.CIN}</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">GSTIN</p>
													<p className="overflow-x-auto whitespace-nowrap text-sm">{selectedSupplier.GSTIN}</p>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-3 pb-2 border-b">
												<div>
													<p className="text-sm text-muted-foreground">Code</p>
													<p>{selectedSupplier.Code}</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">PAN</p>
													<p>{selectedSupplier.PAN}</p>
												</div>
											</div>

											<div className="pb-2 border-b">
												<p className="text-sm text-muted-foreground">Phone</p>
												<p className="text-sm">{selectedSupplier.phone}</p>
											</div>

											<div>
												<p className="text-sm text-muted-foreground">Address</p>
												<p className="text-sm">{selectedSupplier.address}</p>
											</div>
										</div>

										{/* Desktop layout - using grid */}
										<div className="hidden sm:grid sm:grid-cols-2 sm:gap-4">
											<div className="space-y-2 col-span-2">
												<p className="text-sm text-muted-foreground">Company</p>
												<p className="font-medium">{selectedSupplier.name}</p>
											</div>

											<div>
												<p className="text-sm text-muted-foreground">Division</p>
												<p>{selectedSupplier.division}</p>
											</div>

											<div>
												<p className="text-sm text-muted-foreground">Code</p>
												<p>{selectedSupplier.Code}</p>
											</div>

											<div>
												<p className="text-sm text-muted-foreground">CIN</p>
												<p>{selectedSupplier.CIN}</p>
											</div>

											<div>
												<p className="text-sm text-muted-foreground">GSTIN</p>
												<p>{selectedSupplier.GSTIN}</p>
											</div>

											<div>
												<p className="text-sm text-muted-foreground">Phone</p>
												<p>{selectedSupplier.phone}</p>
											</div>

											<div>
												<p className="text-sm text-muted-foreground">PAN</p>
												<p>{selectedSupplier.PAN}</p>
											</div>

											<div className="col-span-2">
												<p className="text-sm text-muted-foreground">Address</p>
												<p className="text-sm">{selectedSupplier.address}</p>
											</div>
										</div>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center h-[120px] text-center p-4">
										<Package className="h-10 w-10 text-muted-foreground mb-3" />
										<p className="text-muted-foreground text-sm">Select a supplier to see details</p>
										<p className="text-xs text-muted-foreground mt-1">All supplier information will appear here</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Order Summary Card - 4 columns */}
						<div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Order Summary</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Subtotal:</span>
										<span>₹{purchaseForm.subTotal.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Discount:</span>
										<span>-₹{(purchaseForm.discount || 0).toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Taxable Amount:</span>
										<span>₹{purchaseForm.taxableAmount.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										{watchTax == "igst" ? <span className="text-muted-foreground">IGST ({watchIGST}%):</span> : <span className="text-muted-foreground">CGST ({watchCGST}%) + SGST ({watchSGST}%):</span>}
										<span>₹{calculateTaxAmount().toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Rounding off:</span>
										<span>₹{calculateRoundingOff().toFixed(2)}</span>
									</div>
									<Separator />
									<div className="flex justify-between font-medium text-lg">
										<span>Total:</span>
										<span>₹{purchaseForm.totalAmount.toFixed(2)}</span>
									</div>
								</CardContent>
								<CardFooter>
									<Button
										className="w-full"
										size="lg"
										disabled={isSaving}
										type="submit"
									>
										{isSaving ? "Processing..." : "Create Purchase Order"}
									</Button>
								</CardFooter>
							</Card>
						</div>



						{/* --- SECOND ROW --- */}

						{/* Main Content Area with Tabs - 8 columns */}
						<Card className="lg:col-span-8">
							<Tabs value={activeTab} onValueChange={setActiveTab}>
								<CardHeader className="pb-3">
									<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
										<CardTitle>Order Details</CardTitle>
										<TabsList className="w-full sm:w-auto">
											<TabsTrigger value="products">Products</TabsTrigger>
											<TabsTrigger value="payment">Payment</TabsTrigger>
											<TabsTrigger value="notes">Notes</TabsTrigger>
										</TabsList>
									</div>
								</CardHeader>
								<CardContent>
									<TabsContent value="products" className="space-y-4">
										{/* Product Search */}
										<div className="flex items-center space-x-2">
											<div className="relative flex-grow">
												<Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													placeholder="Search products..."
													value={productSearchQuery}
													onChange={(e) => setProductSearchQuery(e.target.value)}
													className="pl-8 h-10"
												/>
											</div>
										</div>

										{/* Product List */}
										<ScrollArea className="h-[250px] sm:h-[250px] border rounded-md p-2 sm:p-4">
											{isLoadingProducts ? (
												<div className="flex justify-center items-center h-full">
													<p>Loading products...</p>
												</div>
											) : products.length > 0 ? (
												<div className="grid grid-cols-1 gap-3">
													{products.map(product => (
														<div
															key={product.id}
															className="border rounded-md p-3 flex justify-between items-center hover:bg-muted/50 transition-colors"
														>
															<div>
																<p className="font-medium">{`${product.product?.name} `}{product.name}</p>
																<p className="text-sm text-muted-foreground">Size: {product.size}</p>
																<p className="text-sm text-muted-foreground">Price: ₹{product.price}</p>
															</div>
															<Button
																type="button"
																variant="secondary"
																size="sm"
																className="h-9 px-3 cursor-pointer"
																onClick={() => { addProductToItems(product); setProductSearchQuery("") }}
															>
																<Plus className="h-4 w-4 mr-1" /> Add
															</Button>
														</div>
													))}
												</div>
											) : (
												<div className="flex justify-center items-center h-full">
													<p className="text-muted-foreground">{productSearchQuery ? "No products match your search" : "No products available"}</p>
												</div>
											)}
										</ScrollArea>

										{/* Selected Items List */}
										<ScrollArea className="border rounded-md">
											<div className="bg-muted px-3 py-2 rounded-t-md flex items-center">
												<h3 className="font-medium">Selected Items</h3>
											</div>
											<div>
												{watchItems && watchItems.length > 0 ? (
													<div>
														<div className="hidden sticky top-0 bg-white z-50 sm:grid grid-cols-12 text-sm font-medium border-b p-3">
															<div className="col-span-4">Product</div>
															<div className="col-span-2">Unit Price {"(₹)"}</div>
															<div className="col-span-2">Quantity</div>
															<div className="col-span-2">Discount %</div>
															<div className="col-span-2 text-right mr-6">Total {`(₹)`}</div>
														</div>

														<ScrollArea className="max-h-[200px]">
															{watchItems.map((item) => {
																const product = products.find(p => p.id === item.id);
																return product ? (
																	<div key={item.id} className="p-3 border-b last:border-0">
																		{/* Mobile view (stacked) */}
																		<div className="md:hidden">
																			<div className="flex justify-between mb-2">
																				<div>
																					<p className="font-medium">{`${product.product.name}`}{product.name}</p>
																					<p className="text-xs text-muted-foreground">Size: {product.size}</p>
																				</div>
																				<Button
																					type="button"
																					variant="ghost"
																					size="sm"
																					className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
																					onClick={() => removeItem(item.id)}
																				>
																					<Trash2 className="h-4 w-4" />
																				</Button>
																			</div>
																			<div className="grid grid-cols-3 gap-2 mb-2">
																				<div>
																					<p className="text-xs text-muted-foreground">Price</p>
																					<p>₹{item.price}</p>
																				</div>
																				<div>
																					<p className="text-xs text-muted-foreground">Quantity</p>
																					<Input
																						type="number"
																						value={item.quantity}
																						onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
																						className="h-8 w-full"
																					/>
																				</div>
																				<div>
																					<p className="text-xs text-muted-foreground">Discount</p>
																					<Input
																						type="number"
																						step={0.01}
																						max="100"
																						value={item.discount}
																						onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value))}
																						className="h-8 w-full"
																					/>
																				</div>
																			</div>
																			<div className="flex justify-end">
																				<span className="font-medium">Total: {item.total}</span>
																			</div>
																		</div>

																		{/* Desktop view (grid) */}
																		<div className="hidden md:grid md:grid-cols-12 md:items-center">
																			<div className="col-span-4">
																				<p className="font-medium">{`${product.product.name} `}{product.name}</p>
																				<p className="text-xs text-muted-foreground">Size: {product.size}</p>
																			</div>
																			<div className="col-span-2">
																				{item.price}
																			</div>
																			<div className="col-span-2">
																				<Input
																					type="number"
																					value={item.quantity}
																					onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
																					className="w-20 h-8"
																				/>
																			</div>
																			<div className="col-span-2">
																				<Input
																					type="number"
																					step={0.01}
																					max="100"
																					value={item.discount}
																					onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value))}
																					className="w-20 h-8"
																				/>
																			</div>
																			<div className="col-span-2 flex items-center justify-end space-x-2">
																				<span className="font-medium">{item.total.toFixed(2) || 0}</span>
																				<Button
																					type="button"
																					variant="ghost"
																					size="sm"
																					className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
																					onClick={() => removeItem(item.id)}
																				>
																					<Trash2 className="h-4 w-4" />
																				</Button>
																			</div>
																		</div>
																	</div>
																) : null;
															})}
														</ScrollArea>
													</div>
												) : (
													<div className="py-8 text-center">
														<p className="text-muted-foreground">No items added yet</p>
													</div>
												)}
											</div>
										</ScrollArea>
									</TabsContent>

									<TabsContent value="payment" className="space-y-4">
										<div className="grid grid-cols-1 gap-4">
											<FormField label="Discount" error={errors.discount?.message}>
												<div className="flex items-center space-x-2">
													<Input
														type="number"
														step="0.01"
														placeholder="0.00"
														className="max-w-[150px]"
														{...register("discount", {
															valueAsNumber: true,
															setValueAs: v => parseFloat(v) || 0
														})}
													/>
												</div>
											</FormField>

											<div className="border rounded-md p-4 space-y-4">
												<h3 className="font-medium mb-2">Tax Settings</h3>

												<div className="space-y-3">
													<Select
														onValueChange={(value) => setValue("tax", value)}
														defaultValue="igst"
														value={watchTax}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select tax type" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="igst">IGST</SelectItem>
															<SelectItem value="sgst_cgst">SGST + CGST</SelectItem>
														</SelectContent>
													</Select>

													{watch("tax") === "igst" ? (
														<FormField label="IGST %" error={errors.igst?.message}>
															<Input
																type="number"
																step="0.01"
																placeholder="18"
																className="max-w-[150px]"
																{...register("igst", {
																	valueAsNumber: true,
																	setValueAs: v => parseFloat(v) || 0
																})}
																onChange={(e) => setValue("igst", parseFloat(e.target.value))}
															/>
														</FormField>
													) : (
														<div className="grid grid-cols-2 gap-3">
															<FormField label="SGST %" error={errors.sgst?.message}>
																<Input
																	type="number"
																	step="0.01"
																	placeholder="9"
																	className="max-w-full"
																	{...register("sgst", {
																		valueAsNumber: true,
																		setValueAs: v => parseFloat(v) || 0
																	})}
																	onChange={(e) => {
																		setValue("sgst", parseFloat(e.target.value));
																	}}
																/>
															</FormField>
															<FormField label="CGST %" error={errors.cgst?.message}>
																<Input
																	type="number"
																	step="0.01"
																	placeholder="9"
																	className="max-w-full"
																	{...register("cgst", {
																		valueAsNumber: true,
																		setValueAs: v => parseFloat(v) || 0
																	})}
																	onChange={(e) => {
																		setValue("cgst", parseFloat(e.target.value));
																	}}
																/>
															</FormField>
														</div>
													)}
												</div>
											</div>
										</div>
									</TabsContent>

									<TabsContent value="notes">
										<FormField label="Notes & Additional Information" error={errors.notes?.message}>
											<textarea
												className="w-full min-h-[150px] sm:min-h-[200px] p-3 border rounded-md"
												placeholder="Enter any notes or special instructions..."
												{...register("notes")}
											></textarea>
										</FormField>
									</TabsContent>
								</CardContent>
							</Tabs>
						</Card>
					</div>
				</form>
			</div>
		</Suspense>
	);
}