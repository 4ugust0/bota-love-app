import { BotaLoveColors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface BotaInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function BotaInput({
  label,
  error,
  containerStyle,
  style,
  ...props
}: BotaInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={BotaLoveColors.neutralMedium}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BotaLoveColors.neutralLight,
    borderWidth: 1,
    borderColor: BotaLoveColors.neutralMedium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
  },
  inputError: {
    borderColor: BotaLoveColors.error,
  },
  errorText: {
    fontSize: 12,
    color: BotaLoveColors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});
