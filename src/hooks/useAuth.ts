"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { LoginCredentials, RegisterCredentials, AuthResponse } from "@/types";

export const useAuth = () => {
  const router = useRouter();
  const { setAuth, logout: logoutStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<AuthResponse>(
        "/api/auth/login",
        credentials
      );
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Login successful!");
      router.push("/dashboard");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { data } = await api.post<AuthResponse>(
        "/api/auth/register",
        credentials
      );
      return data;
    },

    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success("Registration successful!");
      router.push("/dashboard");
    },

    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || "Registration failed";
      toast.error(errorMsg);
    },
  });

  const logout = () => {
    logoutStore();
    router.push("/auth/login");
    toast.success("Logged out succesfully");
  };

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
