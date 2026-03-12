import { Text, View } from 'react-native';
import { styles } from '../styles';

export function EmptyState({ title, copy }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {copy ? <Text style={styles.emptyCopy}>{copy}</Text> : null}
    </View>
  );
}
