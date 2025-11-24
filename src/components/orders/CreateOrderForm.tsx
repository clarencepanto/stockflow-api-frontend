"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Product, CreateOrderData } from "@/types";

interface OrderItem {
  productId: string;
  quantity: number;
  product?: Product;
}

interface CreateOrderFormProps {
  onSubmit: (data: CreateOrderData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function CreateOrderForm({
  onSubmit,
  isLoading,
  onCancel,
}: CreateOrderFormProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { productId: "", quantity: 1 },
  ]);

  // Fetch all products for the dropdown
  const { data: productsData } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  });

  const products = productsData?.products || [];

  // Add new item row
  const addItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1 }]);
  };

  // Remove item row
  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Update product selection
  const updateProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      productId,
      product,
    };
    setOrderItems(newItems);
  };

  // Update quantity
  const updateQuantity = (index: number, quantity: number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], quantity };
    setOrderItems(newItems);
  };

  // Calculate totals
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      if (item.product) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);
  };

  // Check if form is valid
  const isValid = () => {
    return (
      orderItems.every((item) => item.productId && item.quantity > 0) &&
      orderItems.length > 0
    );
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid()) {
      return;
    }

    // Check stock levels
    const invalidItems = orderItems.filter((item) => {
      if (item.product) {
        return item.quantity > item.product.stockLevel;
      }
      return false;
    });

    if (invalidItems.length > 0) {
      alert(
        `Insufficient stock for: ${invalidItems
          .map((i) => i.product?.name)
          .join(", ")}`
      );
      return;
    }

    const orderData: CreateOrderData = {
      items: orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    onSubmit(orderData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Order Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        {orderItems.map((item, index) => (
          <div
            key={index}
            className="flex gap-2 items-start p-3 border rounded-lg"
          >
            <div className="flex-1 space-y-2">
              {/* Product Select */}
              <Select
                value={item.productId}
                onValueChange={(value) => updateProduct(index, value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem
                      key={product.id}
                      value={product.id}
                      disabled={product.stockLevel === 0}
                    >
                      {product.name} - ${product.price.toFixed(2)} (
                      {product.stockLevel} in stock)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quantity Input */}
              <div className="flex gap-2 items-center">
                <Label className="text-sm w-20">Quantity:</Label>
                <Input
                  type="number"
                  min="1"
                  max={item.product?.stockLevel || 999}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(index, parseInt(e.target.value) || 1)
                  }
                  disabled={isLoading}
                  className="w-24"
                />
                {item.product && (
                  <span className="text-sm text-slate-500">
                    (Max: {item.product.stockLevel})
                  </span>
                )}
              </div>

              {/* Item Subtotal */}
              {item.product && (
                <div className="text-sm font-medium text-slate-700">
                  Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              )}
            </div>

            {/* Remove Button */}
            {orderItems.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
        <span className="font-semibold text-lg">Total:</span>
        <span className="font-bold text-2xl text-slate-900">
          ${calculateTotal().toFixed(2)}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !isValid()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Order...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create Order
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
