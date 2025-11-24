"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/inventory", label: "Inventory", icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">StockFlow</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-50
              w-64 bg-white border-r transform transition-transform
              ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }
            `}
          >
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-slate-900">StockFlow</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Inventory Management
                </p>
              </div>

              {/* User Info */}
              <div className="p-4 border-b">
                <p className="font-medium text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {user?.role}
                </span>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-600 hover:bg-slate-50"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 lg:hidden z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
