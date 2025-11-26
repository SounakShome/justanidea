"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { CalendarIcon, Package, Search, Trash2 } from "lucide-react";
import { SiteHeader } from "../site-header";
import { usePurchaseStore } from "@/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Variant } from "@/types/addPurchases";

export default function PurchaseEntryForm() {
	const {
		suppliers,
		variants,
		selectedSupplier,
		purchaseForm,
		isLoadingSuppliers,
		isLoadingVariants,
		isSaving,
		variantSearchQuery,
		setVariantSearchQuery,
		fetchSuppliers,
		fetchVariants,
		addVariantToItems,
		updateItemQuantity,
		updateItemDiscount,
		removeItem,
		updateFormField,
		resetForm,
		calculateTaxAmount,
		calculateRoundingOff,
		savePurchase
	} = usePurchaseStore();

	// Modal state for adding items
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
	const [selectedSize, setSelectedSize] = useState<string>("");
	const [selectedSizeData, setSelectedSizeData] = useState<any>(null);
	const [modalQuantity, setModalQuantity] = useState<number | "">("");
	const [modalBuyingPrice, setModalBuyingPrice] = useState<number>(0);

	// Helper function to safely parse sizes JSON
	const getSizes = (variant: any) => {
		if (!variant.sizes) return [];
		if (Array.isArray(variant.sizes)) return variant.sizes;
		try {
			return typeof variant.sizes === 'string' ? JSON.parse(variant.sizes) : variant.sizes;
		} catch {
			return [];
		}
	};

	// Load suppliers on mount
	useEffect(() => {
		fetchSuppliers().catch(() => {
			toast.error("Failed to load suppliers");
		});
	}, [fetchSuppliers]);

	// Search variants when supplier changes or query changes
	useEffect(() => {
		if (purchaseForm.supplierId) {
			const timer = setTimeout(() => {
				fetchVariants(purchaseForm.supplierId, variantSearchQuery).catch(() => {
					toast.error("Failed to search products");
				});
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [purchaseForm.supplierId, variantSearchQuery, fetchVariants]);

	// Handle opening modal with selected variant and size
	const handleOpenModal = (variant: Variant, size: string, sizeData: any) => {
		setSelectedVariant(variant);
		setSelectedSize(size);
		setSelectedSizeData(sizeData);
		setModalQuantity("");
		setModalBuyingPrice(sizeData.buyingPrice);
		setIsModalOpen(true);
	};

	// Handle adding item from modal
	const handleAddItemFromModal = () => {
		if (!selectedVariant || !selectedSize || !modalQuantity || modalQuantity < 1) return;

		// Create a modified variant with updated buying price
		const modifiedVariant = {
			...selectedVariant,
			sizes: selectedVariant.sizes.map((s: any) => 
				s.size === selectedSize 
					? { ...s, buyingPrice: modalBuyingPrice }
					: s
			)
		};

		// Add item with the specified quantity
		const qty = typeof modalQuantity === "string" ? parseInt(modalQuantity) : modalQuantity;
		for (let i = 0; i < qty; i++) {
			addVariantToItems(modifiedVariant, selectedSize);
		}

		// Close modal and reset
		setIsModalOpen(false);
		setSelectedVariant(null);
		setSelectedSize("");
		setSelectedSizeData(null);
		setVariantSearchQuery("");
		toast.success(`Added ${qty} item(s) to purchase`);
	};

	// Handle Enter key in modal
	const handleModalKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddItemFromModal();
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!purchaseForm.items.length) {
			toast.error("Please add at least one item");
			return;
		}

		if (!purchaseForm.supplierId) {
			toast.error("Please select a supplier");
			return;
		}

		if (!purchaseForm.invoiceNo) {
			toast.error("Please enter invoice number");
			return;
		}

		try {
			const result = await savePurchase();
			if (result?.success) {
				toast.success(`Purchase order ${result.id} created successfully`);
				resetForm();
			}
		} catch (error) {
			console.error("Error saving purchase:", error);
			toast.error("Failed to save purchase order");
		}
	};

	// Get variant details for display
	const getVariantDetails = (variantId: string) => {
		return variants.find(v => v.id === variantId);
	};

	return (
		<div className="container mx-auto p-4 sm:p-6 max-w-[1600px]">
			<SiteHeader name="Create Purchase Order" />

			<form onSubmit={handleSubmit} className="mt-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Purchase Information */}
						<Card>
							<CardHeader>
								<CardTitle>Purchase Information</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="supplier">Supplier *</Label>
										<Select
											value={purchaseForm.supplierId}
											onValueChange={(value) => updateFormField('supplierId', value)}
											disabled={isLoadingSuppliers}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select supplier" />
											</SelectTrigger>
											<SelectContent>
												{suppliers.map(supplier => (
													<SelectItem key={supplier.id} value={supplier.id}>
														{supplier.name} ({supplier.division})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="invoiceNo">Invoice Number *</Label>
										<Input
											id="invoiceNo"
											placeholder="INV-12345"
											value={purchaseForm.invoiceNo}
											onChange={(e) => updateFormField('invoiceNo', e.target.value)}
										/>
									</div>

									<div className="space-y-2 sm:col-span-2">
										<Label>Purchase Date *</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full justify-start text-left font-normal",
														!purchaseForm.purchaseDate && "text-muted-foreground"
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{purchaseForm.purchaseDate ? format(purchaseForm.purchaseDate, "PPP") : "Pick a date"}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={purchaseForm.purchaseDate}
													onSelect={(date) => date && updateFormField('purchaseDate', date)}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Supplier Details */}
						{selectedSupplier && (
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle>Supplier Details</CardTitle>
										<Badge variant="outline">{selectedSupplier.Supp_State}</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<p className="text-xs text-muted-foreground mb-1">Company Name</p>
											<p className="font-medium">{selectedSupplier.name}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-1">Division</p>
											<p>{selectedSupplier.division}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-1">GSTIN</p>
											<p className="font-mono text-sm">{selectedSupplier.GSTIN}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-1">PAN</p>
											<p className="font-mono text-sm">{selectedSupplier.PAN}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-1">Phone</p>
											<p className="text-sm">{selectedSupplier.phone}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-1">Code</p>
											<p className="text-sm">{selectedSupplier.Code}</p>
										</div>
										<div className="sm:col-span-2">
											<p className="text-xs text-muted-foreground mb-1">Address</p>
											<p className="text-sm">{selectedSupplier.address}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Products Section */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle>Add Products</CardTitle>
									<Badge variant="secondary">{purchaseForm.items.length} items</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Search */}
								<div className="relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search products..."
										value={variantSearchQuery}
										onChange={(e) => setVariantSearchQuery(e.target.value)}
										className="pl-9"
										disabled={!purchaseForm.supplierId}
									/>
								</div>

								{/* Search Results */}
								{variantSearchQuery && purchaseForm.supplierId && (
									<ScrollArea className="h-[200px] border rounded-lg p-3">
										{isLoadingVariants ? (
											<div className="flex justify-center items-center h-full">
												<p className="text-sm text-muted-foreground">Loading...</p>
											</div>
										) : variants.length > 0 ? (
											<div className="space-y-2">
												{variants.map(variant => {
													const sizes = getSizes(variant);
													return (
													<div key={variant.id} className="border rounded-lg p-3">
														<div className="mb-2">
															<p className="font-medium text-sm">{variant.product?.name} - {variant.name}</p>
															{variant.barcode && (
																<p className="text-xs text-muted-foreground">Barcode: {variant.barcode}</p>
															)}
														</div>
														<div className="space-y-1.5">
															<p className="text-xs font-medium text-muted-foreground">Available Sizes:</p>
															<div className="flex flex-wrap gap-2">
																{sizes.map((sizeData: any, idx: number) => (
																	<Button
																		key={idx}
																		type="button"
																		size="sm"
																		variant="outline"
																		onClick={() => handleOpenModal(variant, sizeData.size, sizeData)}
																		className="h-auto py-1.5 px-3 flex flex-col items-start"
																	>
																		<span className="font-semibold text-xs">{sizeData.size}</span>
																		<span className="text-xs text-muted-foreground">₹{sizeData.buyingPrice}</span>
																		<span className="text-xs text-muted-foreground">Stock: {sizeData.stock}</span>
																	</Button>
																))}
															</div>
														</div>
													</div>
													);
												})}
											</div>
										) : (
											<div className="flex justify-center items-center h-full">
												<p className="text-sm text-muted-foreground">No products found</p>
											</div>
										)}
									</ScrollArea>
								)}

								{/* Selected Items */}
								<div className="border rounded-lg overflow-hidden mt-4">
									<div className="bg-muted px-4 py-3 border-b">
										<h3 className="font-medium text-sm">Selected Items</h3>
									</div>
									{purchaseForm.items.length > 0 ? (
										<div>
											{/* Desktop Header */}
											<div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-xs font-medium border-b">
												<div className="col-span-3">Product</div>
												<div className="col-span-1">Size</div>
												<div className="col-span-2">Price</div>
												<div className="col-span-2">Qty</div>
												<div className="col-span-2">Discount %</div>
												<div className="col-span-2 text-right pr-10">Total</div>
											</div>

											{/* Items */}
											<ScrollArea className="max-h-[300px]">
												{purchaseForm.items.map((item, idx) => {
													const variant = getVariantDetails(item.variantId);
													if (!variant) return null;
													
													const sizes = getSizes(variant);
													const sizeData = sizes.find((s: any) => s.size === item.size);
													
													return (
														<div key={`${item.variantId}-${item.size}-${idx}`} className="border-b last:border-0">
															{/* Mobile */}
															<div className="md:hidden p-3 space-y-3">
																<div className="flex items-start justify-between">
																	<div className="flex-1">
																		<p className="font-medium text-sm">{variant.product.name} - {variant.name}</p>
																		<p className="text-xs text-muted-foreground">Size: {item.size}</p>
																		<p className="text-xs text-muted-foreground">Stock: {sizeData?.stock || 0}</p>
																	</div>
																	<Button
																		type="button"
																		variant="ghost"
																		size="icon"
																		onClick={() => removeItem(item.variantId, item.size)}
																		className="h-8 w-8 text-destructive"
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</div>
																<div className="grid grid-cols-3 gap-2">
																	<div>
																		<Label className="text-xs mb-1">Price</Label>
																		<p className="text-sm font-medium">₹{item.unitPrice}</p>
																	</div>
																	<div>
																		<Label className="text-xs mb-1">Quantity</Label>
																		<Input
																			type="number"
																			min="1"
																			value={item.quantity}
																			onChange={(e) => updateItemQuantity(item.variantId, item.size, parseInt(e.target.value) || 1)}
																			className="h-8"
																		/>
																	</div>
																	<div>
																		<Label className="text-xs mb-1">Disc %</Label>
																		<Input
																			type="number"
																			step="0.01"
																			max="100"
																			value={item.discount}
																			onChange={(e) => updateItemDiscount(item.variantId, item.size, parseFloat(e.target.value) || 0)}
																			className="h-8"
																		/>
																	</div>
																</div>
																<div className="flex justify-between items-center pt-2 border-t">
																	<span className="text-xs text-muted-foreground">Total</span>
																	<span className="font-semibold">₹{item.totalPrice.toFixed(2)}</span>
																</div>
															</div>

															{/* Desktop */}
															<div className="hidden md:grid grid-cols-12 gap-4 items-center px-4 py-4">
																<div className="col-span-3">
																	<p className="font-medium text-sm">{variant.product.name} - {variant.name}</p>
																	<p className="text-xs text-muted-foreground mt-0.5">Stock: {sizeData?.stock || 0}</p>
																</div>
																<div className="col-span-1">
																	<Badge variant="secondary">{item.size}</Badge>
																</div>
																<div className="col-span-2">
																	<p className="text-sm font-medium">₹{item.unitPrice}</p>
																</div>
																<div className="col-span-2">
																	<Input
																		type="number"
																		min="1"
																		value={item.quantity}
																		onChange={(e) => updateItemQuantity(item.variantId, item.size, parseInt(e.target.value) || 1)}
																		className="h-9 w-20"
																	/>
																</div>
																<div className="col-span-2">
																	<Input
																		type="number"
																		step="0.01"
																		max="100"
																		value={item.discount}
																		onChange={(e) => updateItemDiscount(item.variantId, item.size, parseFloat(e.target.value) || 0)}
																		className="h-9 w-20"
																	/>
																</div>
																<div className="col-span-2 flex items-center justify-end gap-3">
																	<span className="font-semibold text-sm">₹{item.totalPrice.toFixed(2)}</span>
																	<Button
																		type="button"
																		variant="ghost"
																		size="icon"
																		onClick={() => removeItem(item.variantId, item.size)}
																		className="h-8 w-8 text-destructive"
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</div>
															</div>
														</div>
													);
												})}
											</ScrollArea>
										</div>
									) : (
										<div className="py-12 text-center">
											<Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
											<p className="text-sm text-muted-foreground">No items added yet</p>
											<p className="text-xs text-muted-foreground mt-1">Search and add products to continue</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Notes */}
						<Card>
							<CardHeader>
								<CardTitle>Additional Notes</CardTitle>
							</CardHeader>
							<CardContent>
								<Textarea
									placeholder="Enter any notes or special instructions..."
									value={purchaseForm.notes || ""}
									onChange={(e) => updateFormField('notes', e.target.value)}
									className="min-h-[100px]"
								/>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Summary */}
					<div className="lg:col-span-1">
						<Card className="lg:sticky lg:top-6">
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Subtotal</span>
									<span className="font-medium">₹{purchaseForm.subtotal.toFixed(2)}</span>
								</div>

								<div className="space-y-2">
									<Label className="text-sm">Discount</Label>
									<Input
										type="number"
										step="0.01"
										placeholder="0"
										value={purchaseForm.discount || ""}
										onChange={(e) => updateFormField('discount', parseFloat(e.target.value) || 0)}
										className="h-9"
									/>
								</div>

								<Separator />

								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Taxable Amount</span>
									<span className="font-medium">₹{purchaseForm.taxableAmount.toFixed(2)}</span>
								</div>

								{/* Tax Settings */}
								<div className="space-y-3">
									<Select
										value={purchaseForm.tax}
										onValueChange={(value) => updateFormField('tax', value as "igst" | "sgst_cgst")}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="igst">IGST</SelectItem>
											<SelectItem value="sgst_cgst">SGST + CGST</SelectItem>
										</SelectContent>
									</Select>

									{purchaseForm.tax === "igst" ? (
										<div className="space-y-2">
											<Label className="text-sm">IGST %</Label>
											<Input
												type="number"
												step="0.01"
												placeholder="18"
												value={purchaseForm.igst || ""}
												onChange={(e) => updateFormField('igst', parseFloat(e.target.value) || 0)}
												className="h-9"
											/>
										</div>
									) : (
										<div className="grid grid-cols-2 gap-2">
											<div className="space-y-2">
												<Label className="text-sm">CGST %</Label>
												<Input
													type="number"
													step="0.01"
													placeholder="9"
													value={purchaseForm.cgst || ""}
													onChange={(e) => updateFormField('cgst', parseFloat(e.target.value) || 0)}
													className="h-9"
												/>
											</div>
											<div className="space-y-2">
												<Label className="text-sm">SGST %</Label>
												<Input
													type="number"
													step="0.01"
													placeholder="9"
													value={purchaseForm.sgst || ""}
													onChange={(e) => updateFormField('sgst', parseFloat(e.target.value) || 0)}
													className="h-9"
												/>
											</div>
										</div>
									)}

									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Tax Amount</span>
										<span className="font-medium">₹{calculateTaxAmount().toFixed(2)}</span>
									</div>
								</div>

								<Separator />

								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Rounding Off</span>
									<span className="font-medium">₹{calculateRoundingOff().toFixed(2)}</span>
								</div>

								<Separator />

								<div className="flex justify-between items-center pt-2">
									<span className="font-semibold">Total Amount</span>
									<span className="font-bold text-xl">₹{purchaseForm.totalAmount.toFixed(2)}</span>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									type="submit"
									className="w-full"
									size="lg"
									disabled={isSaving || !purchaseForm.items.length || !purchaseForm.supplierId}
								>
									{isSaving ? "Processing..." : "Create Purchase Order"}
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</form>

			{/* Add Item Modal */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="sm:max-w-md" onKeyDown={handleModalKeyPress}>
					<DialogHeader>
						<DialogTitle>Add Item to Purchase</DialogTitle>
						<DialogDescription>
							{selectedVariant && `${selectedVariant.product?.name} - ${selectedVariant.name} (${selectedSize})`}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="modal-quantity">Quantity *</Label>
							<Input
								id="modal-quantity"
								type="number"
								min="1"
								value={modalQuantity}
								onChange={(e) => {
									const val = e.target.value;
									setModalQuantity(val === "" ? "" : parseInt(val) || "");
								}}
								className="h-10"
								autoFocus
								placeholder="Enter quantity"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="modal-buying-price">Buying Price *</Label>
							<Input
								id="modal-buying-price"
								type="number"
								step="0.01"
								min="0"
								value={modalBuyingPrice}
								onChange={(e) => setModalBuyingPrice(parseFloat(e.target.value) || 0)}
								className="h-10"
							/>
							{selectedSizeData && (
								<p className="text-xs text-muted-foreground">
									Original price: ₹{selectedSizeData.buyingPrice} | Stock: {selectedSizeData.stock}
								</p>
							)}
						</div>
					</div>
					<DialogFooter className="gap-3 sm:gap-3 flex-row sm:flex-row sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsModalOpen(false)}
							className="flex-1 sm:flex-none"
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleAddItemFromModal}
							disabled={
								modalQuantity === "" || 
								typeof modalQuantity === "string" ||
								modalQuantity < 1 || 
								!modalBuyingPrice
							}
							className="flex-1 sm:flex-none"
						>
							Add to Purchase
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
