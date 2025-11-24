"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/lib/inventory";
import { productsApi } from "@/lib/products";
import { CreateAdjustmentForm } from "@/components/CreateAdjustmetForm";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Package,
  Calendar,
  User,
} from "lucide-react";

import { format } from "date-fns";

export default function InventoryPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const canCreateAdjustment = user?.role === "ADMIN" || user?.role === "STAFF";

  //   Create adjustment mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => inventoryApi.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Adjustment created successfully");
      setIsCreateModalOpen(false);
    },

    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.error || "Failed to create adjustment";
      toast.error(errorMsg);
    },
  });

  const handleCreateAdjustment = (data: any) => {
    createMutation.mutate(data);
  };

  // Fetch adjustments
  const { data, isLoading, error } = useQuery({
    queryKey: ["inventory", page, typeFilter],
    queryFn: () =>
      inventoryApi.getAdjustments({
        page,
        limit: 20,
        type: typeFilter === "ALL" ? undefined : typeFilter,
      }),
  });

  const getTypeColor = (type: string) => {
    return type === "IN"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getTypeIcon = (type: string) => {
    return type === "IN" ? TrendingUp : TrendingDown;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Failed to load inventory adjustments</p>
      </div>
    );
  }

  const { adjustments, pagination } = data!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Inventory Adjustments
          </h1>
          <p className="text-slate-500 mt-1">
            Track all stock movements and adjustments
          </p>
        </div>
        {canCreateAdjustment && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>
        )}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Filter by type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Adjustments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Adjustments</SelectItem>
                <SelectItem value="IN">Stock In</SelectItem>
                <SelectItem value="OUT">Stock Out</SelectItem>
              </SelectContent>
            </Select>
            {typeFilter !== "ALL" && (
              <Button variant="outline" onClick={() => setTypeFilter("ALL")}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adjustments List */}
      {adjustments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {typeFilter !== "ALL"
                ? "No adjustments found with this type"
                : "No inventory adjustments yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {adjustments.map((adjustment) => {
            const TypeIcon = getTypeIcon(adjustment.type);
            const isPositive = adjustment.quantity > 0;

            return (
              <Card
                key={adjustment.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-lg ${getTypeColor(
                        adjustment.type
                      )}`}
                    >
                      <TypeIcon className="h-6 w-6" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {adjustment.product.name}
                        </h3>
                        <Badge className={getTypeColor(adjustment.type)}>
                          {adjustment.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        SKU: {adjustment.product.sku}
                      </p>
                      {adjustment.reason && (
                        <p className="text-sm text-slate-600 mt-1">
                          Reason: {adjustment.reason}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {adjustment.user.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(adjustment.createdAt),
                            "MMM d, yyyy h:mm a"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {adjustment.quantity}
                      </p>
                      <p className="text-xs text-slate-500">units</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Adjustment Modal - Placeholder */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Inventory Adjustment</DialogTitle>
            <DialogDescription>
              Manually adjust stock levels for a product
            </DialogDescription>
          </DialogHeader>
          <CreateAdjustmentForm
            onSubmit={handleCreateAdjustment}
            isLoading={createMutation.isPending}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
