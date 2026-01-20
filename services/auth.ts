import db from '../database/db'
// Используем legacy, чтобы работало копирование файлов
import * as FileSystem from 'expo-file-system/legacy'

// Вспомогательная функция сохранения фото
const saveProfileImage = async (uri: string | undefined | null) => {
  if (!uri) return null
  try {
    const fileName = uri.split('/').pop()
    const newPath = FileSystem.documentDirectory + (fileName || 'profile.jpg')
    await FileSystem.copyAsync({ from: uri, to: newPath })
    return newPath
  } catch (error) {
    console.error('Error saving profile image:', error)
    return null
  }
}

// Регистрация пользователя (теперь с картинкой)
export const registerUser = async (username: string, password: string, imageUri: string | null = null) => {
  try {
    if (!username || !password) {
      return { success: false, error: 'Username and password are required' }
    }

    // 1. Проверяем дубликаты
    const existingCheck = await db.getFirstAsync(
      'SELECT id FROM users WHERE lower(username) = lower(?)',
      [username]
    )

    if (existingCheck) {
      return { success: false, error: 'User already exists' }
    }

    // 2. Сохраняем картинку (если есть)
    const savedImagePath = await saveProfileImage(imageUri)

    // 3. Создаем пользователя
    const result = await db.runAsync(
      'INSERT INTO users (username, password, profile_image) VALUES (?, ?, ?)',
      [username, password, savedImagePath]
    )

    return { success: true, userId: result.lastInsertRowId }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Database error' }
  }
}

// Вход пользователя
export const loginUser = async (username: string, password: string) => {
  try {
    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE lower(username) = lower(?) AND password = ?',
      [username, password]
    )

    if (user) {
      return { success: true, user }
    }
    return { success: false, error: 'Invalid credentials' }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Login failed' }
  }
}