import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { GuestColors } from '../../constants/Styles';

const STEPS = [
  { id: 0, icon: 'users' as const },
  { id: 1, icon: 'calendar' as const },
  { id: 2, icon: 'package' as const },
  { id: 3, icon: 'credit-card' as const },
];

const STEP_GREEN = '#32D74B';
const CIRCLE = 34;
const LINE_W = 26;

function StepDoneCheck({ size }: { size: number }) {
  const ringInset = 4;
  const center = size / 2;
  const ringRadius = center - ringInset;
  return (
    <View style={{ width: size, height: size, flexShrink: 0, position: 'relative' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={center} cy={center} r={center} fill={STEP_GREEN} />
        <Circle cx={center} cy={center} r={ringRadius} fill="none" stroke="#FFFFFF" strokeWidth={2} />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Feather name="check" size={13} color="#FFFFFF" strokeWidth={2.5} />
      </View>
    </View>
  );
}

type BookingStepIndicatorProps = {
  currentStep: number;
};

export default function BookingStepIndicator({ currentStep }: BookingStepIndicatorProps) {
  return (
    <View style={styles.row}>
      {STEPS.map((step, index) => {
        const completed = index < currentStep;
        const active = index === currentStep;
        const lineGreen = index < currentStep;
        return (
          <React.Fragment key={step.id}>
            {completed ? (
              <StepDoneCheck size={CIRCLE} />
            ) : (
              <View
                style={[
                  styles.circle,
                  active ? styles.circleActive : styles.circlePending,
                ]}
              >
                <Feather
                  name={step.icon}
                  size={15}
                  color={active ? '#FFFFFF' : GuestColors.charcoal}
                />
              </View>
            )}
            {index < STEPS.length - 1 ? (
              <View
                style={[styles.line, lineGreen ? styles.lineDone : styles.linePending]}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: GuestColors.gold,
    borderWidth: 0,
  },
  circlePending: {
    backgroundColor: '#EFEFEF',
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
  },
  line: {
    width: LINE_W,
    height: 2,
    marginHorizontal: 4,
  },
  lineDone: {
    backgroundColor: STEP_GREEN,
  },
  linePending: {
    backgroundColor: '#D0D0D0',
  },
});
