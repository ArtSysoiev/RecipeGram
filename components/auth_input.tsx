import React from 'react'
import { StyleSheet, View } from 'react-native'
import { HelperText, TextInput, useTheme } from 'react-native-paper'

interface AuthInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  error?: string
  secureTextEntry?: boolean
  icon: string
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}

export default function AuthInput({ 
  label, 
  value, 
  onChangeText, 
  error, 
  secureTextEntry, 
  icon,
  autoCapitalize = 'none' 
}: AuthInputProps) {
  const theme = useTheme()

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        error={!!error} 
        style={styles.input}
        left={<TextInput.Icon icon={icon} color={error ? theme.colors.error : undefined} />}
        theme={{ roundness: 12 }}
      />
      
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: -15,
  },
  input: {
    backgroundColor: undefined,
  }
})