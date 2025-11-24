"use client";

import { useState } from "react";
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
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { CreateAdjustmentData } from "@/types";

interface CreateAdjustmentFormProps {
  onSubmit: (data: CreateAdjustmentData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function CreateAdjustmentForm({
  onSubmit,
  isLoading,
  onCancel,
}: CreateAdjustmentFormProps) {
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  // Fetch all products for the dropdown
  const { data: productsData } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => productsApi.getProducts({ limit: 100 }),
  });

  const products = productsData?.products || [];
  const selectedProduct = products.find((p) => p.id === productId);

  // Validate quantity based on type
  const getActualQuantity = () => {
    if (type === "IN") {
      return Math.abs(quantity); // Always positive
    } else {
      return -Math.abs(quantity); // Always negative
    }
  };

  const isValid = () => {
    return productId && quantity > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid()) {
      return;
    }

    // Check if OUT would exceed stock
    if (type === "OUT" && selectedProduct) {
      if (quantity > selectedProduct.stockLevel) {
        alert(
          `Cannot remove ${quantity} units. Only ${selectedProduct.stockLevel} in stock.`
        );
        return;
      }
    }

    const adjustmentData: CreateAdjustmentData = {
      productId,
      quantity: getActualQuantity(),
      type,
      reason: reason.trim() || undefined,
    };

    onSubmit(adjustmentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Select */}
      <div className="space-y-2">
        <Label htmlFor="product">Product *</Label>
        <Select
          value={productId}
          onValueChange={setProductId}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - {product.sku} (Current: {product.stockLevel}{" "}
                units)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Select */}
      <div className="space-y-2">
        <Label htmlFor="type">Adjustment Type *</Label>
        <Select
          value={type}
          onValueChange={(value: "IN" | "OUT") => setType(value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IN">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Stock IN (Add)</span>
              </div>
            </SelectItem>
            <SelectItem value="OUT">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span>Stock OUT (Remove)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quantity Input */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={
            type === "OUT" && selectedProduct
              ? selectedProduct.stockLevel
              : undefined
          }
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          disabled={isLoading}
          placeholder="Enter quantity"
        />
        {type === "OUT" && selectedProduct && (
          <p className="text-sm text-slate-500">
            Available stock: {selectedProduct.stockLevel} units
          </p>
        )}
      </div>

      {/* Reason Input */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason (Optional)</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isLoading}
          placeholder="e.g., Damaged goods, Restock, Inventory count correction"
        />
      </div>

      {/* Preview */}
      {productId && (
        <div className="p-4 bg-slate-50 rounded-lg space-y-2">
          <p className="font-semibold text-sm">Preview:</p>
          <div className="text-sm text-slate-700">
            <p>
              Product:{" "}
              <span className="font-medium">{selectedProduct?.name}</span>
            </p>
            <p>
              Current Stock:{" "}
              <span className="font-medium">
                {selectedProduct?.stockLevel} units
              </span>
            </p>
            <p className={type === "IN" ? "text-green-600" : "text-red-600"}>
              Change:{" "}
              <span className="font-bold">
                {type === "IN" ? "+" : "-"}
                {quantity} units
              </span>
            </p>
            <p>
              New Stock:{" "}
              <span className="font-bold">
                {selectedProduct
                  ? selectedProduct.stockLevel + getActualQuantity()
                  : 0}{" "}
                units
              </span>
            </p>
          </div>
        </div>
      )}

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
              Creating...
            </>
          ) : (
            <>
              {type === "IN" ? (
                <TrendingUp className="mr-2 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-2 h-4 w-4" />
              )}
              Create Adjustment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
