"use client";

import { usePurchaseStore } from "@/store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "../site-header";
import { Search, Plus, RefreshCw, Hash, Calendar, Package, X, Download, Building2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import DatePicker from "@/components/ui/datePicker";

export default function PurchasesPage() {
	const {
		filteredPurchases,
		purchaseSearchQuery,
		isLoadingPurchases,
		setPurchaseSearchQuery,
		fetchPurchases,
		updatePurchaseStatus,
		deletePurchase,
	} = usePurchaseStore();

	const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
		from: undefined,
		to: undefined,
	});
	const [fromDate, setFromDate] = useState<string>('');
	const [toDate, setToDate] = useState<string>('');
	const [datePickerKey, setDatePickerKey] = useState<number>(0);

	useEffect(() => {
		fetchPurchases();
	}, [fetchPurchases]);

	// Filter purchases by status
	const pendingPurchases = filteredPurchases.filter(purchase => 
		purchase.status.toLowerCase() === 'pending'
	);
	const receivedPurchases = filteredPurchases.filter(purchase => 
		purchase.status.toLowerCase() === 'received'
	);
	const cancelledPurchases = filteredPurchases.filter(purchase => 
		purchase.status.toLowerCase() === 'cancelled'
	);

	const clearDateFilter = () => {
		setDateRange({ from: undefined, to: undefined });
		setFromDate('');
		setToDate('');
		setDatePickerKey(prev => prev + 1); // Force re-render of DatePicker components
	};

	const handleFromDateChange = (date: Date) => {
		if (date) {
			const dateString = date.toISOString().split('T')[0];
			setFromDate(dateString);
			setDateRange(prev => ({ ...prev, from: date }));
		}
	};

	const handleToDateChange = (date: Date) => {
		if (date) {
			const dateString = date.toISOString().split('T')[0];
			setToDate(dateString);
			setDateRange(prev => ({ ...prev, to: date }));
		}
	};

	// Filter by search query
	const filterBySearch = (purchases: any[]) => {
		if (!purchaseSearchQuery) return purchases;
		return purchases.filter(purchase =>
			purchase.supplier.name.toLowerCase().includes(purchaseSearchQuery.toLowerCase()) ||
			purchase.invoiceNo.includes(purchaseSearchQuery)
		);
	};

	// Filter by date range
	const filterByDateRange = (purchases: any[]) => {
		if (!dateRange.from && !dateRange.to) return purchases;
		
		return purchases.filter(purchase => {
			const purchaseDate = new Date(purchase.purchaseDate);
			
			if (dateRange.from && dateRange.to) {
				return purchaseDate >= dateRange.from && purchaseDate <= dateRange.to;
			} else if (dateRange.from) {
				return purchaseDate >= dateRange.from;
			} else if (dateRange.to) {
				return purchaseDate <= dateRange.to;
			}
			
			return true;
		});
	};

	// Combined filter function
	const applyAllFilters = (purchases: any[]) => {
		return filterByDateRange(filterBySearch(purchases));
	};

	const openPurchaseDetails = (purchase: any) => {
		setSelectedPurchase(purchase);
	};

	const closePurchaseDetails = () => {
		setSelectedPurchase(null);
	};

	const handleStatusUpdate = async (purchase: any, newStatus: "PENDING" | "RECEIVED" | "CANCELLED" | "pending" | "received" | "cancelled") => {
		try {
			await updatePurchaseStatus(purchase.id, newStatus);
			toast.success(`Purchase status updated to ${newStatus}`);
			setSelectedPurchase({ ...purchase, status: newStatus });
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error('Failed to update purchase status');
		}
	};

	const handleApprovePurchase = async (purchase: any) => {
		try {
			toast.loading(`Approving Purchase #${purchase.invoiceNo}...`);
			
			const response = await fetch(`/api/purchases/${purchase.id}/approve`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			
			if (response.ok) {
				const updatedPurchase = await response.json();
				await fetchPurchases(); // Refresh the list
				setSelectedPurchase({ ...purchase, status: 'received' });
				
				toast.dismiss();
				toast.success(`Purchase #${purchase.invoiceNo} has been approved`);
			} else {
				const errorData = await response.json();
				toast.dismiss();
				toast.error(errorData.message || 'Failed to approve purchase');
			}
		} catch (error) {
			console.error('Error approving purchase:', error);
			toast.dismiss();
			toast.error('Failed to approve purchase');
		}
	};

	const handleDeletePurchase = async (purchaseId: string) => {
		if (confirm("Are you sure you want to delete this purchase?")) {
			try {
				await deletePurchase(purchaseId);
				toast.success("Purchase deleted successfully");
				closePurchaseDetails();
			} catch (error) {
				console.error('Error deleting purchase:', error);
				toast.error("Failed to delete purchase");
			}
		}
	};

	const handleDownloadPDF = async (purchase: any) => {
		try {
			toast.loading(`Generating PDF for Purchase #${purchase.invoiceNo}...`);
			
			const response = await fetch(`/api/purchases/${purchase.id}/pdf`, {
				method: 'GET',
			});
			
			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `purchase_${purchase.invoiceNo}.pdf`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
				
				toast.dismiss();
				toast.success(`PDF downloaded successfully`);
			} else {
				toast.dismiss();
				toast.error('Failed to generate PDF');
			}
		} catch (error) {
			console.error('Error downloading PDF:', error);
			toast.dismiss();
			toast.error('Failed to download PDF');
		}
	};

	const renderPurchaseCard = (purchase: any) => {
		return (
			<Card key={purchase.id} className="hover:shadow-md transition-shadow cursor-pointer">
				<CardHeader
					className="px-4 sm:px-6"
					onClick={() => openPurchaseDetails(purchase)}
				>
					{/* Mobile Layout */}
					<div className="block sm:hidden">
						<div className="flex justify-between items-start mb-2">
							<CardTitle className="text-base truncate flex-1 mr-2">{purchase.supplier.name}</CardTitle>
							<Badge variant="secondary" className="text-xs">
								{purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
							</Badge>
						</div>
						<div className="text-xs space-y-1 mb-3 text-muted-foreground">
							<div className="flex items-center gap-1">
								<span>#{purchase.invoiceNo}</span>
							</div>
							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3 flex-shrink-0" />
								<span>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
							</div>
							<div className="font-medium text-foreground">
								₹{purchase.totalAmount.toFixed(2)}
							</div>
						</div>
					</div>

					{/* Desktop Layout */}
					<div className="hidden sm:flex items-start justify-between gap-3">
						<div className="flex-1 min-w-0">
							<CardTitle className="text-lg truncate">{purchase.supplier.name}</CardTitle>
							<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
								<span className="flex items-center gap-1">
									<span>#{purchase.invoiceNo}</span>
								</span>
								<span className="flex items-center gap-1">
									<Calendar className="h-4 w-4 flex-shrink-0" />
									<span>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
								</span>
								<span className="font-medium">
									₹{purchase.totalAmount.toFixed(2)}
								</span>
							</div>
						</div>
						<Badge variant="secondary" className="flex-shrink-0">
							{purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
						</Badge>
					</div>
				</CardHeader>
			</Card>
		);
	};

	return (
		<div className="flex flex-col min-h-screen">
			<SiteHeader name="Purchase Orders" />
			<div className="flex-1 space-y-4 p-4 sm:p-6">
				{/* Header */}
				<div className="space-y-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Purchase Orders</h1>
						<p className="text-muted-foreground text-sm sm:text-base mt-1">
							Manage and track all your purchase orders
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
						<Button
							variant="outline"
							size="sm"
							onClick={fetchPurchases}
							disabled={isLoadingPurchases}
							className="flex items-center justify-center gap-2 w-full sm:w-auto"
						>
							<RefreshCw className={`h-4 w-4 ${isLoadingPurchases ? 'animate-spin' : ''}`} />
							Refresh
						</Button>
						<Link href="/purchases/create">
							<Button className="w-full sm:w-auto">
								<Plus className="h-4 w-4 mr-2" />
								New Purchase
							</Button>
						</Link>
					</div>
				</div>

				{/* Error State */}
				{error && (
					<Card className="border-red-200 bg-red-50">
						<CardContent className="py-3 sm:py-4">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
								<p className="text-red-800 text-sm">Error: {error}</p>
								<Button
									variant="outline"
									size="sm"
									onClick={fetchPurchases}
									disabled={isLoadingPurchases}
									className="text-red-800 border-red-300 hover:bg-red-100 w-full sm:w-auto"
								>
									<RefreshCw className={`h-4 w-4 mr-2 ${isLoadingPurchases ? 'animate-spin' : ''}`} />
									Retry
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Loading State */}
				{isLoadingPurchases ? (
					<div className="space-y-3 sm:space-y-4">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="animate-pulse">
								<CardContent className="py-4 sm:py-6">
									<div className="space-y-2 sm:space-y-3">
										<div className="h-4 bg-muted rounded w-3/4 sm:w-1/4"></div>
										<div className="h-3 bg-muted rounded w-full sm:w-1/2"></div>
										<div className="h-3 bg-muted rounded w-2/3 sm:w-1/3"></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<>
						{/* Search and Filters */}
						<div className="space-y-3">			
							{/* Date Filters Row */}
							<div className="flex flex-col sm:flex-row gap-3 sm:items-end">
								{/* Date Range Filter */}
								<div className="flex flex-col sm:flex-row gap-3 flex-1">
									<div className="flex-1 sm:max-w-[200px]">
										<div className="space-y-1">
											<label className="text-sm font-medium text-muted-foreground">From Date</label>
											<div className="[&_label]:hidden">
												<DatePicker 
													key={`from-${datePickerKey}`}
													setPurchase={handleFromDateChange} 
												/>
											</div>
										</div>
									</div>
									<div className="flex-1 sm:max-w-[200px]">
										<div className="space-y-1">
											<label className="text-sm font-medium text-muted-foreground">To Date</label>
											<div className="[&_label]:hidden">
												<DatePicker 
													key={`to-${datePickerKey}`}
													setPurchase={handleToDateChange} 
												/>
											</div>
										</div>
									</div>
								</div>
								
								{/* Clear Date Filter */}
								{(dateRange.from || dateRange.to) && (
									<Button
										variant="ghost"
										size="sm"
										onClick={clearDateFilter}
										className="h-10 px-3 mt-6 sm:mt-0"
									>
										<X className="h-4 w-4 mr-2" />
										Clear Dates
									</Button>
								)}
							</div>
							{/* Search Bar */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search purchases..."
									value={purchaseSearchQuery}
									onChange={(e) => setPurchaseSearchQuery(e.target.value)}
									className="pl-10 h-10"
								/>
							</div>
						</div>

						{/* Tabs */}
						<Tabs defaultValue="pending" className="space-y-4 sm:space-y-6">
							<TabsList className="grid w-full grid-cols-3 h-auto">
								<TabsTrigger value="pending" className="cursor-pointer flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
									<span>Pending</span>
									<Badge variant="secondary" className="text-xs">{applyAllFilters(pendingPurchases).length}</Badge>
								</TabsTrigger>
								<TabsTrigger value="received" className="cursor-pointer flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
									<span>Received</span>
									<Badge variant="secondary" className="text-xs">{applyAllFilters(receivedPurchases).length}</Badge>
								</TabsTrigger>
								<TabsTrigger value="cancelled" className="cursor-pointer flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
									<span>Cancelled</span>
									<Badge variant="secondary" className="text-xs">{applyAllFilters(cancelledPurchases).length}</Badge>
								</TabsTrigger>
							</TabsList>

							<TabsContent value="pending" className="space-y-3 sm:space-y-4">
								{applyAllFilters(pendingPurchases).length > 0 ? (
									applyAllFilters(pendingPurchases).map(purchase => renderPurchaseCard(purchase))
								) : (
									<Card>
										<CardContent className="py-6 sm:py-8 text-center">
											<Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
											<p className="text-muted-foreground text-sm sm:text-base">No pending purchases found</p>
										</CardContent>
									</Card>
								)}
							</TabsContent>

							<TabsContent value="received" className="space-y-3 sm:space-y-4">
								{applyAllFilters(receivedPurchases).length > 0 ? (
									applyAllFilters(receivedPurchases).map(purchase => renderPurchaseCard(purchase))
								) : (
									<Card>
										<CardContent className="py-6 sm:py-8 text-center">
											<Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
											<p className="text-muted-foreground text-sm sm:text-base">No received purchases found</p>
										</CardContent>
									</Card>
								)}
							</TabsContent>

							<TabsContent value="cancelled" className="space-y-3 sm:space-y-4">
								{applyAllFilters(cancelledPurchases).length > 0 ? (
									applyAllFilters(cancelledPurchases).map(purchase => renderPurchaseCard(purchase))
								) : (
									<Card>
										<CardContent className="py-6 sm:py-8 text-center">
											<Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
											<p className="text-muted-foreground text-sm sm:text-base">No cancelled purchases found</p>
										</CardContent>
									</Card>
								)}
							</TabsContent>
						</Tabs>
					</>
				)}
			</div>

			{/* Purchase Details Modal */}
			{selectedPurchase && (
				<div
					className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center p-4"
					onClick={closePurchaseDetails}
				>
					<div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div className="flex items-center justify-between p-4 sm:p-6 border-b">
							<div className="flex-1 min-w-0">
								<h2 className="text-lg sm:text-xl font-semibold truncate">
									Purchase Order Details - {selectedPurchase.supplier.name}
								</h2>
								<div className="flex items-center gap-2 mt-1">
									<span className="text-sm text-muted-foreground">#{selectedPurchase.invoiceNo}</span>
									<Badge variant="secondary">
										{selectedPurchase.status.charAt(0).toUpperCase() + selectedPurchase.status.slice(1)}
									</Badge>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={closePurchaseDetails}
								className="flex-shrink-0 ml-2"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>

						{/* Modal Content */}
						<div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
							<div className="space-y-4 sm:space-y-6">
								{/* Purchase Summary */}
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
									<div>
										<p className="text-sm font-medium text-muted-foreground">Supplier</p>
										<div className="flex items-center gap-2 mt-1">
											<Building2 className="h-4 w-4 text-muted-foreground" />
											<p className="text-base font-semibold">{selectedPurchase.supplier.name}</p>
										</div>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
										<div className="flex items-center gap-2 mt-1">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<p className="text-base">{new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</p>
										</div>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Total Amount</p>
										<p className="text-base font-semibold">₹{selectedPurchase.totalAmount.toFixed(2)}</p>
									</div>
								</div>

								{/* Purchase Items */}
								<div>
									<div className="flex items-center gap-2 mb-3 sm:mb-4">
										<Package className="h-5 w-5 text-muted-foreground" />
										<h3 className="text-lg font-medium">Purchase Items ({selectedPurchase.items.length})</h3>
									</div>
									<div className="space-y-3">
										{selectedPurchase.items.map((item: any, index: number) => (
											<div key={index} className="border rounded-lg p-4">
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
													<div className="flex-1 min-w-0">
														<h4 className="font-medium text-base">{item.product.name}</h4>
														<p className="text-sm text-muted-foreground mt-1">
															{item.variant.name} • {item.variant.size}
														</p>
														<div className="flex flex-col sm:flex-row gap-2 mt-2 text-sm text-muted-foreground">
															<span>Quantity: <span className="font-medium text-foreground">{item.quantity}</span></span>
															<span>Unit Price: <span className="font-medium text-foreground">₹{item.unitPrice.toFixed(2)}</span></span>
															<span>Total: <span className="font-medium text-foreground">₹{item.totalPrice.toFixed(2)}</span></span>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Status Management Section */}
								<div className="p-4 bg-muted/30 rounded-lg">
									<h4 className="text-sm font-medium text-muted-foreground mb-3">
										Change Status (Current: {selectedPurchase.status})
									</h4>
									<div className="flex flex-col sm:flex-row gap-2">
										{selectedPurchase.status.toLowerCase() === 'pending' && (
											<>
												<Button
													size="sm"
													onClick={() => handleStatusUpdate(selectedPurchase, 'received')}
													className="flex-1"
												>
													Mark as Received
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleStatusUpdate(selectedPurchase, 'cancelled')}
													className="flex-1"
												>
													Cancel Purchase
												</Button>
											</>
										)}
										{selectedPurchase.status.toLowerCase() === 'received' && (
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleStatusUpdate(selectedPurchase, 'pending')}
												className="flex-1"
											>
												Mark as Pending
											</Button>
										)}
										{selectedPurchase.status.toLowerCase() === 'cancelled' && (
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleStatusUpdate(selectedPurchase, 'pending')}
												className="flex-1"
											>
												Reactivate Purchase
											</Button>
										)}
										{/* Fallback buttons for any status */}
										{!['pending', 'received', 'cancelled'].includes(selectedPurchase.status.toLowerCase()) && (
											<div className="text-sm text-muted-foreground">
												Unknown status: {selectedPurchase.status}
											</div>
										)}
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
									{selectedPurchase.status === 'pending' && (
										<Button
											className="flex-1"
											onClick={() => handleApprovePurchase(selectedPurchase)}
										>
											Approve Purchase
										</Button>
									)}
									{selectedPurchase.status === 'received' && (
										<Button
											variant="outline"
											className="flex-1"
											onClick={() => handleDownloadPDF(selectedPurchase)}
										>
											<Download className="h-4 w-4 mr-2" />
											Download PDF
										</Button>
									)}
									<Button
										variant="destructive"
										onClick={() => handleDeletePurchase(selectedPurchase.id)}
									>
										Delete Purchase
									</Button>
									<Button
										variant="outline"
										onClick={closePurchaseDetails}
									>
										Close
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
