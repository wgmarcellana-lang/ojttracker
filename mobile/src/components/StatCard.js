import { Text, View } from 'react-native';
import { styles } from '../styles';

export function StatCard({ toneStyle, short, value, label }) {
  return (
    <View style={styles.statCard}>
      <View style={toneStyle}>
        <Text style={styles.statToneText}>{short}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
