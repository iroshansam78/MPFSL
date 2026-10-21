import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as mediaApi from '../api/media.js'
import * as sitePhotosApi from '../api/sitePhotos.js'

const SITE_PHOTOS_KEY = ['site-photos']

/** The changed spots as a Map by spot name. */
export const useSitePhotos = () =>
  useQuery({
    queryKey: SITE_PHOTOS_KEY,
    queryFn: sitePhotosApi.listSitePhotos,
    select: (photos) => new Map(photos.map((photo) => [photo.key, photo])),
  })

function useSitePhotoMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn, onSettled: () => queryClient.invalidateQueries({ queryKey: SITE_PHOTOS_KEY }) })
}

/**
 * Saves a spot: uploads `file` first when one was picked, then saves it with the caption.
 * If saving fails after the upload, the uploaded photo is deleted again.
 */
export const useUpdateSitePhoto = () =>
  useSitePhotoMutation(async ({ key, file, alt }) => {
    if (!file) return sitePhotosApi.updateSitePhoto(key, { alt })
    const media = await mediaApi.uploadPhoto(file, alt)
    try {
      return await sitePhotosApi.updateSitePhoto(key, { alt, media: media.id })
    } catch (err) {
      await mediaApi.deleteMedia(media.id).catch(() => {})
      throw err
    }
  })

export const useRestoreSitePhoto = () => useSitePhotoMutation((key) => sitePhotosApi.restoreSitePhoto(key))
