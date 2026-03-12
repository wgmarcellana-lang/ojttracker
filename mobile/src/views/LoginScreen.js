import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Card } from '../components';
import { styles, ui } from '../styles';

export function LoginScreen({ busy, errorNode, loginForm, onChangeLoginForm, onSubmit }) {
  return (
    <>
      <Card style={styles.loginShowcase}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>OJ</Text>
          </View>
          <Text style={styles.brandTitleOnDark}>OJT Tracker</Text>
        </View>
        <Text style={styles.eyebrowDark}>Hours Visibility</Text>
        <Text style={styles.heroTitle}>Track the internship journey with one clean approval flow.</Text>
        <Text style={styles.heroCopy}>
          Daily logs, supervisor review, and completion reports live in the same workspace so progress is visible
          without extra task management screens or spreadsheets.
        </Text>
      </Card>

      <Card>
        <Text style={styles.eyebrow}>Welcome Back</Text>
        <Text style={styles.pageTitle}>Sign in to the tracker</Text>
        <Text style={styles.pageSubtitle}>Sign in to continue.</Text>
        {errorNode}
        <View style={styles.stack}>
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={loginForm.username}
              onChangeText={(value) => onChangeLoginForm('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={loginForm.password}
              onChangeText={(value) => onChangeLoginForm('password', value)}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>
          <Pressable onPress={onSubmit} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </Pressable>
          {busy ? <ActivityIndicator color={ui.primary} /> : null}
        </View>
      </Card>
    </>
  );
}
