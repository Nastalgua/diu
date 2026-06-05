import { ScrollView, View } from 'react-native';
import {
  IconBrandFigma,
  IconBrandGithub,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandTabler,
  IconCalendarEvent,
  IconMail,
} from '@tabler/icons-react-native';
import { DiuText } from '@/core/components/text/Text';
import { TCard } from '@diu/types';
import EnergyPill from './EnergyPill';
import { getCardStyle } from './helper';

type FeedCardItemProps = {
  card: TCard;
};

const CONTEXT_ICON_COLOR = '#6B7280';

const integrationIconMap = {
  github: IconBrandGithub,
  slack: IconBrandSlack,
  notion: IconBrandNotion,
  figma: IconBrandFigma,
  gmail: IconMail,
  jira: IconBrandTabler,
  'google-calendar': IconCalendarEvent,
} as const;

function formatIntegrationLabel(integration: string): string {
  const normalized = integration.replace(/[-_]+/g, ' ').trim();
  if (!normalized) return integration;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function FeedCardItem({ card }: FeedCardItemProps) {
  const {
    backgroundColor,
    energyPillBgColor,
    energyPillTextColor,
    energyPillDotColor,
  } = getCardStyle(card);

  const contextSources = card.contextSources ?? [];
  const visibleContextSources = contextSources.slice(0, 3);
  const overflowContextCount = Math.max(contextSources.length - 3, 0);

  return (
    <View className={`${backgroundColor} h-full w-full flex-1`}>
      <ScrollView
        testID="feed-card-scroll"
        className="flex-1"
        contentContainerClassName="flex-grow justify-end gap-4 px-6 pt-6 pb-2"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <EnergyPill
          timeToCompletion={card.duration}
          focusRequired={card.focusRequired}
          energyPillBgColor={energyPillBgColor}
          energyPillTextColor={energyPillTextColor}
          energyPillDotColor={energyPillDotColor}
        />

        <View>
          <DiuText variant="cardTitle">{card.title}</DiuText>
          <DiuText variant="body">{card.description}</DiuText>
        </View>

        {contextSources.length > 0 ? (
          <View testID="feed-card-context-sources" className="gap-2">
            {visibleContextSources.map((contextSource) => (
              <View
                key={`${contextSource.integration}-${contextSource.sourceId}`}
                className="rounded-lg border border-zinc-200 bg-white/60 px-3 py-2"
              >
                <DiuText variant="body" className="font-medium text-zinc-900">
                  {contextSource.contextNote}
                </DiuText>
                <View className="mt-1 flex-row items-center gap-2">
                  {(() => {
                    const Icon =
                      integrationIconMap[
                        contextSource.integration.toLowerCase() as keyof typeof integrationIconMap
                      ];

                    if (!Icon) {
                      return null;
                    }

                    return (
                      <Icon
                        testID={`context-source-icon-${contextSource.integration}-${contextSource.sourceId}`}
                        size={14}
                        strokeWidth={2}
                        color={CONTEXT_ICON_COLOR}
                      />
                    );
                  })()}
                  <DiuText variant="body" className="text-zinc-600">
                    -
                  </DiuText>
                  <DiuText variant="micro" className="text-zinc-600">
                    {formatIntegrationLabel(contextSource.integration)}
                  </DiuText>
                </View>
              </View>
            ))}

            {overflowContextCount > 0 ? (
              <DiuText variant="micro" className="text-zinc-600">
                +{overflowContextCount} more
              </DiuText>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
