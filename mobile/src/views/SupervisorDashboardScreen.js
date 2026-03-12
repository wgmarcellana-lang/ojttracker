import { Text, View, Pressable } from 'react-native';
import { Card, SectionTitle, StatCard, EmptyState, LogCard } from '../components';
import { statCards } from '../constants';
import { styles } from '../styles';

export function SupervisorDashboardScreen({ dashboard, onOpenReview, onOpenLogs }) {
  const data = dashboard || {};
  const stats = data.stats || {};
  const isAdmin = !data.supervisor;
  const cards = isAdmin ? statCards.admin : statCards.supervisor;
  const values = {
    interns: String((data.interns || []).length),
    supervisors: String((data.supervisors || []).length),
    pending: String(stats.pending || 0),
    approved: String(stats.approved || 0),
    rejected: String(stats.rejected || 0),
  };

  return (
    <>
      <SectionTitle
        eyebrow={isAdmin ? 'Admin Workspace' : 'Supervisor Workspace'}
        title={data.supervisor?.name || 'Admin Dashboard'}
        subtitle={isAdmin ? 'Overview across interns, supervisors, and submitted logs.' : `${data.supervisor?.department || 'Department'} - ${data.supervisor?.email || 'Email'}`}
        actions={(
          <>
            <Pressable onPress={onOpenReview} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Review pending logs</Text>
            </Pressable>
            <Pressable onPress={onOpenLogs} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>Open all logs</Text>
            </Pressable>
          </>
        )}
      />

      <View style={styles.statsGrid}>
        {cards.map(([short, key], index) => (
          <StatCard
            key={key}
            toneStyle={index === 0 ? styles.tonePrimary : index === 1 ? styles.toneWarning : index === 2 ? styles.toneSuccess : styles.toneDark}
            short={short}
            value={values[key]}
            label={
              key === 'interns'
                ? isAdmin ? 'Total interns' : 'Assigned interns'
                : key === 'supervisors'
                  ? 'Total supervisors'
                  : key === 'pending'
                    ? 'Pending approvals'
                    : key === 'approved'
                      ? 'Approved logs'
                      : 'Rejected logs'
            }
          />
        ))}
      </View>

      <Card>
        <Text style={styles.panelTitle}>Pending reviews</Text>
        <Text style={styles.muted}>Logs that still need supervisor action.</Text>
        {!(data.pendingLogs || []).length ? (
          <EmptyState title="No pending logs right now" />
        ) : (
          <View style={styles.stack}>
            {data.pendingLogs.map((log) => <LogCard key={log.id} log={log} />)}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.panelTitle}>{isAdmin ? 'Intern roster' : 'Assigned interns'}</Text>
        <Text style={styles.muted}>
          {isAdmin ? 'Current interns across the workspace.' : 'Current roster reporting to this supervisor.'}
        </Text>
        <View style={styles.stack}>
          {(data.interns || []).map((intern) => (
            <View key={intern.id} style={styles.summaryRow}>
              <Text style={styles.itemTitle}>{intern.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{intern.school}</Text>
                <Text style={styles.metaText}>{intern.course}</Text>
                <Text style={styles.metaText}>Required: {intern.required_hours} hrs</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </>
  );
}
