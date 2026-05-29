import {
  TCard,
  CardClass,
  GeneralType,
  SoftwareEngineeringType,
} from '@diu/types';

interface CardStyle {
  backgroundColor: string;
  energyPillBgColor: string;
  energyPillTextColor: string;
  energyPillDotColor: string;
}

export const getCardStyle = (card: TCard): CardStyle => {
  switch (card.class) {
    case CardClass.GENERAL:
      switch (card.classType) {
        case GeneralType.MEETING:
          return {
            backgroundColor: 'bg-card-meeting',
            energyPillBgColor: 'bg-card-meeting-pill',
            energyPillTextColor: 'text-teal-dk',
            energyPillDotColor: 'bg-teal',
          };
        case GeneralType.NEEDS_REPLY:
          return {
            backgroundColor: 'bg-card-needs-reply',
            energyPillBgColor: 'bg-card-needs-reply-pill',
            energyPillTextColor: 'text-warning-dk',
            energyPillDotColor: 'bg-warning',
          };
      }
    case CardClass.SOFTWARE_ENGINEERING:
      switch (card.classType) {
        case SoftwareEngineeringType.PR_REVIEW_REQUEST:
          return {
            backgroundColor: 'bg-card-pr-review',
            energyPillBgColor: 'bg-card-pr-review-pill',
            energyPillTextColor: 'text-info-dk',
            energyPillDotColor: 'bg-info',
          };
        case SoftwareEngineeringType.PR_READY_TO_MERGE:
          return {
            backgroundColor: 'bg-card-pr-ready-to-merge',
            energyPillBgColor: 'bg-card-pr-ready-to-merge-pill',
            energyPillTextColor: 'text-success-dk',
            energyPillDotColor: 'bg-success',
          };
        case SoftwareEngineeringType.ISSUE:
          return {
            backgroundColor: 'bg-card-issue',
            energyPillBgColor: 'bg-card-issue-pill',
            energyPillTextColor: 'text-accent-dk',
            energyPillDotColor: 'bg-accent',
          };
      }
  }

  return {
    backgroundColor: 'bg-card-idle',
    energyPillBgColor: 'bg-card-idle-pill',
    energyPillTextColor: 'text-muted',
    energyPillDotColor: 'bg-hint',
  };
};
