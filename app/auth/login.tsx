import { useState } from 'react';
import { TextInput } from 'react-native';

import { AppButton } from '@/components/molecule/AppButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { styles } from '@/constants/styles';

type FieldErrors = {
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const fieldErrors = validate(email, password);
    setErrors(fieldErrors);
    setFormError(null);

    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Placeholder for the real auth call — replace with actual sign-in request.
      await new Promise<void>((resolve, reject) =>
        setTimeout(() => reject(new Error('Invalid email or password.')), 600)
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.loginContainer}>
      <ThemedText type="title" style={styles.loginTitle}>
        Sign In
      </ThemedText>

      {formError ? (
        <ThemedView style={styles.loginBanner}>
          <ThemedText style={styles.loginBannerText}>{formError}</ThemedText>
        </ThemedView>
      ) : null}

      <ThemedView style={styles.fieldGroup}>
        <ThemedText style={styles.fieldLabel}>Email</ThemedText>
        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          style={[styles.formTextInput, errors.email && styles.invalidInput]}
          accessibilityLabel="Email"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <ThemedText style={styles.fieldError}>{errors.email}</ThemedText> : null}
      </ThemedView>

      <ThemedView style={styles.fieldGroup}>
        <ThemedText style={styles.fieldLabel}>Password</ThemedText>
        <TextInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Password"
          secureTextEntry
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          style={[styles.formTextInput, errors.password && styles.invalidInput]}
          accessibilityLabel="Password"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
          <ThemedText style={styles.fieldError}>{errors.password}</ThemedText>
        ) : null}
      </ThemedView>

      <AppButton
        title="Sign In"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
      />
    </ThemedView>
  );
}
