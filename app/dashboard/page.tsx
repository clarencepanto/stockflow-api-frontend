"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/dashboard";
import { useAuthStore } from "@/store/authStore";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StockLevelsChart } from "@/components/dashboard/StockLevelsChart";
import { OrderStatusChart } from "@/components/dashboard/OrderStatusChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>Failed to load dashboard data</p>
      </div>
    );
  }

  const { stats, recentOrders, lowStockProducts, charts } = data; // ← Added charts

  const statsCards = [
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/dashboard/products",
    },
    {
      title: "Active Orders",
      value: stats.activeOrders.toString(),
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: "/dashboard/orders",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems.toString(),
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      link: "/dashboard/products",
    },
    {
      title: "Revenue This Month",
      value: `$${stats.revenueThisMonth.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "/dashboard/orders",
    },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening with your inventory today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ========== CHARTS START HERE ========== */}

      {/* Revenue and Order Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={charts.revenueChart} />
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={charts.orderStatusChart} />
          </CardContent>
        </Card>
      </div>

      {/* Stock Levels Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels (Top Products)</CardTitle>
        </CardHeader>
        <CardContent>
          <StockLevelsChart data={charts.stockLevelsChart} />
        </CardContent>
      </Card>

      {/* ========== CHARTS END HERE ========== */}

      {/* Recent Orders and Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No recent orders
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/dashboard/orders`}>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {order.user.name} • {order.orderItems.length} item(s)
                        </p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <p className="font-bold text-slate-900">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                All products are well stocked! ✨
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <Link key={product.id} href={`/dashboard/products`}>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {product.stockLevel} units
                        </p>
                        <p className="text-xs text-slate-500">
                          Min: {product.lowStockThreshold}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
