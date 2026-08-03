/**
 * Builds a standardized cursor-pagination response.
 *
 * Strategy:
 *   We fetch `limit + 1` rows from the database.
 *   - If we got more rows than `limit`, there are more pages → slice to `limit`, set hasMore = true.
 *   - The cursor for the next page is the `id` of the last item in the returned slice.
 *
 * @param rows  - Array of database rows (fetched with LIMIT = limit + 1)
 * @param limit - The page size the client requested
 */
export function buildPaginationResponse<T extends { id: number | string }>(
  rows: T[],
  limit: number
): { data: T[]; nextCursor: string | null; hasMore: boolean } {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && data.length > 0
    ? String(data[data.length - 1].id)
    : null;

  return { data, nextCursor, hasMore };
}
