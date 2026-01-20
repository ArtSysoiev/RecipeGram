import * as ImagePicker from "expo-image-picker"; // Импорт пикера
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";

import AuthInput from "../components/auth_input";
import { registerUser } from "../services/auth";

export default function RegisterScreen() {
  const router = useRouter()
  const theme = useTheme()

  // Хук для прав доступа
  const [permission, requestPermission] = ImagePicker.useMediaLibraryPermissions()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [image, setImage] = useState<string | null>(null) // Стейт для аватарки
  
  const [errors, setErrors] = useState({ username: "", password: "", confirm: "" })
  const [loading, setLoading] = useState(false)

  // Функция выбора фото
  const pickImage = async () => {
    // 1. Проверяем права
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        Alert.alert("Permission required", "We need access to your gallery to set a profile picture.")
        return
      }
    }

    // 2. Открываем галерею
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Квадратная обрезка для аватарки
      quality: 0.5,   // Сжимаем, чтобы не занимать много места
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  function validate() {
    let isValid = true
    let newErrors = { username: "", password: "", confirm: "" }

    if (!username) { 
      newErrors.username = "Username is required"
      isValid = false
    } 
    if (!password) { 
      newErrors.password = "Password is required"
      isValid = false
    } 
    if (password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  async function handleRegister() {
    if (!validate()) return

    setLoading(true)
    // Передаем image в функцию регистрации
    const result = await registerUser(username, password, image)
    setLoading(false)

    if (result.success) {
      Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.back() }
      ])
    } else {
      if (result.error === "User already exists") {
        setErrors(prev => ({ ...prev, username: "This username is already taken" }))
      } else {
        Alert.alert("Error", result.error)
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
        keyboardShouldPersistTaps="handled"
      >
        
        <View style={styles.header}>
          {/* Вместо Логотипа используем выбор аватарки */}
          <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: "bold", marginBottom: 20 }}>
            Create Account
          </Text>

          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {image ? (
                <Image source={{ uri: image }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatarPlaceholder, { borderColor: theme.colors.outline }]}>
                    <IconButton icon="camera-plus" size={30} iconColor={theme.colors.secondary} />
                </View>
            )}
            
            {/* Маленький плюсик для индикации действия */}
            <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
                <IconButton icon="pencil" size={14} iconColor="white" style={{ margin: 0 }} />
            </View>
          </TouchableOpacity>

          <Text style={{ color: theme.colors.secondary, marginTop: 10 }}>
            Add a profile photo
          </Text>
        </View>

        <View style={styles.form}>
          
          <AuthInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            icon="account-plus"
          />

          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            icon="lock"
          />

          <AuthInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirm}
            secureTextEntry
            icon="lock-check"
          />

          <View style={styles.spacer} />

          <Button 
            mode="contained" 
            onPress={handleRegister} 
            loading={loading}
            style={styles.buttonPrimary}
            contentStyle={{ height: 50 }}
          >
            Sign Up
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => router.back()}
            style={[styles.buttonSecondary, { borderColor: theme.colors.primary }]}
            contentStyle={{ height: 50 }}
          >
            Back to login
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
    marginBottom: 30,
  },
  
  // Стили для аватарки
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  spacer: {
    height: 10,
  },
  form: {
    width: "100%",
  },
  buttonPrimary: {
    marginTop: 10,
    borderRadius: 12,
  },
  buttonSecondary: {
    marginTop: 15,
    borderRadius: 12,
  }
})