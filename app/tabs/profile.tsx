import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { Alert, FlatList, StyleSheet, View } from 'react-native'
import { Avatar, Button, Divider, Text, useTheme } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

import RecipeCard from '../../components/recipe_card'
import { useAuth } from '../../context/auth'
import { deleteRecipe, getUserRecipes } from '../../services/recipe'
import { Recipe } from '../../types'

export default function ProfileScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { user, logout } = useAuth() // Берем данные и logout из контекста
  
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  // Загрузка рецептов при открытии вкладки
  const loadMyData = async () => {
    if (!user) return
    setLoading(true)
    const data = await getUserRecipes(user.id)
    setMyRecipes(data)
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      loadMyData()
    }, [user])
  )

  // Логика удаления
  const handleDelete = (recipe: Recipe) => {
    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${recipe.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const success = await deleteRecipe(recipe.id)
            if (success) {
                setMyRecipes(prev => prev.filter(r => r.id !== recipe.id))
            } else {
                Alert.alert("Error", "Could not delete recipe")
            }
          }
        }
      ]
    )
  }

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: logout }
    ])
  }

  if (!user) return null

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* --- Header Профиля --- */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
             {/* Аватарка (можно сделать выбор фото для юзера позже, пока заглушка) */}
             {user.profile_image ? (
                 <Avatar.Image size={80} source={{ uri: user.profile_image }} />
             ) : (
                 <Avatar.Text size={80} label={user.username.substring(0, 2).toUpperCase()} />
             )}
             
             <View style={styles.userText}>
                 <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{user.username}</Text>
                 <Text style={{ color: theme.colors.secondary }}>Master Chef</Text>
             </View>
        </View>

        <Button 
            mode="outlined" 
            textColor={theme.colors.error} 
            style={{ borderColor: theme.colors.error }}
            onPress={handleLogout}
            icon="logout"
        >
            Log Out
        </Button>
      </View>

      <Divider style={{ marginVertical: 10 }} />

      <Text variant="titleLarge" style={styles.sectionTitle}>My Recipes ({myRecipes.length})</Text>

      {/* --- Список рецептов --- */}
      <FlatList
        data={myRecipes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <RecipeCard 
            recipe={item} 
            // Клик -> Детали
            onPress={() => router.push({
                pathname: "/recipe_details",
                params: { id: item.id }
            })}
            // Удаление -> Показываем корзину
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
            !loading ? (
                <View style={styles.empty}>
                    <Text style={{ color: 'gray' }}>You haven't posted any recipes yet.</Text>
                    <Button 
                        mode="text" 
                        onPress={() => router.push("/tabs/new_recipe")}
                        style={{ marginTop: 10 }}
                    >
                        Create one now
                    </Button>
                </View>
            ) : null
        }
        refreshing={loading}
        onRefresh={loadMyData}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  userText: {
    justifyContent: 'center'
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    fontWeight: 'bold',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  }
})