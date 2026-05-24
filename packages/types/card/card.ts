export enum FocusRequired {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum CardClass {
  GENERAL = 'general',
  SOFTWARE_ENGINEERING = 'software-engineering',
}

export enum GeneralType {
  MEETING = 'meeting',
  NEEDS_REPLY = 'needs-reply',
}

export enum SoftwareEngineeringType {
  ISSUE = 'issue',
  PR_REVIEW_REQUEST = 'pr-review-request',
  PR_READY_TO_MERGE = 'pr-ready-to-merge',
}

type CardClassType = GeneralType | SoftwareEngineeringType;

export type TCard = {
  id: string;
  title: string;
  description: string;
  duration: number; // the amount of time the task will take to complete (seconds)
  focusRequired: FocusRequired;
  class: CardClass;
  classType: CardClassType;
};
