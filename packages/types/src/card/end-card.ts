export type TEndCard = {
  kind: 'end';
  id: string;
  title: string;
  description: string;
};

export function isEndCard(
  item: { kind?: string },
): item is TEndCard {
  return item.kind === 'end';
}
