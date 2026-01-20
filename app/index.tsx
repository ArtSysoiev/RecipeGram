import { useAuth } from "@/context/auth"
import { User } from "@/types"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView, StyleSheet, View
} from "react-native"
import { Button, Text, useTheme } from "react-native-paper"
import AuthInput from "../components/auth_input"
import Logo from "../components/logo"
import { loginUser } from "../services/auth"

export default function LoginScreen() {
  const router = useRouter()
  const theme = useTheme()
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [generalError, setGeneralError] = useState("")

  const [loading, setLoading] = useState(false)

  const { setUser } = useAuth() 

  function validate() {
    let isValid = true
    setUsernameError("")
    setPasswordError("")
    setGeneralError("")

    if (!username) {
      setUsernameError("Username is required")
      isValid = false
    }
    if (!password) {
      setPasswordError("Password is required")
      isValid = false
    }
    return isValid
  }


  async function handleLogin() {
    if (!validate()) return

    setLoading(true)
    const result = await loginUser(username, password)
    setLoading(false)

    if (result.success) {
      setUser((result.user as User)  || null) 
      router.replace("/tabs/home")
    } else {
      setGeneralError(result.error || "Login failed")

      if (result.error === "Invalid credentials") {
        setPassword("")
      }
    }
  }

  return (
     <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.container, 
          { backgroundColor: theme.colors.background }
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        
        <View style={styles.header}>
          <Logo />
          <Text variant="bodyLarge" style={{ color: theme.colors.secondary }}>
            Welcome back!
          </Text>
        </View>
        <View style={styles.form}>
          
          {generalError ? (
              <Text style={{ color: theme.colors.error, textAlign: "center", marginBottom: 10 }}>
                  {generalError}
              </Text>
          ) : null}

          <AuthInput
            label="Username"
            value={username}
            onChangeText={(t) => { setUsername(t); setUsernameError("") }}
            error={usernameError}
            icon="account"
          />
          
          <AuthInput
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); setPasswordError("") }}
            error={passwordError}
            secureTextEntry
            icon="lock"
          />

          <View style={styles.spacer} />

          <Button 
            mode="contained" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.buttonPrimary}
            contentStyle={{ height: 50 }}
          >
            Login
          </Button>

          <Button 
            mode="outlined" 
            onPress={() => router.push("/register")}
            style={[styles.buttonSecondary, { borderColor: theme.colors.primary }]}
            contentStyle={{ height: 50 }}
          >
            Create Account
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  form: {
    width: "100%",
  },
  spacer: {
    height: 10,
  },
  buttonPrimary: {
    marginTop: 10,
    // borderRadius: 12, 
  },
  buttonSecondary: {
    marginTop: 15,
    // borderRadius: 12,
  }
})