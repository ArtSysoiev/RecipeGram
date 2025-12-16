import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import React, { useEffect, useState } from "react"
import {
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"
import { styles } from "./styles"

import { Step } from "../Models"

export default function StepEditorModal({
    visible,
    step,
    onSave,
    onCancel,
}: {
    visible: boolean
    step: Step | null
    onSave: (step: Step) => void
    onCancel: () => void
}) {
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
                        textAlignVertical="top"
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
                
                <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
                        <Text style={styles.primaryButtonText}>SAVE STEP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}