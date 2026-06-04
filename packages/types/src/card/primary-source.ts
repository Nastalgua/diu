/**
 * Stable identity for tackle deduplication (ADR 0003).
 * Two primary sources match when integration and sourceId are equal.
 */
export type TPrimarySource = {
  integration: string;
  sourceId: string;
};

export function isSamePrimarySource(
  a: TPrimarySource,
  b: TPrimarySource
): boolean {
  return a.integration === b.integration && a.sourceId === b.sourceId;
}
