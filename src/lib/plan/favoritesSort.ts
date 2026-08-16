/** Moves favorited items to the front, preserving relative order otherwise. */
export function prioritizeFavorites<T extends { id: string }>(
  items: T[],
  favoriteIds: Set<string>
): T[] {
  if (favoriteIds.size === 0) return items;
  const favorites: T[] = [];
  const rest: T[] = [];
  for (const item of items) {
    (favoriteIds.has(item.id) ? favorites : rest).push(item);
  }
  return [...favorites, ...rest];
}
