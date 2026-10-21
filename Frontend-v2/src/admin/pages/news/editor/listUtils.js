// Helpers for editing arrays in the story form.
export const replaceAt = (list, index, value) => list.map((item, i) => (i === index ? value : item))
export const removeAt = (list, index) => list.filter((_, i) => i !== index)
export function moveItem(list, index, step) {
  const next = [...list]
  ;[next[index], next[index + step]] = [next[index + step], next[index]]
  return next
}
