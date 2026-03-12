import { Pressable, Text, View } from 'react-native';
import { Card, SectionTitle, StatCard, EmptyState, LogCard } from '../components';
import { statCards } from '../constants';
import { round } from '../utilities';
import { styles } from '../styles';

export function InternDashboardScreen({ dashboard, onOpenCreate, onOpenReports }) {
  const data = dashboard || {};
  const recentLogs = data.recentLogs || [];
  const statValues = {
    approvedHours: round(data.renderedHours),
    remainingHours: round(data.remainingHours),
    totalHours: round(data.totalHours),
    pendingCount: String(data.pendingCount || 0),
  };

  return (
    <>
      <SectionTitle
        eyebrow="Intern Workspace"
        title={data.intern?.name || 'Intern Dashboard'}
        subtitle={`Progress against ${data.intern?.required_hours || 0} required internship hours.`}
        actions={(
          <>
            <Pressable onPress={onOpenCreate} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Add Daily Log</Text>
            </Pressable>
            <Pressable onPress={onOpenReports} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>Open Report</Text>
            </Pressable>
          </>
        )}
      />

      <View style={styles.statsGrid}>
        {statCards.intern.map(([short, key], index) => (
          <StatCard
            key={key}
            toneStyle={index === 0 ? styles.tonePrimary : index === 1 ? styles.toneWarning : index === 2 ? styles.toneDark : styles.toneSuccess}
            short={short}
            value={statValues[key]}
            label={key === 'approvedHours' ? 'Approved hours' : key === 'remainingHours' ? 'Remaining hours' : key === 'totalHours' ? 'Total logged hours' : 'Pending submissions'}
          />
        ))}
      </View>

      <Card>
        <Text style={styles.panelTitle}>Target progress</Text>
        <Text style={styles.muted}>Approved logs are the only entries counted here.</Text>
        <View style={styles.metricRing}>
          <View style={styles.metricRingInner}>
            <Text style={styles.metricValue}>{data.completionPercentage || 0}%</Text>
            <Text style={styles.muted}>Complete</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Required: {data.intern?.required_hours || 0} hrs</Text>
          <Text style={styles.metaText}>Supervisor: {data.intern?.supervisor_name || 'Unassigned'}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.panelTitle}>Recent activity</Text>
        <Text style={styles.muted}>Most recent submissions and their current review status.</Text>
        {!recentLogs.length ? (
          <EmptyState title="No log entries yet" copy="Start with your first daily log." />
        ) : (
          <View style={styles.stack}>
            {recentLogs.map((log) => <LogCard key={log.id} log={log} />)}
          </View>
        )}
      </Card>
    </>
  );
}
