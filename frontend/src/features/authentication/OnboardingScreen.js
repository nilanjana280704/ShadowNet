/**
 * OnboardingScreen — three paged intro slides explaining offline comms,
 * emergency help, and the community mesh. Skip / Next / Get started advance the
 * flow; finishing persists the onboarding flag so it isn't shown again.
 */
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { spacing } from '../../theme';
import { Button, OnboardingSlide, ScreenWrapper, StepIndicator, Text } from '../../components';
import { completeOnboarding } from '../../redux';
import { strings } from '../../localization';

const SLIDE_META = [
  { icon: 'mesh', tone: 'accent' },
  { icon: 'sos', tone: 'sos' },
  { icon: 'users', tone: 'info' },
];

function OnboardingScreen() {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const slides = strings.onboarding.slides;
  const isLast = index === slides.length - 1;

  const finish = () => dispatch(completeOnboarding());

  const onNext = () => {
    if (isLast) {
      finish();
      return;
    }
    const next = index + 1;
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  const onScrollEnd = (e) => {
    if (!width) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <ScreenWrapper animatedBackground={false} padded={false}>
      <View style={styles.topBar}>
        <StepIndicator total={slides.length} current={index} />
        <Text variant="button" color="muted" onPress={finish} style={styles.skip}>
          {strings.common.skip}
        </Text>
      </View>

      <View style={styles.pager} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
          >
            {slides.map((s, i) => (
              <OnboardingSlide
                key={s.title}
                width={width}
                icon={SLIDE_META[i].icon}
                tone={SLIDE_META[i].tone}
                title={s.title}
                body={s.body}
              />
            ))}
          </ScrollView>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          label={isLast ? strings.common.getStarted : strings.common.next}
          fullWidth
          size="lg"
          onPress={onNext}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skip: { textTransform: 'none' },
  pager: { flex: 1, justifyContent: 'center' },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.md },
});

export default OnboardingScreen;
