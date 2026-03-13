import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './src/styles';
import {
  AdminDashboardScreen,
  AdminInternsScreen,
  AdminReportsScreen,
  AdminSupervisorsScreen,
  LoginScreen,
  WorkspaceShell,
  InternDashboardScreen,
  InternReportsScreen,
  SupervisorDashboardScreen,
  ReviewQueueScreen,
  LogsScreen,
  LogFormScreen,
} from './src/views';
import { useAuth, useWorkspace } from './src/hooks';

export default function App() {
  const auth = useAuth();
  const workspace = useWorkspace();

  useEffect(() => {
    if (auth.token && auth.user) {
      workspace.loadWorkspace(auth.token, auth.user.role);
    }
  }, [auth.token, auth.user?.role]);

  const handleLogin = async () => {
    try {
      await auth.login();
      workspace.setActiveTab('dashboard');
    } catch (error) {
      workspace.resetWorkspace();
      workspace.setActiveTab('dashboard');
    }
  };

  const handleDeleteLog = (id) => {
    Alert.alert('Delete log', 'Are you sure you want to delete this daily log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await workspace.deleteLog(auth.token, id);
            await workspace.loadWorkspace(auth.token, auth.user.role);
          } catch (error) {
            // hook already stores the error state
          }
        },
      },
    ]);
  };

  const handleSaveLog = async () => {
    try {
      await workspace.saveLog(auth.token);
      await workspace.loadWorkspace(auth.token, auth.user.role);
    } catch (error) {
      // hook already stores the error state
    }
  };

  const handleSubmitReview = async (id, action) => {
    try {
      await workspace.submitReview(auth.token, id, action);
      await workspace.loadWorkspace(auth.token, auth.user.role);
    } catch (error) {
      // hook already stores the error state
    }
  };

  const handleSignOut = () => {
    auth.logout();
    workspace.resetWorkspace();
  };

  const handleDeleteIntern = (id) => {
    Alert.alert('Delete intern', 'Are you sure you want to delete this intern account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await workspace.deleteIntern(auth.token, id);
            await workspace.loadWorkspace(auth.token, auth.user.role);
          } catch (error) {
            // hook already stores the error state
          }
        },
      },
    ]);
  };

  const handleDeleteSupervisor = (id) => {
    Alert.alert('Delete supervisor', 'Are you sure you want to delete this supervisor account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await workspace.deleteSupervisor(auth.token, id);
            await workspace.loadWorkspace(auth.token, auth.user.role);
          } catch (error) {
            // hook already stores the error state
          }
        },
      },
    ]);
  };

  const handleSaveIntern = async () => {
    try {
      await workspace.saveIntern(auth.token);
      await workspace.loadWorkspace(auth.token, auth.user.role);
    } catch (error) {
      // hook already stores the error state
    }
  };

  const handleSaveSupervisor = async () => {
    try {
      await workspace.saveSupervisor(auth.token);
      await workspace.loadWorkspace(auth.token, auth.user.role);
    } catch (error) {
      // hook already stores the error state
    }
  };

  const handleExportReport = async () => {
    try {
      const csv = await workspace.exportSelectedReportCsv(auth.token);
      await Share.share({
        title: `ojt-report-${workspace.reportInternId}.csv`,
        message: csv,
      });
    } catch (error) {
      // hook already stores the error state when available
    }
  };

  const handleSelectTab = (tab) => {
    if (tab === 'form') {
      workspace.openCreate();
      return;
    }

    workspace.setActiveTab(tab);
  };

  const renderError = workspace.error ? (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{workspace.error}</Text>
    </View>
  ) : null;

  const renderWorkspaceContent = () => {
    if (auth.user.role === 'admin' && workspace.activeTab === 'dashboard') {
      return (
        <AdminDashboardScreen
          dashboard={workspace.dashboard}
          onOpenInterns={() => workspace.setActiveTab('interns')}
          onOpenSupervisors={() => workspace.setActiveTab('supervisors')}
          onOpenReview={() => workspace.setActiveTab('review')}
          onOpenLogs={() => workspace.setActiveTab('logs')}
          onOpenReports={() => workspace.setActiveTab('reports')}
        />
      );
    }

    if (auth.user.role === 'admin' && workspace.activeTab === 'interns') {
      return (
        <AdminInternsScreen
          interns={workspace.adminInterns}
          supervisors={workspace.adminSupervisors}
          selectedIntern={workspace.selectedIntern}
          selectedInternLogs={workspace.selectedInternLogs}
          selectedInternReport={workspace.selectedInternReport}
          onOpenReports={() => {
            workspace.setActiveTab('reports');
            if (workspace.selectedIntern?.id) {
              workspace.loadSelectedReport(auth.token, workspace.selectedIntern.id);
            }
          }}
          internForm={workspace.internForm}
          onChangeInternForm={(key, value) => workspace.setInternForm((current) => ({ ...current, [key]: value }))}
          onPickSupervisor={(value) => workspace.setInternForm((current) => ({ ...current, supervisor_id: value }))}
          onSelectIntern={(id) => workspace.loadInternDetail(auth.token, id)}
          onStartCreate={workspace.startCreateIntern}
          onSaveIntern={handleSaveIntern}
          onDeleteIntern={handleDeleteIntern}
          busy={workspace.busy}
        />
      );
    }

    if (auth.user.role === 'admin' && workspace.activeTab === 'supervisors') {
      return (
        <AdminSupervisorsScreen
          supervisors={workspace.adminSupervisors}
          selectedSupervisor={workspace.selectedSupervisor}
          supervisorForm={workspace.supervisorForm}
          onChangeSupervisorForm={(key, value) => workspace.setSupervisorForm((current) => ({ ...current, [key]: value }))}
          onSelectSupervisor={(id) => workspace.loadSupervisorDetail(auth.token, id)}
          onStartCreate={workspace.startCreateSupervisor}
          onSaveSupervisor={handleSaveSupervisor}
          onDeleteSupervisor={handleDeleteSupervisor}
          busy={workspace.busy}
        />
      );
    }

    if (auth.user.role === 'admin' && workspace.activeTab === 'reports') {
      return (
        <AdminReportsScreen
          interns={workspace.adminInterns}
          selectedInternId={workspace.reportInternId}
          report={workspace.report}
          onSelectIntern={(id) => workspace.loadSelectedReport(auth.token, id)}
          onExportCsv={handleExportReport}
        />
      );
    }

    if (auth.user.role === 'intern' && workspace.activeTab === 'dashboard') {
      return (
        <InternDashboardScreen
          dashboard={workspace.dashboard}
          onOpenCreate={workspace.openCreate}
          onOpenReports={() => workspace.setActiveTab('reports')}
        />
      );
    }

    if (auth.user.role === 'intern' && workspace.activeTab === 'reports') {
      return <InternReportsScreen dashboard={workspace.dashboard} />;
    }

    if (auth.user.role === 'supervisor' && workspace.activeTab === 'dashboard') {
      return (
        <SupervisorDashboardScreen
          dashboard={workspace.dashboard}
          onOpenReview={() => workspace.setActiveTab('review')}
          onOpenLogs={() => workspace.setActiveTab('logs')}
        />
      );
    }

    if ((auth.user.role === 'supervisor' || auth.user.role === 'admin') && workspace.activeTab === 'review') {
      return (
        <ReviewQueueScreen
          logs={workspace.reviewLogs}
          reviewNotes={workspace.reviewNotes}
          onChangeReviewNote={(id, value) => workspace.setReviewNotes((current) => ({ ...current, [id]: value }))}
          onSubmitReview={handleSubmitReview}
        />
      );
    }

    if (auth.user.role === 'intern' && workspace.activeTab === 'form') {
      return (
        <LogFormScreen
          editingId={workspace.editingId}
          form={workspace.form}
          onChangeForm={(key, value) => workspace.setForm((current) => ({ ...current, [key]: value }))}
          onSave={handleSaveLog}
          onBack={() => workspace.setActiveTab('logs')}
        />
      );
    }

    return (
      <LogsScreen
        role={auth.user.role}
        logs={workspace.logs}
        onOpenCreate={workspace.openCreate}
        onRefresh={() => workspace.loadWorkspace(auth.token, auth.user.role)}
        onEdit={workspace.openEdit}
        onDelete={handleDeleteLog}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.scroll}>
          {!auth.user ? (
            <LoginScreen
              busy={workspace.busy}
              errorNode={renderError}
              loginForm={auth.loginForm}
              onChangeLoginForm={auth.updateLoginForm}
              onSubmit={handleLogin}
            />
          ) : (
            <WorkspaceShell
              user={auth.user}
              activeTab={workspace.activeTab}
              busy={workspace.busy}
              errorNode={renderError}
              onSelectTab={handleSelectTab}
              onSignOut={handleSignOut}
            >
              {renderWorkspaceContent()}
            </WorkspaceShell>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
