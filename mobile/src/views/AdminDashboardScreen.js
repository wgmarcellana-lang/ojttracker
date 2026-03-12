import { Pressable, Text, View } from 'react-native';
import { Card, EmptyState, LogCard, SectionTitle, StatCard } from '../components';
import { statCards } from '../constants';
import { styles } from '../styles';

export function AdminDashboardScreen({
  dashboard,
  onOpenInterns,
  onOpenSupervisors,
  onOpenReview,
  onOpenLogs,
  onOpenReports,
}) {
  const data = dashboard || {};
  const stats = data.stats || {};
  const values = {
    interns: String(stats.interns || (data.interns || []).length || 0),
    supervisors: String(stats.supervisors || (data.supervisors || []).length || 0),
    pending: String(stats.pending || 0),
    logs: String(stats.logs || 0),
  };

  return (
    <>
      <SectionTitle
        eyebrow="Admin Control"
        title="Operations dashboard"
        subtitle="Manage records, review submitted logs, and inspect reporting from one mobile workspace."
        actions={(
          <>
            <Pressable onPress={onOpenInterns} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Manage interns</Text>
            </Pressable>
            <Pressable onPress={onOpenSupervisors} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Manage supervisors</Text>
            </Pressable>
            <Pressable onPress={onOpenReports} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>Open reports</Text>
            </Pressable>
          </>
        )}
      />

      <View style={styles.statsGrid}>
        {statCards.admin.map(([short, key], index) => (
          <StatCard
            key={key}
            toneStyle={index === 0 ? styles.tonePrimary : index === 1 ? styles.toneDark : index === 2 ? styles.toneWarning : styles.toneSuccess}
            short={short}
            value={values[key]}
            label={key === 'interns' ? 'Intern records' : key === 'supervisors' ? 'Supervisors' : key === 'pending' ? 'Pending approvals' : 'Total logs'}
          />
        ))}
      </View>

      <Card>
        <Text style={styles.panelTitle}>Quick actions</Text>
        <Text style={styles.muted}>Common administrative actions available in the mobile app.</Text>
        <View style={styles.buttonRow}>
          <Pressable onPress={onOpenReview} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Review queue</Text>
          </Pressable>
          <Pressable onPress={onOpenLogs} style={styles.ghostButton}>
            <Text style={styles.ghostButtonText}>All logs</Text>
          </Pressable>
        </View>
      </Card>

      <Card>
        <Text style={styles.panelTitle}>Recent log activity</Text>
        <Text style={styles.muted}>Most recent entries across the system.</Text>
        {!(data.recentLogs || []).length ? (
          <EmptyState title="No recent logs available" />
        ) : (
          <View style={styles.stack}>
            {data.recentLogs.map((log) => <LogCard key={log.id} log={log} />)}
          </View>
        )}
      </Card>
    </>
  );
}
