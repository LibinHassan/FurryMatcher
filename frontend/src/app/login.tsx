import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);


    async function handleAuth() {
        setLoading(true);

        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({ email, password});
            setLoading(false);
            if (error) {
                Alert.alert('Sign up failed', error.message);
            } else {
                if (data.user) {
                    const { error: profileError } = await supabase.from('profiles').insert({
                        user_id: data.user.id,
                        full_name: '',
                        location: '',
                        home_type: '',
                        household: '',
                    });
                    if (profileError) {
                        Alert.alert('Profile creation failed', profileError.message);
                }
            }
                Alert.alert('Success', 'Account created! You can now log in.');
                setIsSignUp(false);
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                setLoading(false);
                if (error) {
                    Alert.alert('Login failed', error.message);
                } else {
                    router.replace('/(tabs)/profile');
                }
            }
        }

        return (
            <View style={styles.container}>
                <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Log In'}</Text>


                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}> 
                    <Text style={styles.buttonText}>
                        {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
                    </Text>
                </TouchableOpacity>
                    
                    
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>           
                    <Text style={styles.switchText}>
                        {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                    </Text>
                </TouchableOpacity>
            </View>
        );          
    }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#000',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    switchText: {
        marginTop: 16,
        textAlign: 'center',
        color: '#555',
    },
});






