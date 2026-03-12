import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Card } from '../components';
import { tabMap, tabsByRole } from '../constants';
import { styles, ui } from '../styles';

export function WorkspaceShell({ user, activeTab, busy, errorNode, onSelectTab, onSignOut, children }) {
  return (
    <>
      <Card style={styles.sidebar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>OJ</Text>
          </View>
          <Text style={styles.brandTitle}>OJT Tracker</Text>
        </View>

        <View style={styles.navStack}>
          {(tabsByRole[user.role] || []).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => onSelectTab(tab)}
              style={[styles.navLink, activeTab === tab && styles.navLinkActive]}
            >
              <View style={styles.navIcon}>
                <Text style={styles.navIconText}>{tabMap[user.role].find((item) => item.key === tab)?.short}</Text>
              </View>
              <Text style={[styles.navLabel, activeTab === tab && styles.navLabelActive]}>
                {tabMap[user.role].find((item) => item.key === tab)?.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.profileChip}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user.username.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{user.username}</Text>
            <Text style={styles.profileRole}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
          </View>
        </View>

        <Pressable onPress={onSignOut} style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>Sign out</Text>
        </Pressable>
      </Card>

      {busy ? (
        <Card>
          <ActivityIndicator color={ui.primary} />
        </Card>
      ) : null}

      {errorNode}
      {children}
    </>
  );
}
