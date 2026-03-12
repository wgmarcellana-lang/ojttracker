import { Pressable, Text, TextInput, View } from 'react-native';
import { Card, EmptyState, SectionTitle } from '../components';
import { styles } from '../styles';

export function AdminSupervisorsScreen({
  supervisors,
  selectedSupervisor,
  supervisorForm,
  onChangeSupervisorForm,
  onSelectSupervisor,
  onStartCreate,
  onSaveSupervisor,
  onDeleteSupervisor,
  busy,
}) {
  return (
    <>
      <SectionTitle
        eyebrow="Admin Records"
        title="Manage supervisors"
        subtitle="Create, update, and remove supervisor accounts used for intern assignments and reviews."
        actions={(
          <>
            <Pressable onPress={onStartCreate} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Add supervisor</Text>
            </Pressable>
            {selectedSupervisor ? (
              <Pressable onPress={() => onDeleteSupervisor(selectedSupervisor.id)} style={styles.dangerButton}>
                <Text style={styles.dangerButtonText}>Delete</Text>
              </Pressable>
            ) : null}
          </>
        )}
      />

      <Card>
        <Text style={styles.panelTitle}>{selectedSupervisor ? 'Edit supervisor' : 'New supervisor'}</Text>
        <View style={styles.stack}>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={supervisorForm.name} onChangeText={(value) => onChangeSupervisorForm('name', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={supervisorForm.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(value) => onChangeSupervisorForm('email', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Department</Text>
            <TextInput style={styles.input} value={supervisorForm.department} onChangeText={(value) => onChangeSupervisorForm('department', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={supervisorForm.username} autoCapitalize="none" autoCorrect={false} onChangeText={(value) => onChangeSupervisorForm('username', value)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={supervisorForm.password}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              onChangeText={(value) => onChangeSupervisorForm('password', value)}
            />
          </View>
          <Pressable onPress={onSaveSupervisor} style={styles.primaryButton} disabled={busy}>
            <Text style={styles.primaryButtonText}>{selectedSupervisor ? 'Save supervisor' : 'Create supervisor'}</Text>
          </Pressable>
        </View>
      </Card>

      <Card>
        <Text style={styles.panelTitle}>Supervisor list</Text>
        <Text style={styles.muted}>Tap a supervisor to load the record into the form.</Text>
        {!supervisors.length ? (
          <EmptyState title="No supervisors available" />
        ) : (
          <View style={styles.stack}>
            {supervisors.map((supervisor) => (
              <Pressable key={supervisor.id} onPress={() => onSelectSupervisor(supervisor.id)} style={styles.summaryRow}>
                <View style={styles.rowBetween}>
                  <View style={styles.flexOne}>
                    <Text style={styles.itemTitle}>{supervisor.name}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>{supervisor.username || 'No account'}</Text>
                      <Text style={styles.metaText}>{supervisor.email}</Text>
                      <Text style={styles.metaText}>{supervisor.department}</Text>
                    </View>
                  </View>
                  <Text style={styles.metaText}>{supervisor.intern_count} interns</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      {selectedSupervisor ? (
        <Card>
          <Text style={styles.panelTitle}>Supervisor details</Text>
          <Text style={styles.muted}>Current account and assignment summary.</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Username: {selectedSupervisor.username || 'No account'}</Text>
            <Text style={styles.metaText}>Email: {selectedSupervisor.email}</Text>
            <Text style={styles.metaText}>Department: {selectedSupervisor.department}</Text>
            <Text style={styles.metaText}>Assigned interns: {selectedSupervisor.intern_count}</Text>
          </View>
        </Card>
      ) : null}
    </>
  );
}
