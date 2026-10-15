import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '../api/auth.js'
import { ME_KEY } from '../lib/queryClient.js'

/** The logged-in user: undefined while loading, null when logged out. */
export function useMe() {
  return useQuery({ queryKey: ME_KEY, queryFn: authApi.getMe, staleTime: 5 * 60_000, retry: false })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    // Even if the request fails (e.g. already expired), clear everything locally.
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(ME_KEY, null)
    },
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ME_KEY }),
  })
}
