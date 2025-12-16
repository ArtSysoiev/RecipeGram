import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import React, { useState } from "react"
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"
import { styles } from "./styles"

import { Ingredient, Step } from "../Models"
import MainImagePicker from "./MainImagePicker"
import StepEditorModal from "./StepEditorModal"




export default function NewRecipeTab() {
    const navigation = useNavigation()

    const [name, setName] = useState("")
    const [mainImage, setMainImage] = useState<string | null>(null)
    const [description, setDescription] = useState("")
    const [showDescription, setShowDescription] = useState(false)
    const [time, setTime] = useState("")

    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [steps, setSteps] = useState<Step[]>([])

    const [errors, setErrors] = useState<{ [key: string]: boolean }>({})

    const [isStepModalVisible, setStepModalVisible] = useState(false)
    const [editingStepId, setEditingStepId] = useState<string | null>(null)

    async function pickMainImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        })
        if (!result.canceled) {
            setMainImage(result.assets[0].uri)
        }
    }

    function addIngredient() {
        setIngredients([...ingredients, { id: Date.now().toString(), name: "", amount: "" }])
    }

    function updateIngredient(id: string, field: keyof Ingredient, value: string) {
        setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, [field]: value } : ing))
    }

    function removeIngredient(id: string) {
        setIngredients(prev => prev.filter(ing => ing.id !== id))
    }

    function addStep() {
        setEditingStepId(null)
        setStepModalVisible(true)
    }

    function editStep(id: string) {
        setEditingStepId(id)
        setStepModalVisible(true)
    }

    function saveStep(stepData: Step) {
        if (editingStepId) {
            setSteps(prev => prev.map(s => s.id === editingStepId ? stepData : s))
        } else {
            setSteps([...steps, stepData])
        }
        setStepModalVisible(false)
    }

    function deleteStep(id: string) {
        setSteps(prev => prev.filter(s => s.id !== id))
    }

    const handleSave = () => {
        const newErrors: { [key: string]: boolean } = {}
        let isValid = true
        let alertMessage = ""

        if (!name.trim()) {
            newErrors.name = true
            isValid = false
            alertMessage = "Provide recipe name!"
        }
        if (!time.trim()) {
            newErrors.time = true
            isValid = false
            if (!alertMessage) alertMessage = "Provide estimated time!"
        }

        if (ingredients.length === 0) {
            isValid = false
            if (!alertMessage) alertMessage = "Add at least one ingredient"
        } else {
            const hasEmptyIngredient = ingredients.some(i => !i.name.trim() || !i.amount.trim())
            if (hasEmptyIngredient) {
                isValid = false
                newErrors.ingredients = true
                if (!alertMessage) alertMessage = "Ingredients must have name and amount"
            }
        }

        if (steps.length === 0) {
            isValid = false
            if (!alertMessage) alertMessage = "Add at least one instruction step"
        }

        setErrors(newErrors)

        if (!isValid) {
            Alert.alert("Missing Information", alertMessage)
            return
        }

        const recipeData = {
            id: Date.now(),
            name,
            description,
            time,
            image: mainImage,
            ingredients,
            steps
        }

        console.log("Saving Recipe:", recipeData)

        Alert.alert("Success", "Recipe published!", [
            {
                text: "OK", onPress: () => {
                    setName(""); setMainImage(null); setDescription(""); setShowDescription(false)
                    setTime(""); setIngredients([]); setSteps([]); setErrors({})
                    navigation.navigate("Home" as never)
                }
            }
        ])
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>New Recipe</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <View style={{ flex: 1 }}>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <MainImagePicker imageUri={mainImage} onPickImage={pickMainImage} />

                        <View style={styles.section}>
                            <View style={styles.labelRow}>
                                <Text style={styles.sectionLabel}>Name</Text>
                                <Text style={styles.redStar}>*</Text>
                            </View>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                placeholder="e.g. Grandma's Apple Pie"
                                value={name}
                                onChangeText={(text) => {
                                    setName(text)
                                    if (errors.name) setErrors({ ...errors, name: false })
                                }}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.toggleRow}
                            onPress={() => setShowDescription(!showDescription)}
                        >
                            <Text style={styles.toggleText}>
                                {showDescription ? "Hide Description" : "+ Add Description"}
                            </Text>
                        </TouchableOpacity>

                        {showDescription && (
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your recipe..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top" 
                            />
                        )}

                        <View style={styles.section}>
                            <View style={styles.labelRow}>
                                <Text style={styles.sectionLabel}>Cooking Time</Text>
                                <Text style={styles.redStar}>*</Text>
                            </View>
                            <TextInput
                                style={[styles.input, errors.time && styles.inputError]}
                                placeholder="e.g. 45 mins"
                                value={time}
                                onChangeText={(text) => {
                                    setTime(text)
                                    if (errors.time) setErrors({ ...errors, time: false })
                                }}
                            />
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionLabel}>Ingredients <Text style={styles.redStar}>*</Text></Text>
                            </View>

                            {ingredients.map((ing, index) => (
                                <View key={ing.id} style={styles.ingredientCard}>
                                    <View style={styles.ingredientInputs}>
                                        <TextInput
                                            style={[
                                                styles.cleanInput, 
                                                { flex: 2 },
                                                (errors.ingredients && !ing.name) && styles.textError
                                            ]}
                                            placeholder="Item Name"
                                            value={ing.name}
                                            onChangeText={(text) => updateIngredient(ing.id, "name", text)}
                                        />
                                        <View style={styles.verticalLine} />
                                        <TextInput
                                            style={[
                                                styles.cleanInput, 
                                                { flex: 1 },
                                                (errors.ingredients && !ing.amount) && styles.textError
                                            ]}
                                            placeholder="Amount"
                                            value={ing.amount}
                                            onChangeText={(text) => updateIngredient(ing.id, "amount", text)}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => removeIngredient(ing.id)}
                                        style={styles.deleteIconBtn}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity style={styles.purpleButton} onPress={addIngredient}>
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.purpleButtonText}>Add Ingredient</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionLabel}>Instructions <Text style={styles.redStar}>*</Text></Text>
                            </View>

                            {steps.map((step, index) => (
                                <TouchableOpacity
                                    key={step.id}
                                    style={styles.stepCard}
                                    onPress={() => editStep(step.id)}
                                >
                                    <View style={styles.stepIndexCircle}>
                                        <Text style={styles.stepIndexText}>{index + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.stepName} numberOfLines={1}>{step.name}</Text>
                                        <Text style={styles.stepDesc} numberOfLines={1}>
                                            {step.description || "No details"}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => deleteStep(step.id)}
                                        style={styles.deleteMiniButton}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#ccc" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity style={styles.purpleButton} onPress={addStep}>
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.purpleButtonText}>Add Step</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={styles.bottomFloatContainer}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                            <Text style={styles.primaryButtonText}>SAVE RECIPE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            <StepEditorModal
                visible={isStepModalVisible}
                step={steps.find(s => s.id === editingStepId) || null}
                onCancel={() => setStepModalVisible(false)}
                onSave={saveStep}
            />
        </SafeAreaView>
    )
}

