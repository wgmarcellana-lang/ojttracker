import { View } from 'react-native';
import { styles } from '../styles';

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
