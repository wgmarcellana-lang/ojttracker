import { Text, View } from 'react-native';
import { Card } from './Card';
import { styles } from '../styles';

export function SectionTitle({ eyebrow, title, subtitle, actions }) {
  return (
    <Card style={styles.hero}>
      <View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {actions ? <View style={styles.buttonRow}>{actions}</View> : null}
    </Card>
  );
}
