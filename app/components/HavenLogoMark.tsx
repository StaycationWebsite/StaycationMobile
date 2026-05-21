import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { HAVEN_LOGO } from '../../constants/brand';

type HavenLogoMarkProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** Haven brand logo image from assets/images. */
export default function HavenLogoMark({ size = 32, style }: HavenLogoMarkProps) {
  return (
    <Image
      source={HAVEN_LOGO}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityLabel="taycation Haven logo"
    />
  );
}
