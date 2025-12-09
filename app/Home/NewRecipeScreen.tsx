import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import React, { useEffect, useState } from "react"
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"

interface Ingredient {
    id: string
    name: string
    amount: string
}

interface Step {
    id: string
    name: string
    description: string
    imageUri: string | null
}

// --- SUBCOMPONENTS ---

const MainImagePicker = ({ imageUri, onPickImage }: { imageUri: string | null, onPickImage: () => void }) => {
    return (
        <TouchableOpacity onPress={onPickImage} style={styles.imagePickerContainer}>
            {imageUri ? (
                <>
                    <Image source={{ uri: imageUri }} style={styles.mainImage} />
                    <View style={styles.cameraIconOverlay}>
                        <Ionicons name="camera" size={24} color="white" />
                    </View>
                </>
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#2326f7" />
                    <Text style={styles.imagePlaceholderText}>Add Cover Photo</Text>
                </View>
            )}
        </TouchableOpacity>
    )
}

const StepEditorModal = ({
    visible,
    step,
    onSave,
    onCancel,
}: {
    visible: boolean
    step: Step | null
    onSave: (step: Step) => void
    onCancel: () => void
}) => {
    const [name, setName] = useState(step?.name || "")
    const [description, setDescription] = useState(step?.description || "")
    const [imageUri, setImageUri] = useState<string | null>(step?.imageUri || null)
    const [error, setError] = useState("")

    useEffect(() => {
        if (step) {
            setName(step.name)
            setDescription(step.description)
            setImageUri(step.imageUri)
            setError("")
        } else {
            setName("")
            setDescription("")
            setImageUri(null)
        }
    }, [step, visible])

    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })
        if (!result.canceled) {
            setImageUri(result.assets[0].uri)
        }
    }

    function handleDone() {
        if (!name.trim()) {
            setError("Step headline is required")
            return
        }
        onSave({ id: step?.id || Date.now().toString(), name, description, imageUri })
    }

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Edit Step</Text>
                    <TouchableOpacity onPress={onCancel}>
                        <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.modalContent}>
                    <Text style={styles.sectionLabel}>Headline <Text style={styles.redStar}>*</Text></Text>
                    <TextInput
                        style={[styles.input, error ? styles.inputError : null]}
                        placeholder="e.g. Preheat Oven"
                        value={name}
                        onChangeText={setName}
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Text style={styles.sectionLabel}>Instructions</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Detailed instructions..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top" // Fixed text align
                    />

                    <Text style={styles.sectionLabel}>Photo (Optional)</Text>
                    <TouchableOpacity onPress={pickImage} style={styles.stepImagePicker}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.stepImage} />
                        ) : (
                            <View style={styles.stepImagePlaceholder}>
                                <Ionicons name="add" size={30} color="#6a0dad" />
                                <Text style={{ color: "#6a0dad" }}>Add Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </ScrollView>
                
                {/* Modal Save Button at Bottom */}
                <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
                        <Text style={styles.primaryButtonText}>SAVE STEP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}


// --- MAIN SCREEN ---

export default function NewRecipeScreen() {
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
                    // Reset Logic
                    setName(""); setMainImage(null); setDescription(""); setShowDescription(false)
                    setTime(""); setIngredients([]); setSteps([]); setErrors({})
                    navigation.navigate("Home" as never)
                }
            }
        ])
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ANDROID STYLE HEADER: Just Title, no buttons */}
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

                        {/* Description Section */}
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
                                textAlignVertical="top" // Fixed: Starts at top
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

                        {/* Ingredients Section */}
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

                        {/* Steps Section */}
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

                        {/* Spacer for bottom button */}
                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* FLOATING BOTTOM BUTTON (Android Style) */}
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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F7FA", // Light grey background for contrast
        paddingTop: Platform.OS === "android" ? 40 : 0
    },
    // Header
    headerBar: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#fff",
        elevation: 2, // Android shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 10
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2326f7",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Ensure content isn't hidden behind floating button
    },
    // Inputs & Sections
    section: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: "row",
        marginBottom: 8
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    sectionHeaderRow: {
        flexDirection: "row", 
        justifyContent: "space-between", 
        marginBottom: 10
    },
    redStar: {
        color: "red",
        fontWeight: "bold",
        marginLeft: 4
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 8, // Square off slightly
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        elevation: 1, // Slight lift
    },
    inputError: {
        borderColor: "red",
        borderWidth: 1.5,
    },
    textError: {
        color: "red"
    },
    textArea: {
        minHeight: 120,
        marginTop: 10,
        marginBottom: 20,
    },
    toggleRow: {
        alignSelf: 'flex-start',
        marginBottom: 15,
        paddingVertical: 5
    },
    toggleText: {
        color: "#2326f7",
        fontSize: 16,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 15,
    },
    // Images
    imagePickerContainer: {
        height: 220,
        width: "100%",
        backgroundColor: "#E8EAF6",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 25,
        borderWidth: 1,
        borderColor: "#C5CAE9",
        borderStyle: "dashed"
    },
    imagePlaceholder: {
        alignItems: "center",
        gap: 8
    },
    imagePlaceholderText: {
        color: "#2326f7",
        fontWeight: "600",
        fontSize: 16
    },
    mainImage: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
    cameraIconOverlay: {
        position: "absolute",
        bottom: 12,
        right: 12,
        backgroundColor: "rgba(35, 38, 247, 0.8)", // Blue transparent
        padding: 10,
        borderRadius: 30
    },
    // Ingredient Cards (New Style)
    ingredientCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 1},
        shadowRadius: 2,
        overflow: 'hidden'
    },
    ingredientInputs: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center'
    },
    cleanInput: {
        padding: 14,
        fontSize: 16,
        color: "#333"
    },
    verticalLine: {
        width: 1,
        height: "60%",
        backgroundColor: "#eee"
    },
    deleteIconBtn: {
        padding: 14,
        backgroundColor: "#FFF0F0"
    },
    // Buttons
    purpleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        backgroundColor: "#6a0dad", // Purple
        borderRadius: 8,
        marginTop: 5,
        elevation: 3
    },
    purpleButtonText: {
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8
    },
    // Step Cards
    stepCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: "#2326f7" // Blue accent
    },
    stepIndexCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E8EAF6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12
    },
    stepIndexText: {
        color: "#2326f7",
        fontWeight: "bold",
        fontSize: 16
    },
    stepName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 2
    },
    stepDesc: {
        fontSize: 14,
        color: "#666"
    },
    deleteMiniButton: {
        padding: 5,
        marginLeft: 5
    },
    // Bottom Floating Button Area
    bottomFloatContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        elevation: 10 // High elevation for floating effect
    },
    primaryButton: {
        backgroundColor: "#2326f7", // Main Blue
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
        elevation: 4
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 1
    },
    // Modal Specific
    modalContainer: {
        flex: 1,
        backgroundColor: "#F5F7FA"
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        elevation: 2
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333"
    },
    modalContent: {
        padding: 20
    },
    modalFooter: {
        padding: 20,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee"
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4
    },
    stepImagePicker: {
        height: 160,
        backgroundColor: "#fff",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderStyle: 'dashed'
    },
    stepImage: {
        width: "100%",
        height: "100%",
        borderRadius: 8
    },
    stepImagePlaceholder: {
        alignItems: "center",
        gap: 5
    }
})