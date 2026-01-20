import * as FileSystem from "expo-file-system/legacy"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native"
import {
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Portal,
  Surface,
  Text,
  TextInput,
  useTheme
} from "react-native-paper"
import { useAuth } from "../../context/auth"
import db from "../../database/db"

interface StepItem {
  name: string
  description: string
  image: string | null
}

export default function NewRecipeScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { user } = useAuth()
  
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [time, setTime] = useState("")
  const [mainImage, setMainImage] = useState<string | null>(null)

  const [ingredients, setIngredients] = useState([{ name: "", amount: "" }])
  const [steps, setSteps] = useState<StepItem[]>([])

  const [stepModalVisible, setStepModalVisible] = useState(false)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [tempStep, setTempStep] = useState<StepItem>({ name: "", description: "", image: null })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  async function pickImage(isMain: boolean) {
    if (!status?.granted) {
      const permission = await requestPermission()
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow access to your photos to upload images")
        return
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    })

    if (!result.canceled) {
      const uri = result.assets[0].uri
      if (isMain) {
        setMainImage(uri)
      } else {
        setTempStep(prev => ({ ...prev, image: uri }))
      }
    }
  }

  function addIngredient() {
    return setIngredients([...ingredients, { name: "", amount: "" }])
  }
  
  function updateIngredient(index: number, field: "name" | "amount", text: string) {
    const newIng = [...ingredients]
    newIng[index][field] = text
    setIngredients(newIng)
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  function openStepModal(index?: number) {
    if (index !== undefined) {
      setEditingStepIndex(index)
      setTempStep(steps[index])
    } else {
      setEditingStepIndex(null)
      setTempStep({ name: "", description: "", image: null })
    }
    setStepModalVisible(true)
  }

  function saveStepFromModal() {
    if (!tempStep.name.trim()) {
      Alert.alert("Error", "Step headline is required")
      return
    }

    if (editingStepIndex !== null) {
      const newSteps = [...steps]
      newSteps[editingStepIndex] = tempStep
      setSteps(newSteps)
    } else {
      setSteps([...steps, tempStep])
    }
    setStepModalVisible(false)
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index))
  }

  async function copyImageToAppStorage(uri: string | null) {
    if (!uri) return null
    try {
      const fileName = uri.split("/").pop()
      const newPath = FileSystem.documentDirectory + (fileName || "img.jpg")
      await FileSystem.copyAsync({ from: uri, to: newPath })
      return newPath
    } catch (e) {
      console.log("Image save error", e)
      return null
    }
  }

  function validate() {
    const newErrors: any = {}
    if (!name.trim()) newErrors.name = "Recipe name is missing"
    if (!time.trim()) newErrors.time = "Time is missing"
    if (ingredients.length === 0 || !ingredients[0].name.trim()) newErrors.ingredients = "Add ingredients!"
    if (steps.length === 0) newErrors.steps = "Add at least one step!"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handlePublish() {
    if (!validate()) return
    if (!user) return

    setLoading(true)
    try {
      const savedMainImage = await copyImageToAppStorage(mainImage)

      const result = await db.runAsync(
        `INSERT INTO recipes (name, description, time, author_id, image_path) VALUES (?, ?, ?, ?, ?)`,
        [name, description, time, user.id, savedMainImage]
      )
      const recipeId = result.lastInsertRowId

      for (const ing of ingredients) {
        if (ing.name.trim()) {
          await db.runAsync(
            `INSERT INTO ingredients (recipe_id, name, amount) VALUES (?, ?, ?)`,
            [recipeId, ing.name, ing.amount]
          )
        }
      }

      for (const [index, step] of steps.entries()) {
        const savedStepImage = await copyImageToAppStorage(step.image)

        const stepRes = await db.runAsync(
          `INSERT INTO steps (recipe_id, name, description, step_order) VALUES (?, ?, ?, ?)`,
          [recipeId, step.name, step.description, index + 1]
        )

        if (savedStepImage) {
          await db.runAsync(
            `INSERT INTO step_photos (step_id, image_path) VALUES (?, ?)`,
            [stepRes.lastInsertRowId, savedStepImage]
          )
        }
      }

      Alert.alert("Success", "Recipe published successfully!", [
        { text: "OK", onPress: () => router.replace("/tabs/home") }
      ])

    } catch (e) {
      console.error(e)
      Alert.alert("Error", "Failed to save recipe")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
            New Recipe
          </Text>

          <Card style={styles.sectionCard} mode="contained">
            <TouchableOpacity onPress={() => pickImage(true)} activeOpacity={0.8}>
                {mainImage ? (
                    <Image source={{ uri: mainImage }} style={styles.mainImage} />
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <IconButton icon="camera-plus" size={40} iconColor={theme.colors.primary} />
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>Add Cover Photo</Text>
                    </View>
                )}
                {mainImage && (
                    <View style={styles.editImageBadge}>
                         <IconButton icon="pencil" size={16} iconColor="white" />
                    </View>
                )}
            </TouchableOpacity>
          </Card>

          <Surface style={[styles.sectionCard, { backgroundColor: theme.colors.elevation.level1, padding: 16 }]} elevation={1}>
              <TextInput
                label="Recipe Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                error={!!errors.name}
                style={styles.input}
              />
              
              <TextInput
                label="Time (e.g. 45 min)"
                value={time}
                onChangeText={setTime}
                mode="outlined"
                error={!!errors.time}
                style={styles.input}
                left={<TextInput.Icon icon="clock-outline" />}
              />

              <List.Accordion
                title="Description"
                description={description ? "Click to edit description" : "Optional"}
                expanded={descriptionExpanded}
                onPress={() => setDescriptionExpanded(!descriptionExpanded)}
                left={props => <List.Icon {...props} icon="text-box-outline" />}
                style={{ backgroundColor: 'transparent', paddingLeft: 0}}
              >
                  <TextInput
                    placeholder="Tell us about this dish..."
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={[styles.input, { minHeight: 100, textAlignVertical: 'top', paddingTop: 12, marginTop: 0, paddingStart: 8 }]}
                  />
              </List.Accordion>
          </Surface>

          <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Ingredients</Text>
              {errors.ingredients && <Text style={{ color: theme.colors.error, fontSize: 12 }}>Required</Text>}
          </View>
          
          <Surface style={styles.sectionCard} elevation={1}>
             {ingredients.map((ing, i) => (
                 <View key={i}>
                    <View style={styles.ingredientRow}>
                        <TextInput
                            placeholder="Item"
                            value={ing.name}
                            onChangeText={(t) => updateIngredient(i, "name", t)}
                            style={[styles.inputFlex, { flex: 2 }]}
                            mode="outlined"
                            dense
                        />
                        <TextInput
                            placeholder="Amount"
                            value={ing.amount}
                            onChangeText={(t) => updateIngredient(i, "amount", t)}
                            style={[styles.inputFlex, { flex: 1, marginLeft: 8 }]}
                            mode="outlined"
                            dense
                        />
                        {ingredients.length > 1 && (
                            <IconButton icon="close" size={20} onPress={() => removeIngredient(i)} />
                        )}
                    </View>
                    {i < ingredients.length - 1 && <Divider style={{ marginVertical: 8 }} />}
                 </View>
             ))}
             
             <Button 
                mode="outlined" 
                onPress={addIngredient} 
                style={styles.addButton}
                icon="plus"
             >
                Add Ingredient
             </Button>
          </Surface>


          <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Instructions</Text>
              {errors.steps && <Text style={{ color: theme.colors.error, fontSize: 12 }}>Required</Text>}
          </View>

          <Surface style={styles.sectionCard} elevation={1}>
             {steps.length === 0 && (
                 <Text style={{ textAlign: 'center', padding: 20, color: 'gray' }}>
                     No steps added yet
                 </Text>
             )}

             {steps.map((step, i) => (
                 <TouchableOpacity key={i} onPress={() => openStepModal(i)}>
                    <View style={styles.stepPreviewRow}>
                        <View style={[styles.stepBadge, { backgroundColor: theme.colors.primary }]}>
                            <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>{i + 1}</Text>
                        </View>
                        
                        <View style={{ flex: 1 }}>
                            {step.name ? <Text style={{ fontWeight: 'bold' }}>{step.name}</Text> : null}
                            <Text numberOfLines={2} style={{ color: theme.colors.onSurfaceVariant }}>
                                {step.description ?? "No description"}
                            </Text>
                            {step.image && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <IconButton icon="image" size={12} style={{ margin: 0 }} />
                                    <Text style={{ fontSize: 10, color: theme.colors.primary }}>Has image</Text>
                                </View>
                            )}
                        </View>

                        <IconButton icon="pencil" size={20} onPress={() => openStepModal(i)} />
                        <IconButton icon="delete" size={20} iconColor={theme.colors.error} onPress={() => removeStep(i)} />
                    </View>
                    {i < steps.length - 1 && <Divider />}
                 </TouchableOpacity>
             ))}

             <Button 
                mode="outlined" 
                onPress={() => openStepModal()} 
                style={styles.addButton}
                icon="plus-circle-outline"
             >
                Add Step
             </Button>
          </Surface>

          <Button 
            mode="contained" 
            onPress={handlePublish} 
            loading={loading}
            style={styles.publishBtn}
            contentStyle={{ height: 56 }}
            labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
          >
            Publish Recipe
          </Button>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>


      <Portal>
        <Modal 
            visible={stepModalVisible} 
            onDismiss={() => setStepModalVisible(false)}
            animationType="slide"
            presentationStyle="pageSheet" 
        >
            <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                <View style={styles.modalHeader}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                        {editingStepIndex !== null ? "Edit Step" : "New Step"}
                    </Text>
                    <IconButton icon="close" onPress={() => setStepModalVisible(false)} />
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <TouchableOpacity onPress={() => pickImage(false)} style={styles.stepImagePicker}>
                        {tempStep.image ? (
                            <Image source={{ uri: tempStep.image }} style={styles.stepImage} />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <IconButton icon="camera" size={30} />
                                <Text>Add Step Photo (Optional)</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TextInput
                        label="Headline"
                        placeholder="e.g. Preheat Oven"
                        value={tempStep.name}
                        onChangeText={(t) => setTempStep({ ...tempStep, name: t })}
                        mode="outlined"
                        style={styles.input}
                    />

                    <TextInput
                        label="Instructions"
                        placeholder="Describe what to do..."
                        value={tempStep.description}
                        onChangeText={(t) => setTempStep({ ...tempStep, description: t })}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        style={[styles.input, { minHeight: 100 }]}
                    />

                    <Button 
                        mode="contained" 
                        onPress={saveStepFromModal} 
                        style={{ marginTop: 20 }}
                    >
                        Save Step
                    </Button>
                </ScrollView>
            </View>
        </Modal>
      </Portal>

    </View>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  headerTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 16,
  },
  sectionCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden', 
  },
  mainImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  inputFlex: {
    backgroundColor: 'transparent'
  },
  addButton: {
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  
  stepPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  publishBtn: {
    // borderRadius: 30, 
    marginBottom: 20,
  },

  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  stepImagePicker: {
    height: 200,
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  stepImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  }
})