import { Pressable, Text, View } from 'react-native';
import { Card, EmptyState, SectionTitle, StatCard } from '../components';
import { styles } from '../styles';
import { round } from '../utilities';

export function AdminReportsScreen({ interns, selectedInternId, report, onSelectIntern, onExportCsv }) {
  return (
    <>
      <SectionTitle
        eyebrow="Reports"
        title="Completion and weekly summary"
        subtitle="Inspect internship progress and export the selected report as CSV."
        actions={report ? (
          <Pressable onPress={onExportCsv} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Share CSV</Text>
          </Pressable>
        ) : null}
      />

      <Card>
        <Text style={styles.panelTitle}>Select intern</Text>
        <Text style={styles.muted}>Load a progress report for any intern in the workspace.</Text>
        <View style={styles.chipRow}>
          {interns.map((intern) => (
            <Pressable
              key={intern.id}
              onPress={() => onSelectIntern(intern.id)}
              style={[styles.chip, Number(selectedInternId) === Number(intern.id) && styles.chipActive]}
            >
              <Text style={[styles.chipText, Number(selectedInternId) === Number(intern.id) && styles.chipTextActive]}>
                {intern.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {!report ? (
        <Card>
          <EmptyState title="No report loaded" />
        </Card>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard toneStyle={styles.tonePrimary} short="AP" value={round(report.renderedHours)} label="Approved hours" />
            <StatCard toneStyle={styles.toneWarning} short="RM" value={round(report.remainingHours)} label="Remaining hours" />
            <StatCard toneStyle={styles.toneSuccess} short="CP" value={`${report.completionPercentage}%`} label="Completion rate" />
            <StatCard toneStyle={styles.toneDark} short="ST" value={report.status} label="Current status" />
          </View>

          <Card>
            <Text style={styles.panelTitle}>Intern details</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{report.intern.name}</Text>
              <Text style={styles.metaText}>{report.intern.school}</Text>
              <Text style={styles.metaText}>{report.intern.course}</Text>
              <Text style={styles.metaText}>Required: {report.intern.required_hours} hrs</Text>
            </View>
          </Card>

          <Card>
            <Text style={styles.panelTitle}>Weekly approved summary</Text>
            {!report.weeklySummary.length ? (
              <EmptyState title="No approved weekly hours available" />
            ) : (
              <View style={styles.stack}>
                {report.weeklySummary.map((week) => (
                  <View key={week.weekStart} style={styles.summaryRow}>
                    <Text style={styles.itemTitle}>{week.weekStart}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>{round(week.hours)} hours</Text>
                      <Text style={styles.metaText}>{week.approvedLogs} approved logs</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </>
      )}
    </>
  );
}
