import type { TPrimarySource } from '@diu/types';

export function primarySourceKey(source: TPrimarySource): string {
  return `${source.integration}:${source.sourceId}`;
}
