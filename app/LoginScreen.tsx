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

export default function LoginScreen() {
    const [loginText, setLoginText] = useState("")
    const [passwordText, setPasswordText] = useState("")
    
    const [loginError, setLoginError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)

    const navigation = useNavigation()

    const handleLogin = () => {
        setLoginError(false)
        setPasswordError(false)

        let isValid = true;

        if (loginText.trim() === "") {
            setLoginError(true)
            isValid = false;
        }

        if (passwordText.trim() === "") {
            setPasswordError(true)
            isValid = false;
        }

        if (!isValid) return;

        if (loginText.toLowerCase() === "user" && passwordText === "Pass") {
            navigation.replace("HomeScreen")
        } else {
            Alert.alert("Error", "Invalid Username or Password")
        }
    }

    const handleCreateAccount = () => {
        navigation.navigate("Register")
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.innerContainer}>
                
                <Text style={styles.headerText}>Login</Text>
                <Text style={styles.subHeaderText}>Please sign in to continue</Text>

                <View style={styles.inputContainer}>
                    <TextInput 
                        style={[styles.input, loginError && styles.errorInput]} 
                        placeholder="Username"
                        placeholderTextColor="#aaaaaa"
                        value={loginText}
                        onChangeText={(text) => {
                            setLoginText(text)
                            setLoginError(false)
                        }}
                        autoCapitalize="none"
                    />
                    
                    <TextInput 
                        style={[styles.input, passwordError && styles.errorInput]} 
                        placeholder="Password" 
                        placeholderTextColor="#aaaaaa"
                        value={passwordText}
                        onChangeText={(text) => {
                            setPasswordText(text)
                            setPasswordError(false)
                        }}
                        secureTextEntry={true}
                    />
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={handleCreateAccount}>
                        <Text style={styles.createAccountText}>Sign Up</Text>
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
        gap: 20,
    },
    headerText: {
        fontSize: 28,
        textAlign: "center",
        color: "#0c0c0cff",
        fontWeight: "800",
        marginBottom: 5
    },
    subHeaderText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 20
    },
    inputContainer: {
        width: "100%",
        gap: 15,
    },
    input: {
        backgroundColor: "#fff",
        width: "100%",
        height: 55,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: "#333",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
        borderWidth: 1,
        borderColor: "transparent"
    },

    errorInput: {
        borderColor: "red",
        borderWidth: 1,
    },
    loginButton: {
        backgroundColor: "#2326f7ff", 
        width: "100%",
        height: 55,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#4a4ce2ff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    loginButtonText: {
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
        color: "#666",
        fontSize: 14
    },
    createAccountText: {
        color: "#2326f7ff",
        fontSize: 14,
        fontWeight: "bold"
    }
})