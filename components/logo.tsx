import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';


export default function Logo() {
    const theme = useTheme();
    return (
        <>
            <Image 
            source={{ uri: 'https://img.icons8.com/color/96/cooking-pot.png' }} 
            style={styles.logo} 
            />
            <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
            RecipeGram
            </Text>
        </>
    )
}

const styles = StyleSheet.create({
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 20,
    },
})