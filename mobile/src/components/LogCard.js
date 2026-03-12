import { Pressable, Text, View } from 'react-native';
import { badgeStyle, precise } from '../utilities';
import { styles, ui } from '../styles';

export function LogCard({ log, canEdit, onEdit, onDelete, reviewNode }) {
  const badge = badgeStyle(log.status, ui);

  return (
    <View style={styles.listRow}>
      <View style={styles.rowBetween}>
        <View style={styles.flexOne}>
          <Text style={styles.itemTitle}>{log.intern_name ? `${log.intern_name} - ${log.date}` : log.date}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{log.time_in} - {log.time_out}</Text>
            <Text style={styles.metaText}>{precise(log.hours_worked)} hours</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{log.status}</Text>
        </View>
      </View>

      <Text style={styles.muted}>{log.task_description}</Text>

      {canEdit ? (
        <View style={styles.buttonRow}>
          <Pressable onPress={() => onEdit(log)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Edit</Text>
          </Pressable>
          <Pressable onPress={() => onDelete(log.id)} style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Delete</Text>
          </Pressable>
        </View>
      ) : null}

      {reviewNode || null}
    </View>
  );
}
