import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as newsApi from '../api/news.js'

const NEWS_KEY = ['news']

export const useStories = () => useQuery({ queryKey: NEWS_KEY, queryFn: newsApi.listStories })

export const useStory = (id) =>
  useQuery({ queryKey: [...NEWS_KEY, id], queryFn: () => newsApi.getStory(id), enabled: Boolean(id) })

function useNewsMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn, ...options, onSettled: () => queryClient.invalidateQueries({ queryKey: NEWS_KEY }) })
}

/** Creates the story (no `id`) or saves it. */
export const useSaveStory = () =>
  useNewsMutation(({ id, ...body }) => (id ? newsApi.updateStory(id, body) : newsApi.createStory(body)))

export const useSetStoryStatus = () => useNewsMutation(({ id, status }) => newsApi.setStoryStatus(id, status))

export const useFeatureStory = () => useNewsMutation((id) => newsApi.featureStory(id))

export const useDeleteStory = () => useNewsMutation((id) => newsApi.deleteStory(id))

/** Saves a new order; the list updates straight away and rolls back if saving fails. */
export function useReorderStories() {
  const queryClient = useQueryClient()
  return useNewsMutation((stories) => newsApi.reorderStories(stories.map((story) => story.id)), {
    onMutate: async (stories) => {
      await queryClient.cancelQueries({ queryKey: NEWS_KEY })
      const previous = queryClient.getQueryData(NEWS_KEY)
      queryClient.setQueryData(NEWS_KEY, stories)
      return { previous }
    },
    onError: (_err, _stories, context) => queryClient.setQueryData(NEWS_KEY, context.previous),
  })
}
