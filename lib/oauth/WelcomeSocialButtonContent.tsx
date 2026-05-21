import React from 'react';
import { View, Text } from 'react-native';
import type { WelcomeSocialStyles } from '../welcomeOAuthStyles';

type WelcomeSocialButtonContentProps = {
  styles: WelcomeSocialStyles;
  icon: React.ReactNode;
  label: string;
};

/** Icon + label grouped tight and centered inside the social button (mockup). */
export function WelcomeSocialButtonContent({ styles: s, icon, label }: WelcomeSocialButtonContentProps) {
  return (
    <View style={s.socialBtnInner}>
      <View style={s.socialIconSlot}>{icon}</View>
      <Text style={s.socialBtnText}>{label}</Text>
    </View>
  );
}
