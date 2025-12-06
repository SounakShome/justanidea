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
		updateVariantDiscount,
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
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedSizes, setSelectedSizes] = useState<Array<{
		size: string;
		quantity: string;
		buyingPrice: number;
		stock: number;
	}>>([]);
	
	// Delete modal state
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [itemsToDelete, setItemsToDelete] = useState<Array<{
		variantId: string;
		size: string;
		variantName: string;
	}>>([]);
	const [selectedDeleteItems, setSelectedDeleteItems] = useState<string[]>([]);

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
			fetchVariants(purchaseForm.supplierId, variantSearchQuery).catch(() => {
				toast.error("Failed to search products");
			});
		}
	}, [purchaseForm.supplierId, variantSearchQuery, fetchVariants]);

	// Handle opening modal with selected variant
	const handleOpenModal = (variant: Variant) => {
		setSelectedVariant(variant);
		setIsEditMode(false);
		const sizes = getSizes(variant);
		// Initialize with all sizes, no quantity by default
		setSelectedSizes(sizes.map((sizeData: any) => ({
			size: sizeData.size,
			quantity: "",
			buyingPrice: sizeData.buyingPrice,
			stock: sizeData.stock
		})));
		setIsModalOpen(true);
	};

	// Update quantity for a size
	const updateSizeQuantity = (sizeIndex: number, quantity: string) => {
		setSelectedSizes(prev => prev.map((item, idx) => 
			idx === sizeIndex ? { ...item, quantity } : item
		));
	};

	// Update buying price for a size
	const updateSizeBuyingPrice = (sizeIndex: number, price: number) => {
		setSelectedSizes(prev => prev.map((item, idx) => 
			idx === sizeIndex ? { ...item, buyingPrice: price } : item
		));
	};

	// Handle adding items from modal
	const handleAddItemFromModal = () => {
		if (!selectedVariant) return;

		// Get only sizes with quantity entered
		const selectedItems = selectedSizes.filter(item => {
			const qty = item.quantity === "" ? 0 : parseInt(item.quantity);
			return !isNaN(qty) && qty > 0;
		});

		if (selectedItems.length === 0) {
			toast.error("Please enter quantity for at least one size");
			return;
		}

		if (isEditMode) {
			// In edit mode: first remove all existing items for this variant, then add new ones
			const existingItems = purchaseForm.items.filter(item => item.variantId === selectedVariant.id);
			existingItems.forEach(item => {
				removeItem(item.variantId, item.size);
			});
		}

		let addedCount = 0;
		selectedItems.forEach(item => {
			// Create a modified variant with updated buying price for this specific size
			const modifiedVariant = {
				...selectedVariant,
				sizes: selectedVariant.sizes.map((s: any) => 
					s.size === item.size 
						? { ...s, buyingPrice: item.buyingPrice }
						: s
				)
			};

			// Add item with the specified quantity
			const qty = parseInt(item.quantity);
			for (let i = 0; i < qty; i++) {
				addVariantToItems(modifiedVariant, item.size);
			}
			addedCount += qty;
		});

		// Close modal and reset
		setIsModalOpen(false);
		setSelectedVariant(null);
		setIsEditMode(false);
		setSelectedSizes([]);
		setVariantSearchQuery("");
		toast.success(isEditMode ? `Updated quantities` : `Added ${addedCount} item(s) to purchase`);
	};

	// Handle opening delete modal
	const handleOpenDeleteModal = (groupItems: typeof purchaseForm.items, variant: any) => {
		setItemsToDelete(groupItems.map(item => ({
			variantId: item.variantId,
			size: item.size,
			variantName: `${variant.product.name} - ${variant.name}`
		})));
		setSelectedDeleteItems([]);
		setDeleteModalOpen(true);
	};

	// Handle toggling delete item selection
	const toggleDeleteItem = (size: string) => {
		setSelectedDeleteItems(prev => 
			prev.includes(size) 
				? prev.filter(s => s !== size)
				: [...prev, size]
		);
	};

	// Handle deleting selected items
	const handleDeleteSelectedItems = () => {
		if (selectedDeleteItems.length === 0) {
			toast.error("Please select at least one item to remove");
			return;
		}
		
		selectedDeleteItems.forEach(size => {
			const item = itemsToDelete.find(i => i.size === size);
			if (item) {
				removeItem(item.variantId, item.size);
			}
		});
		
		setDeleteModalOpen(false);
		setItemsToDelete([]);
		setSelectedDeleteItems([]);
		toast.success(`Removed ${selectedDeleteItems.length} item(s)`);
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
																		onClick={() => handleOpenModal(variant)}
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
										<div className="col-span-4">Product</div>
										<div className="col-span-2">Price</div>
										<div className="col-span-2">Qty</div>
										<div className="col-span-2">Discount %</div>
										<div className="col-span-2 text-right pr-10">Total</div>
									</div>											{/* Items */}
											<div className="max-h-[300px] overflow-y-auto">
												{(() => {
													// Group items by variantId and unitPrice
													const groupedItems = purchaseForm.items.reduce((acc, item) => {
														const key = `${item.variantId}-${item.unitPrice}`;
														if (!acc[key]) {
															acc[key] = {
																variantId: item.variantId,
																unitPrice: item.unitPrice,
																items: []
															};
														}
														acc[key].items.push(item);
														return acc;
													}, {} as Record<string, { variantId: string; unitPrice: number; items: typeof purchaseForm.items }>);

													return Object.values(groupedItems).map((group, groupIdx) => {
														const variant = getVariantDetails(group.variantId);
														if (!variant) return null;

														const sizes = getSizes(variant);
														const totalQuantity = group.items.reduce((sum, item) => sum + item.quantity, 0);
														const totalPrice = group.items.reduce((sum, item) => sum + item.totalPrice, 0);
														const avgDiscount = group.items.reduce((sum, item) => sum + item.discount, 0) / group.items.length;
														const sizesDisplay = group.items.map(item => `${item.size} (${item.quantity})`).join(', ');

														return (
															<div key={`group-${groupIdx}`} className="border-b last:border-0">
																{/* Mobile */}
																<div className="md:hidden p-3 space-y-3">
																	<div className="flex items-start justify-between">
																		<div className="flex-1">
																			<p className="font-medium text-sm">{variant.product.name} - {variant.name}</p>
																			<p className="text-xs text-muted-foreground mt-1">
																				Sizes: {sizesDisplay}
																			</p>
																			{group.items.map((item, idx) => {
																				const sizeData = sizes.find((s: any) => s.size === item.size);
																				return (
																					<p key={idx} className="text-xs text-muted-foreground">
																						{item.size} stock: {sizeData?.stock || 0}
																					</p>
																				);
																			})}
																		</div>
																		<Button
																			type="button"
																			variant="ghost"
																			size="icon"
																			onClick={() => handleOpenDeleteModal(group.items, variant)}
																			className="h-7 w-7 text-destructive"
																		>
																			<Trash2 className="h-4 w-4" />
																		</Button>
																	</div>
																	<div className="grid grid-cols-2 gap-2">
																		<div>
																			<Label className="text-xs mb-1">Price</Label>
																			<p className="text-sm font-medium">₹{group.unitPrice}</p>
																		</div>
																		<div>
																			<Label className="text-xs mb-1">Total Qty</Label>
																			<p className="text-sm font-medium">{totalQuantity}</p>
																		</div>
																	</div>
																	<div className="space-y-2 pt-2 border-t">
																		<div className="flex gap-2 flex-wrap">
																			{group.items.map((item, idx) => (
																				<div key={idx} className="flex items-center gap-2 text-xs">
																					<Badge variant="outline" className="shrink-0">{item.size}</Badge>
																					<Input
																						type="number"
																						min="1"
																						value={item.quantity}
																						onChange={(e) => updateItemQuantity(item.variantId, item.size, parseInt(e.target.value) || 1)}
																						className="h-7 w-16 text-xs"
																					/>
																				</div>
																			))}
																		</div>
																		<div className="flex items-center gap-2">
																			<Label className="text-xs">Discount %:</Label>
																			<Input
																				type="number"
																				step="0.01"
																				max="100"
																				value={group.items[0].discount === 0 ? '' : group.items[0].discount}
																				onChange={(e) => updateVariantDiscount(variant.id, e.target.value ? parseFloat(e.target.value) : 0)}
																				placeholder="0"
																				className="h-7 w-20 text-xs"
																			/>
																		</div>
																	</div>
																	<div className="flex justify-between items-center pt-2 border-t">
																		<span className="text-xs text-muted-foreground">Total</span>
																		<span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
																	</div>
																</div>

																{/* Desktop */}
																<div className="hidden md:block px-4 py-4">
																	<div className="grid grid-cols-12 gap-4 items-start">
																		<div className="col-span-4">
																			<p className="font-medium text-sm">{variant.product.name} - {variant.name}</p>
																			<p className="text-xs text-muted-foreground mt-1">
																				{sizesDisplay}
																			</p>
																		</div>
																	<div className="col-span-2">
																		<p className="text-sm font-medium">₹{group.unitPrice}</p>
																	</div>
																	<div className="col-span-2">
																		<div className="flex items-center gap-2">
																			<span className="text-sm font-medium min-w-8">{totalQuantity}</span>
																			<Button
																				type="button"
																				variant="outline"
																				size="sm"
																				onClick={() => {
																				// Open modal with current quantities
																				const sizes = getSizes(variant);
																				setSelectedVariant(variant);
																				setIsEditMode(true);
																				setSelectedSizes(group.items.map(item => ({
																						size: item.size,
																						quantity: item.quantity.toString(),
																						buyingPrice: item.unitPrice,
																						stock: sizes.find((s: any) => s.size === item.size)?.stock || 0
																					})));
																					setIsModalOpen(true);
																				}}
																				className="h-7 px-2 text-xs"
																			>
																				Edit
																			</Button>
																		</div>
																	</div>
																	<div className="col-span-2">
																		<Input
																			type="number"
																			step="0.01"
																			max="100"
																			value={group.items[0].discount === 0 ? '' : group.items[0].discount}
																			onChange={(e) => updateVariantDiscount(variant.id, e.target.value ? parseFloat(e.target.value) : 0)}
																			placeholder="0"
																			className="h-8 w-20"
																		/>
																	</div>
																	<div className="col-span-2 flex items-center justify-end gap-3">
																			<span className="font-bold text-base">₹{totalPrice.toFixed(2)}</span>
																			<Button
																				type="button"
																				variant="ghost"
																				size="icon"
																				onClick={() => handleOpenDeleteModal(group.items, variant)}
																				className="h-8 w-8 text-destructive"
																			>
																				<Trash2 className="h-4 w-4" />
																			</Button>
																		</div>
																	</div>
																</div>
															</div>
														);
													});
												})()}
											</div>
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
								<div className="flex gap-2">
									<Select
										value={purchaseForm.discountType}
										onValueChange={(value) => updateFormField('discountType', value as "percentage" | "amount")}
									>
										<SelectTrigger className="w-[110px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="percentage">%</SelectItem>
											<SelectItem value="amount">₹</SelectItem>
										</SelectContent>
									</Select>
									<Input
										type="number"
										step="0.01"
										placeholder="0"
										value={purchaseForm.discount || ""}
										onChange={(e) => updateFormField('discount', parseFloat(e.target.value) || 0)}
										className="h-9 flex-1"
									/>
								</div>
							</div>

							<Separator />								<div className="flex justify-between text-sm">
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
				<DialogContent className="sm:max-w-2xl max-h-[90vh]" onKeyDown={handleModalKeyPress}>
					<DialogHeader>
						<DialogTitle>Add Items to Purchase</DialogTitle>
						<DialogDescription>
							{selectedVariant && `${selectedVariant.product?.name} - ${selectedVariant.name}`}
						</DialogDescription>
					</DialogHeader>
					<ScrollArea className="max-h-[60vh] pr-4">
						<div className="py-4">
							<p className="text-sm text-muted-foreground mb-4">
								Enter quantities for sizes you want to add
							</p>
							<div className="space-y-2">
								{/* Header */}
								<div className="grid grid-cols-12 gap-3 px-3 py-2 bg-muted/50 rounded-lg font-medium text-sm">
									<div className="col-span-3">Size</div>
									<div className="col-span-3">Quantity</div>
									<div className="col-span-4">Buying Price</div>
									<div className="col-span-2">Stock</div>
								</div>
								
								{/* Rows */}
								{selectedSizes.map((sizeItem, idx) => (
									<div 
										key={idx}
										className="grid grid-cols-12 gap-3 px-3 py-2 border rounded-lg items-center"
									>
										<div className="col-span-3">
											<Label className="text-base font-semibold">{sizeItem.size}</Label>
										</div>
										<div className="col-span-3">
											<Input
												id={`quantity-${idx}`}
												type="number"
												min="0"
												value={sizeItem.quantity}
												onChange={(e) => updateSizeQuantity(idx, e.target.value)}
												className="h-9"
												placeholder="0"
											/>
										</div>
										<div className="col-span-4">
											<Input
												id={`price-${idx}`}
												type="number"
												step="0.01"
												min="0"
												value={sizeItem.buyingPrice}
												onChange={(e) => updateSizeBuyingPrice(idx, parseFloat(e.target.value) || 0)}
												className="h-9"
											/>
										</div>
										<div className="col-span-2">
											<p className="text-sm text-muted-foreground">{sizeItem.stock}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</ScrollArea>
					<DialogFooter className="gap-2 sm:gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsModalOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleAddItemFromModal}
						>
							Add to Purchase
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Items Modal */}
			<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Remove Items</DialogTitle>
						<DialogDescription>
							Select which sizes to remove from this purchase
						</DialogDescription>
					</DialogHeader>
					<ScrollArea className="max-h-[60vh]">
						<div className="space-y-2 py-4">
							{itemsToDelete.map((item, idx) => (
								<label
									key={idx}
									className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
								>
									<input
										type="checkbox"
										checked={selectedDeleteItems.includes(item.size)}
										onChange={() => toggleDeleteItem(item.size)}
										className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
									/>
									<div className="flex-1">
										<div className="font-medium">{item.variantName}</div>
										<div className="text-sm text-muted-foreground">Size: {item.size}</div>
									</div>
								</label>
							))}
						</div>
					</ScrollArea>
					<DialogFooter className="gap-2 sm:gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setDeleteModalOpen(false);
								setItemsToDelete([]);
								setSelectedDeleteItems([]);
							}}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDeleteSelectedItems}
							disabled={selectedDeleteItems.length === 0}
						>
							Remove Selected
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
