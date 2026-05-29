import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

type FeedViewportLayoutProps = {
  children: (layout: { pageHeight: number }) => React.ReactNode;
  footer?: React.ReactNode;
};

export function FeedViewportLayout({
  children,
  footer,
}: FeedViewportLayoutProps) {
  const [pageHeight, setPageHeight] = useState(0);

  const onContentLayout = (event: LayoutChangeEvent) => {
    setPageHeight(event.nativeEvent.layout.height);
  };

  return (
    <View className="bg-bg flex-1">
      <View
        testID="feed-viewport-content"
        className="flex-1"
        onLayout={onContentLayout}
      >
        {pageHeight > 0 ? children({ pageHeight }) : null}
      </View>
      {footer}
    </View>
  );
}
