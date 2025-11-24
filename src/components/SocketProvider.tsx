"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, getSocket, disconnectSocket } from "@/lib/socket";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // Track recent toast IDs to prevent duplicates
  const recentToasts = useRef<Set<string>>(new Set());

  const showToastOnce = (id: string, toastFn: () => void) => {
    if (!recentToasts.current.has(id)) {
      recentToasts.current.add(id);
      toastFn();

      // Remove from set after 2 seconds
      setTimeout(() => {
        recentToasts.current.delete(id);
      }, 2000);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    connectSocket();
    const socket = getSocket();

    console.log("🔌 Connecting to Socket.IO...");

    socket.on("connect", () => {
      console.log("✅ Socket.IO connected!");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket.IO disconnected");
    });

    // Listen for order created
    socket.on("order:created", (data: any) => {
      console.log("🛒 New order created:", data);

      // Only show toast ONCE per order
      showToastOnce(`order-${data.orderId}`, () => {
        toast.success(`New order from ${data.userName}!`, {
          description: `${data.itemCount} item(s) - $${data.totalAmount.toFixed(
            2
          )}`,
        });
      });

      // Refresh orders and dashboard
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    });

    // Listen for stock updated
    socket.on("stock:updated", (data: any) => {
      console.log("📦 Stock updated:", data);

      // Only show toast ONCE per adjustment (even if multiple products)
      showToastOnce(`stock-${data.productId}-${data.newStock}`, () => {
        const changeText = data.type === "IN" ? "added" : "removed";
        toast.info(`Stock ${changeText}: ${data.productName}`, {
          description: `${Math.abs(data.change)} units (Now: ${data.newStock})`,
        });
      });

      // Refresh products, inventory, and dashboard
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    });

    return () => {
      console.log("🔌 Disconnecting Socket.IO...");
      disconnectSocket();
    };
  }, [isAuthenticated, queryClient]);

  return <>{children}</>;
}
