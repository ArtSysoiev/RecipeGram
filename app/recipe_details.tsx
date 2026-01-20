import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Dimensions, Image, ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Chip, Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import db from '../database/db'
import { Recipe } from '../types'

const { width } = Dimensions.get('window')
const IMG_HEIGHT = 300

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams()
  const theme = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [ingredients, setIngredients] = useState<any[]>([])
  const [steps, setSteps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadRecipe(Number(id))
  }, [id])

  const loadRecipe = async (recipeId: number) => {
    try {
      const rec = await db.getFirstAsync(
        `SELECT recipes.*, users.username as author_name 
         FROM recipes JOIN users ON recipes.author_id = users.id 
         WHERE recipes.id = ?`, [recipeId]
      )
      setRecipe(rec as Recipe)

      const ings = await db.getAllAsync(
        `SELECT * FROM ingredients WHERE recipe_id = ?`, [recipeId]
      )
      setIngredients(ings)

      const stps = await db.getAllAsync(
        `SELECT steps.*, step_photos.image_path as step_image 
         FROM steps 
         LEFT JOIN step_photos ON steps.id = step_photos.step_id
         WHERE steps.recipe_id = ? ORDER BY step_order ASC`, [recipeId]
      )
      setSteps(stps)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>
  if (!recipe) return <View style={styles.center}><Text>Recipe not found</Text></View>

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
            {recipe.image_path ? (
                <Image source={{ uri: recipe.image_path }} style={styles.image} />
            ) : (
                <View style={[styles.image, styles.placeholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.onSurfaceVariant }}>No image</Text>
                </View>
            )}
            <View style={styles.darkOverlay} />
        </View>

        <Surface style={[styles.sheetContainer, { backgroundColor: theme.colors.background }]} elevation={4}>
            <View style={[styles.handle, { backgroundColor: theme.colors.outline }]} />

            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                {recipe.name}
            </Text>

            <View style={styles.metaRow}>
                <Chip icon="clock-outline" style={styles.chip} textStyle={{ fontSize: 12 }}>{recipe.time}</Chip>
                <Chip icon="account-circle-outline" style={styles.chip} textStyle={{ fontSize: 12 }}>{recipe.author_name}</Chip>
            </View>

            {recipe.description ? (
                <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                    {recipe.description}
                </Text>
            ) : null}

            <Divider style={styles.divider} />

            <Text variant="titleLarge" style={styles.sectionTitle}>Ingredients</Text>
            <Surface style={[styles.cardSurface, { backgroundColor: theme.colors.elevation.level1 }]} elevation={0}>
                {ingredients.map((ing, i) => (
                    <View key={i}>
                        <View style={styles.ingRow}>
                            <Text style={{ fontSize: 16, flex: 1 }}>{ing.name}</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.primary }}>
                                {ing.amount}
                            </Text>
                        </View>
                        {i < ingredients.length - 1 && <Divider style={{ opacity: 0.5 }} />}
                    </View>
                ))}
            </Surface>

            <Text variant="titleLarge" style={styles.sectionTitle}>Instructions</Text>
            <View style={{ gap: 20 }}>
                {steps.map((step, i) => (
                    <View key={i} style={styles.stepContainer}>
                        <View style={styles.stepHeader}>
                            <View style={[styles.stepBadge, { backgroundColor: theme.colors.primary }]}>
                                <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>{i + 1}</Text>
                            </View>
                            {step.name ? <Text variant="titleMedium" style={{ fontWeight: 'bold', flex: 1 }}>{step.name}</Text> : null}
                        </View>
                        
                        <View style={styles.stepContentBorder}>
                            <Text style={{ fontSize: 16, lineHeight: 24, color: theme.colors.onBackground }}>
                                {step.description}
                            </Text>
                            
                            {step.step_image && (
                                <Image source={{ uri: step.step_image }} style={styles.stepImage} />
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </Surface>
      </ScrollView>

      <View style={[styles.backButtonContainer, { top: insets.top + 10 }]}>
         <IconButton 
            icon="arrow-left" 
            mode="contained" 
            containerColor="rgba(0,0,0,0.5)" 
            iconColor="white"
            size={24}
            onPress={() => router.back()}
         />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  imageContainer: {
    height: IMG_HEIGHT,
    width: width,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // Легкое затемнение фото
  },

  // Sheet Content
  sheetContainer: {
    flex: 1,
    marginTop: -30, // Наезжаем на фото
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    minHeight: 500, // Чтобы не прыгало при загрузке
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.5,
  },
  
  // Typography & Meta
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
    height: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  divider: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // Ingredients Card
  cardSurface: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  ingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },

  // Steps
  stepContainer: {
    marginBottom: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepContentBorder: {
    borderLeftWidth: 2, // Линия слева как timeline
    borderLeftColor: 'rgba(128,128,128,0.2)',
    marginLeft: 15,
    paddingLeft: 29, // 15 + 12 (margin) + 2 (border)
    paddingBottom: 10,
  },
  stepImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    resizeMode: 'cover',
  },

  // Floating Button
  backButtonContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  }
})