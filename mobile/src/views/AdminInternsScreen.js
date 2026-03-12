import { Pressable, Text, TextInput, View } from 'react-native';
import { Card, EmptyState, LogCard, SectionTitle } from '../components';
import { round } from '../utilities';
import { styles } from '../styles';

export function AdminInternsScreen({
  interns,
  supervisors,
  selectedIntern,
  selectedInternLogs,
  selectedInternReport,
  onOpenReports,
  internForm,
  onChangeInternForm,
  onPickSupervisor,
  onSelectIntern,
  onStartCreate,
  onSaveIntern,
  onDeleteIntern,
  busy,
}) {
  return (
    <>
      <SectionTitle
        eyebrow="Admin Records"
        title="Manage interns"
        subtitle="Create, inspect, update, and remove internship records."
        actions={(
          <>
            <Pressable onPress={onStartCreate} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Add intern</Text>
            </Pressable>
            {selectedIntern ? (
              <Pressable onPress={() => onDeleteIntern(selectedIntern.id)} style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Delete</Text>
              </Pressable>
            ) : null}
          </>
        )}
      />

      <Card>
        <Text style={styles.panelTitle}>{selectedIntern ? 'Edit intern' : 'New intern'}</Text>
        <Text style={styles.muted}>Account credentials are required for login access.</Text>
        <View style={styles.stack}>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={internForm.name} onChangeText={(value) => onChangeInternForm('name', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>School</Text>
            <TextInput style={styles.input} value={internForm.school} onChangeText={(value) => onChangeInternForm('school', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Course</Text>
            <TextInput style={styles.input} value={internForm.course} onChangeText={(value) => onChangeInternForm('course', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Required hours</Text>
            <TextInput style={styles.input} value={internForm.required_hours} keyboardType="numeric" onChangeText={(value) => onChangeInternForm('required_hours', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Start date</Text>
            <TextInput style={styles.input} value={internForm.start_date} placeholder="YYYY-MM-DD" onChangeText={(value) => onChangeInternForm('start_date', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={internForm.username} autoCapitalize="none" autoCorrect={false} onChangeText={(value) => onChangeInternForm('username', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={internForm.password}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              onChangeText={(value) => onChangeInternForm('password', value)}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Supervisor</Text>
            <View style={styles.chipRow}>
              <Pressable
                onPress={() => onPickSupervisor('')}
                style={[styles.chip, !internForm.supervisor_id && styles.chipActive]}
              >
                <Text style={[styles.chipText, !internForm.supervisor_id && styles.chipTextActive]}>Unassigned</Text>
              </Pressable>
              {supervisors.map((supervisor) => (
                <Pressable
                  key={supervisor.id}
                  onPress={() => onPickSupervisor(String(supervisor.id))}
                  style={[styles.chip, String(internForm.supervisor_id) === String(supervisor.id) && styles.chipActive]}
                >
                  <Text style={[styles.chipText, String(internForm.supervisor_id) === String(supervisor.id) && styles.chipTextActive]}>
                    {supervisor.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable onPress={onSaveIntern} style={styles.primaryButton} disabled={busy}>
            <Text style={styles.primaryButtonText}>{selectedIntern ? 'Save intern' : 'Create intern'}</Text>
          </Pressable>
        </View>
      </Card>

      <Card>
        <Text style={styles.panelTitle}>Intern directory</Text>
        <Text style={styles.muted}>Tap a record to inspect progress and load it into the form.</Text>
        {!interns.length ? (
          <EmptyState title="No interns available" />
        ) : (
          <View style={styles.stack}>
            {interns.map((intern) => (
              <Pressable key={intern.id} onPress={() => onSelectIntern(intern.id)} style={styles.summaryRow}>
                <View style={styles.rowBetween}>
                  <View style={styles.flexOne}>
                    <Text style={styles.itemTitle}>{intern.name}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>{intern.username || 'No account'}</Text>
                      <Text style={styles.metaText}>{intern.school}</Text>
                      <Text style={styles.metaText}>{intern.course}</Text>
                    </View>
                  </View>
                  <Text style={styles.metaText}>{round(intern.approved_hours)} hrs</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      {selectedIntern ? (
        <Card>
          <Text style={styles.panelTitle}>Intern details</Text>
          <Text style={styles.muted}>
            {selectedIntern.school} - {selectedIntern.course}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Username: {selectedIntern.username || 'No account'}</Text>
            <Text style={styles.metaText}>Required: {selectedIntern.required_hours} hrs</Text>
            <Text style={styles.metaText}>Start: {selectedIntern.start_date}</Text>
            <Text style={styles.metaText}>Supervisor: {selectedIntern.supervisor_name || 'Unassigned'}</Text>
            {selectedInternReport ? <Text style={styles.metaText}>Complete: {selectedInternReport.completionPercentage}%</Text> : null}
          </View>
          <View style={styles.buttonRow}>
            <Pressable onPress={onOpenReports} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>Open report</Text>
            </Pressable>
          </View>
          <View style={styles.divider} />
          {selectedInternReport ? (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.eyebrow}>Approved</Text>
                <Text style={styles.statValue}>{round(selectedInternReport.renderedHours)}</Text>
                <Text style={styles.statLabel}>Approved hours</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.eyebrow}>Remain</Text>
                <Text style={styles.statValue}>{round(selectedInternReport.remainingHours)}</Text>
                <Text style={styles.statLabel}>Remaining hours</Text>
              </View>
            </View>
          ) : null}
          <Text style={styles.panelTitle}>Log history</Text>
          <Text style={styles.muted}>All submissions attached to this intern record.</Text>
          {selectedInternLogs.length ? (
            <View style={styles.stack}>
              {selectedInternLogs.map((log) => <LogCard key={log.id} log={log} />)}
            </View>
          ) : (
            <EmptyState title="No logs for this intern yet" />
          )}
        </Card>
      ) : null}
    </>
  );
}
