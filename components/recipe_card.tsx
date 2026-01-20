import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Avatar, Card, Chip, IconButton, Text, useTheme } from 'react-native-paper'
import { Recipe } from '../types'

interface Props {
  recipe: Recipe
  onPress: () => void
  onDelete?: () => void
}

export default function RecipeCard({ recipe, onPress, onDelete }: Props) {
  const theme = useTheme()

  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Title
        title={recipe.name}
        subtitle={`by ${recipe.author_name}`}
        titleVariant="titleLarge"
        titleStyle={{ fontWeight: 'bold' }}
        left={(props) => <Avatar.Icon {...props} icon="account" size={40} />}
        right={(props) => onDelete && (
            <IconButton 
                {...props} 
                icon="delete" 
                iconColor={theme.colors.error} 
                onPress={onDelete} 
            />
        )}
      />

      {recipe.image_path ? (
        <Card.Cover source={{ uri: recipe.image_path }} style={styles.image} />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: theme.colors.surfaceVariant }]}>
            <IconButton icon="image-off-outline" size={30} />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>No Image</Text>
        </View>
      )}

      <Card.Content style={styles.content}>
        <View style={styles.infoRow}>
            <Chip icon="clock-outline" style={styles.chip} compact>{recipe.time}</Chip>
            
            <Chip icon="food-apple-outline" style={styles.chip} compact>
                {recipe.ingredients_count} ing.
            </Chip>
            
            <Chip icon="format-list-numbered" style={styles.chip} compact>
                {recipe.steps_count} steps
            </Chip>
        </View>
        
        {recipe.description ? (
            <Text numberOfLines={2} variant="bodyMedium" style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>
                {recipe.description}
            </Text>
        ) : null}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  image: {
    height: 200,
    borderRadius: 0,
  },
  placeholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128, 0.2)',
    height: 32
  }
})