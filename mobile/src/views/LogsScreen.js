import { Pressable, Text, View } from 'react-native';
import { Card, SectionTitle, EmptyState, LogCard } from '../components';
import { styles } from '../styles';

export function LogsScreen({ role, logs, onOpenCreate, onRefresh, onEdit, onDelete }) {
  return (
    <>
      <SectionTitle
        eyebrow="Daily Log Registry"
        title={role === 'supervisor' || role === 'admin' ? 'All logs' : 'Log history'}
        subtitle="Review submitted daily logs and their current approval status."
        actions={(
          <>
            {role === 'intern' ? (
              <Pressable onPress={onOpenCreate} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Add Daily Log</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onRefresh} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>Refresh</Text>
            </Pressable>
          </>
        )}
      />
      <Card>
        {!logs.length ? (
          <EmptyState title="No logs available" />
        ) : (
          <View style={styles.stack}>
            {logs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                canEdit={role === 'intern'}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </View>
        )}
      </Card>
    </>
  );
}
