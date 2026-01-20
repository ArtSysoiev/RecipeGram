import { AuthProvider } from '@/context/auth'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { MD3DarkTheme, PaperProvider } from 'react-native-paper'
import { initDatabase } from '../database/db'


const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#002fff',
    onPrimary: '#FFFFFF',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
  },
}

export default function RootLayout() {
  useEffect(() => {
    initDatabase()
  }, [])

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <Stack 
          initialRouteName="index"
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: 'slide_from_right' 
          }}
        >
          <Stack.Screen name="recipe_details" />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  )
}