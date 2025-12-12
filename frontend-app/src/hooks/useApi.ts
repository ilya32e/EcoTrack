import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "../services/api";
import type {
  PaginatedIndicators,
  Source,
  TrendPoint,
  User,
  Zone
} from "../types";

export const useIndicators = (params: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ["indicators", params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedIndicators>("/indicators/", {
        params
      });
      return response.data;
    }
  });

export const useTrend = (params: { zone_id: number; indicator_type: string; period?: string }) =>
  useQuery({
    queryKey: ["trend", params],
    queryFn: async () => {
      const response = await apiClient.get<{ series: TrendPoint[] }>("/stats/trend/", { params });
      return response.data.series;
    },
    enabled: Boolean(params.zone_id && params.indicator_type)
  });

export const useAirAverage = (params: { zone_id?: number; indicator_type?: string }) =>
  useQuery({
    queryKey: ["air-average", params],
    queryFn: async () => {
      const response = await apiClient.get("/stats/air/averages/", { params });
      return response.data;
    }
  });

export const useZones = () =>
  useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      console.log("[useZones] Fetching zones...");
      try {
        const response = await apiClient.get<Zone[]>("/zones/");
        console.log("[useZones] Success:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("[useZones] Error:", error.message, error.response?.data);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

export const useSources = () =>
  useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      console.log("[useSources] Fetching sources...");
      try {
        const response = await apiClient.get<Source[]>("/sources/");
        console.log("[useSources] Success:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("[useSources] Error:", error.message, error.response?.data);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5
  });

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("[useUsers] Fetching users...");
      try {
        const response = await apiClient.get<User[]>("/users/");
        console.log("[useUsers] Success:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("[useUsers] Error:", error.message, error.response?.data);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5
  });

export const useCreateUser = () =>
  useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiClient.post<User>("/auth/register/", payload);
      return response.data;
    }
  });

export const useUpdateUser = () =>
  useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const response = await apiClient.patch<User>(`/users/${id}/`, payload);
      return response.data;
    }
  });

export const useDeleteUser = () =>
  useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/users/${id}/`);
    }
  });

export const useCreateZone = () =>
  useMutation({
    mutationFn: async (payload: Partial<Zone>) => {
      const response = await apiClient.post<Zone>("/zones/", payload);
      return response.data;
    }
  });

