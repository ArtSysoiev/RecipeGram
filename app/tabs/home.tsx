import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Button, Text, useTheme } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

import RecipeCard from '../../components/recipe_card'
import { getAllRecipes } from '../../services/recipe'
import { Recipe } from '../../types'

export default function FeedScreen() {
  const theme = useTheme()
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    const data = await getAllRecipes()
    setRecipes(data)
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            RecipeGram
        </Text>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard 
            recipe={item} 
            
            onPress={() => router.push({
            pathname: "/recipe_details",
            params: { id: item.id }
        })}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
            !loading ? (
                <View style={styles.empty}>
                    <Text variant="headlineSmall" style={{ color: 'gray', fontWeight: 'bold', marginBottom: 10 }}>
                        No recipes yet
                    </Text>
                    <Text style={{ color: 'gray', marginBottom: 20 }}>
                        It's time to cook something!
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => router.push("/tabs/new_recipe")}
                    >
                        Create First Recipe
                    </Button>
                </View>
            ) : null
        }
        refreshing={loading}
        onRefresh={loadData}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 5
  },
  empty: { 
    marginTop: 100, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  }
})