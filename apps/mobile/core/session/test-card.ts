import {
  CardClass,
  FocusRequired,
  GeneralType,
  type TCard,
  type TPrimarySource,
} from '@diu/types';

export function testCard(
  id: string,
  title: string,
  primarySource: TPrimarySource = {
    integration: 'fixture',
    sourceId: id,
  },
  contextSources: TCard['contextSources'] = []
): TCard {
  return {
    id,
    title,
    description: `Description for ${title}`,
    duration: 600,
    focusRequired: FocusRequired.MEDIUM,
    class: CardClass.GENERAL,
    classType: GeneralType.MEETING,
    primarySource,
    contextSources,
  };
}
