import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as usersApi from '../api/users.js'

const USERS_KEY = ['users']

export const useUsers = () => useQuery({ queryKey: USERS_KEY, queryFn: usersApi.listUsers })

function useUsersMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

export const useCreateUser = () => useUsersMutation(usersApi.createUser)
export const useUpdateUser = () => useUsersMutation(({ id, ...changes }) => usersApi.updateUser(id, changes))
export const useResetUserPassword = () => useUsersMutation((id) => usersApi.resetUserPassword(id))
