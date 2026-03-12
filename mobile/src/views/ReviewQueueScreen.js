import { Pressable, Text, TextInput, View } from 'react-native';
import { Card, SectionTitle, EmptyState, LogCard } from '../components';
import { styles } from '../styles';

export function ReviewQueueScreen({ logs, reviewNotes, onChangeReviewNote, onSubmitReview }) {
  return (
    <>
      <SectionTitle
        eyebrow="Supervisor Queue"
        title="Review submitted logs"
        subtitle="Approve only the entries that should count toward required internship hours."
      />
      <Card>
        {!logs.length ? (
          <EmptyState title="No logs available for review" />
        ) : (
          <View style={styles.stack}>
            {logs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                reviewNode={(
                  <View style={styles.stack}>
                    <TextInput
                      placeholder="Optional note"
                      style={styles.input}
                      value={reviewNotes[log.id] || ''}
                      onChangeText={(value) => onChangeReviewNote(log.id, value)}
                    />
                    <View style={styles.buttonRow}>
                      <Pressable onPress={() => onSubmitReview(log.id, 'approve')} style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Approve</Text>
                      </Pressable>
                      <Pressable onPress={() => onSubmitReview(log.id, 'reject')} style={styles.dangerButton}>
                        <Text style={styles.dangerButtonText}>Reject</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            ))}
          </View>
        )}
      </Card>
    </>
  );
}
