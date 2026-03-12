import { Pressable, Text, TextInput, View } from 'react-native';
import { Card, SectionTitle } from '../components';
import { styles } from '../styles';

export function LogFormScreen({ editingId, form, onChangeForm, onSave, onBack }) {
  return (
    <>
      <SectionTitle
        eyebrow="Daily Log Form"
        title={editingId ? 'Update daily log' : 'Add daily log'}
        subtitle="Hours are computed automatically from time in, time out, and break deduction."
        actions={(
          <Pressable onPress={onBack} style={styles.ghostButton}>
            <Text style={styles.ghostButtonText}>Back to logs</Text>
          </Pressable>
        )}
      />
      <Card>
        <View style={styles.stack}>
          <View style={styles.field}>
            <Text style={styles.label}>Work date</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={form.date} onChangeText={(value) => onChangeForm('date', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Break hours</Text>
            <TextInput style={styles.input} placeholder="1" value={form.break_hours} keyboardType="decimal-pad" onChangeText={(value) => onChangeForm('break_hours', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Time in</Text>
            <TextInput style={styles.input} placeholder="08:00" value={form.time_in} onChangeText={(value) => onChangeForm('time_in', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Time out</Text>
            <TextInput style={styles.input} placeholder="17:00" value={form.time_out} onChangeText={(value) => onChangeForm('time_out', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Task description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              multiline
              textAlignVertical="top"
              placeholder="Write this like a short work journal entry describing what you did for the day."
              value={form.task_description}
              onChangeText={(value) => onChangeForm('task_description', value)}
            />
            <Text style={styles.muted}>Write this like a short work journal entry describing what you did for the day.</Text>
          </View>
          <View style={styles.buttonRow}>
            <Pressable onPress={onSave} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{editingId ? 'Save log changes' : 'Create log'}</Text>
            </Pressable>
            <Pressable onPress={onBack} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>Back to logs</Text>
            </Pressable>
          </View>
        </View>
      </Card>
    </>
  );
}
