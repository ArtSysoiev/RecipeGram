import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"

export default function RegisterScreen() {
    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [loginError, setLoginError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [confirmError, setConfirmError] = useState(false)

    const navigation = useNavigation()

    const handleRegister = () => {
        setLoginError(false)
        setPasswordError(false)
        setConfirmError(false)

        let isValid = true

        if (login === "") {
            setLoginError(true)
            isValid = false
        }

        if (password === "") {
            setPasswordError(true)
            isValid = false
        }

        if (confirmPassword === "") {
            setConfirmError(true)
            isValid = false
        }

        if (!isValid) {
            return
        }

        if (password !== confirmPassword) {
            setPasswordError(true)
            setConfirmError(true)
            Alert.alert("Error", "Passwords do not match!")
            return
        }

        navigation.replace("Home")
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.innerContainer}>
                <Text style={styles.headerText}>Create Account</Text>
                
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={[styles.input, loginError && styles.errorInput]} 
                        placeholder="Email"
                        value={login}
                        onChangeText={(text) => {
                            setLogin(text)
                            setLoginError(false)
                        }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    
                    <TextInput 
                        style={[styles.input, passwordError && styles.errorInput]} 
                        placeholder="Password" 
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text)
                            setPasswordError(false)
                        }}
                        secureTextEntry
                    />

                     <TextInput 
                        style={[styles.input, confirmError && styles.errorInput]} 
                        placeholder="Confirm Password" 
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text)
                            setConfirmError(false)
                        }}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}> 
                        <Text style={styles.linkText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#dde8ffff" 
    },
    innerContainer: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        paddingHorizontal: 20, 
        gap: 20 
    },
    headerText: { 
        fontSize: 36, 
        fontWeight: "800", 
        color: "#0c0c0cff", 
        marginBottom: 10 
    },
    inputContainer: { 
        width: "100%", 
        gap: 15 
    },
    input: { 
        backgroundColor: "#fff", 
        width: "100%", 
        height: 55, 
        borderRadius: 12, 
        paddingHorizontal: 15, 
        elevation: 2,
        borderWidth: 1,
        borderColor: "transparent"
    },

    errorInput: {
        borderColor: "red",
        borderWidth: 1
    },
    registerButton: { 
        backgroundColor: "#2326f7ff", 
        width: "100%", 
        height: 55, 
        borderRadius: 12, 
        justifyContent: "center", 
        alignItems: "center", 
        marginTop: 10, 
        elevation: 5 
    },
    buttonText: { 
        color: "#fff", 
        fontSize: 18, 
        fontWeight: "bold" 
    },
    footer: { 
        flexDirection: "row", 
        marginTop: 20, 
        alignItems: "center" 
    },
    footerText: { 
        color: "#666" 
    },
    linkText: { 
        color: "#2326f7ff", 
        fontWeight: "bold" 
    }
})