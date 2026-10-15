import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client.js'

export const ME_KEY = ['me']

// If any request says the session is gone (expired, logged out elsewhere, account deactivated),
// forget the user — RequireAuth then sends them to the login page.
// If it says a password change is required, refresh the user so they're sent to that page.
function handleAuthErrors(error) {
  if (!(error instanceof ApiError)) return
  if (error.status === 401) queryClient.setQueryData(ME_KEY, null)
  if (error.code === 'PASSWORD_CHANGE_REQUIRED') queryClient.invalidateQueries({ queryKey: ME_KEY })
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthErrors }),
  mutationCache: new MutationCache({ onError: handleAuthErrors }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      // Don't retry auth / permission / validation errors — only flaky network or server errors.
      retry: (count, error) => error instanceof ApiError && (error.status === 0 || error.status >= 500) && count < 2,
    },
  },
})
