"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Product, CreateProductData, UpdateProductData } from "@/types";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stockLevel: z.number().int().min(0, "Stock cannot be negative").optional(),
  lowStockThreshold: z
    .number()
    .int()
    .min(0, "Threshold cannot be negative")
    .optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void; // ← Use the form's own type
  isLoading: boolean;
  onCancel: () => void;
}

export function ProductForm({
  product,
  onSubmit,
  isLoading,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      stockLevel: 0,
      lowStockThreshold: 10,
    },
  });

  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("sku", product.sku);
      setValue("description", product.description || "");
      setValue("price", product.price);
      setValue("stockLevel", product.stockLevel);
      setValue("lowStockThreshold", product.lowStockThreshold);
    }
  }, [product, setValue]);

  const handleFormSubmit = (data: ProductFormData) => {
    // Convert form data to the appropriate type
    const submitData = {
      name: data.name,
      sku: data.sku,
      description: data.description || undefined,
      price: data.price,
      stockLevel: data.stockLevel,
      lowStockThreshold: data.lowStockThreshold,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Wireless Mouse"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">SKU *</Label>
        <Input
          id="sku"
          {...register("sku")}
          placeholder="MOUSE-001"
          disabled={isLoading}
        />
        {errors.sku && (
          <p className="text-sm text-red-600">{errors.sku.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Ergonomic wireless mouse"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price ($) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
          placeholder="29.99"
          disabled={isLoading}
        />
        {errors.price && (
          <p className="text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="stockLevel">Stock Level</Label>
        <Input
          id="stockLevel"
          type="number"
          {...register("stockLevel", { valueAsNumber: true })}
          placeholder="50"
          disabled={isLoading}
        />
        {errors.stockLevel && (
          <p className="text-sm text-red-600">{errors.stockLevel.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
        <Input
          id="lowStockThreshold"
          type="number"
          {...register("lowStockThreshold", { valueAsNumber: true })}
          placeholder="10"
          disabled={isLoading}
        />
        {errors.lowStockThreshold && (
          <p className="text-sm text-red-600">
            {errors.lowStockThreshold.message}
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {product ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{product ? "Update Product" : "Create Product"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
