import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { createTheme } from '../theme';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const systemColorScheme = useColorScheme();

  const effectiveMode =
    themeMode === 'auto'
      ? (systemColorScheme as 'light' | 'dark') ?? 'light'
      : themeMode;

  const theme = createTheme(effectiveMode);

  return { theme, mode: effectiveMode };
};
