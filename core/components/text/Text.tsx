/**
 * Typed Text component — wraps RN Text with Diu type scale.
 * Usage:
 *   <DiuText variant="cardTitle">Hello</DiuText>
 *   <DiuText variant="body" className="text-muted">Subtext</DiuText>
 */
import { Text, TextProps } from 'react-native';

type Variant =
  | 'pageTitle'
  | 'sectionHead'
  | 'cardTitle'
  | 'body'
  | 'bodySm'
  | 'label'
  | 'overline'
  | 'micro';

const variantClass: Record<Variant, string> = {
  pageTitle: 'font-medium text-page-title   text-primary',
  sectionHead: 'font-medium text-section-head text-primary',
  cardTitle: 'font-medium text-card-title   text-primary',
  body: 'font-sans   text-body         text-primary',
  bodySm: 'font-sans   text-body-sm      text-muted',
  label: 'font-medium text-label        text-primary',
  overline:
    'font-medium text-overline     text-muted   uppercase tracking-overline',
  micro: 'font-sans   text-micro        text-hint',
};

interface DiuTextProps extends TextProps {
  variant?: Variant;
  className?: string;
}

export function DiuText({
  variant = 'body',
  className = '',
  ...props
}: DiuTextProps) {
  return (
    <Text className={`${variantClass[variant]} ${className}`} {...props} />
  );
}
