"use client";

import { CreateOrderForm } from "@/components/orders/CreateOrderForm";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/orders";
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
  ShoppingCart,
  Package,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import { format } from "date-fns";

export default function OrdersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const canCreateOrder = user?.role === "ADMIN" || user?.role === "STAFF";

  // Fetch orders
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", page, statusFilter],
    queryFn: () =>
      ordersApi.getOrders({
        page,
        limit: 10,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "PENDING" | "COMPLETED" | "CANCELLED";
    }) => ordersApi.updateOrderStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update status");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created succesfully");
      setIsCreateModalOpen(false);
    },

    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || "Failed to create order";
      toast.error(errorMsg);
    },
  });

  const handleCreateOrder = (data: any) => {
    createMutation.mutate(data);
  };

  const handleStatusChange = (
    orderId: string,
    newStatus: "PENDING" | "COMPLETED" | "CANCELLED"
  ) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
        <p>Failed to load orders</p>
      </div>
    );
  }

  const { orders, pagination } = data!;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Orders
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Manage customer orders and track status
          </p>
        </div>
        {canCreateOrder && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        )}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <span className="text-sm font-medium">Filter by status:</span>
            <div className="flex gap-2 flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Orders</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter && statusFilter !== "ALL" && (
                <Button
                  variant="outline"
                  onClick={() => setStatusFilter("ALL")}
                  className="whitespace-nowrap"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 text-center">
              {statusFilter && statusFilter !== "ALL"
                ? "No orders found with this status"
                : "No orders yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                  {/* Left side - Order info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base sm:text-lg truncate">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">{order.user.name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right side - Total amount */}
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {order.orderItems.length} item(s)
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4">
                {/* Order Items Preview */}
                <div className="flex flex-wrap gap-2">
                  {order.orderItems.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-slate-50 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm"
                    >
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[150px] sm:max-w-none">
                        {item.product.name} × {item.quantity}
                      </span>
                    </div>
                  ))}
                  {order.orderItems.length > 2 && (
                    <div className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm text-slate-500">
                      +{order.orderItems.length - 2} more
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(order)}
                    className="w-full sm:w-auto text-sm"
                  >
                    View Details
                  </Button>
                  {canCreateOrder && order.status === "PENDING" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(order.id, "COMPLETED")
                        }
                        disabled={updateStatusMutation.isPending}
                        className="w-full sm:w-auto text-sm text-green-600 hover:text-green-700"
                      >
                        Mark Complete
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(order.id, "CANCELLED")
                        }
                        disabled={updateStatusMutation.isPending}
                        className="w-full sm:w-auto text-sm text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-xs sm:text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Customer</p>
                  <p className="font-medium text-sm sm:text-base">
                    {selectedOrder.user.name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {selectedOrder.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Order Date</p>
                  <p className="font-medium text-sm sm:text-base">
                    {format(
                      new Date(selectedOrder.createdAt),
                      "MMM d, yyyy h:mm a"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm sm:text-base">
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-slate-50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500">
                          SKU: {item.product.sku}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-medium text-sm sm:text-base">
                          {item.quantity} × ${item.priceAtTime.toFixed(2)}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500">
                          = ${(item.quantity * item.priceAtTime).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Order Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Select products and quantities for this order
            </DialogDescription>
          </DialogHeader>
          <CreateOrderForm
            onSubmit={handleCreateOrder}
            isLoading={createMutation.isPending}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
