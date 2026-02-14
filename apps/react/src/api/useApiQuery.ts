import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "./axios";
import { queryKeys } from "./queryKeys";

/**
 * GET 요청 + TanStack Query 연동 예시
 *
 * @example
 * const { data, isLoading, error } = useApiQuery('/users', { queryKey: [...queryKeys.all, 'users'] });
 */
export function useApiQuery<TData = unknown>(
  url: string,
  options?: Omit<UseQueryOptions<TData, Error, TData, string[]>, "queryKey" | "queryFn"> & {
    params?: Record<string, string | number | boolean | undefined>;
  }
) {
  const { params, ...queryOptions } = options ?? {};
  return useQuery({
    queryKey: [url, ...(params ? [JSON.stringify(params)] : [])],
    queryFn: async () => {
      const { data } = await apiClient.get<TData>(url, { params });
      return data;
    },
    ...queryOptions,
  });
}

/**
 * mutation(POST/PUT/PATCH/DELETE) + TanStack Query 연동 예시
 *
 * @example
 * const mutation = useApiMutation((body) => apiClient.post('/users', body), {
 *   onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
 * });
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData }>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const result = await mutationFn(variables);
      return result.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
