import { Text, View } from 'react-native';
import { Card, SectionTitle, EmptyState } from '../components';
import { precise } from '../utilities';
import { styles } from '../styles';

export function InternReportsScreen({ dashboard }) {
  const weeklySummary = dashboard?.weeklySummary || [];

  return (
    <>
      <SectionTitle eyebrow="Reports" title="Weekly summary" subtitle="Approved hours grouped by week start." />
      <Card>
        {!weeklySummary.length ? (
          <EmptyState title="No approved hours yet" copy="The weekly summary is still empty." />
        ) : (
          <View style={styles.stack}>
            {weeklySummary.map((week) => (
              <View key={week.weekStart} style={styles.summaryRow}>
                <Text style={styles.itemTitle}>{week.weekStart}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{precise(week.hours)} approved hours</Text>
                  <Text style={styles.metaText}>{week.approvedLogs} approved of {week.totalLogs}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    </>
  );
}
