import { LogBox } from 'react-native';

// Suppress known warnings from React Navigation Material Top Tabs
LogBox.ignoreLogs([
  'A props object containing a "key" prop is being spread into JSX',
  'React keys must be passed directly to JSX without using spread',
]);

export {};