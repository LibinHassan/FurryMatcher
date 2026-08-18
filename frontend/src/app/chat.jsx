import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from '../lib/auth-context';
import './global.css';

const BACKEND_URL = "http://127.0.0.1:8000/chat";

// Main screen for conversations between the user and Adam.
export default function ChatScreen() {
    const { session, loading } = useAuth();

    // Restore the user's previous chat history when the page is reopened.
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem("furryMatcher_chat_history");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false)
    const flatListRef = useRef(null);

    // Start a new conversation automatically when a logged in user opens an empty chat.
    useEffect(() => {
        if (!loading && session && messages.length === 0) {
            sendMessage("HELLO", []);
        }
    }, [loading, session]);

    // Automatically scroll to the newest message during the conversation.
    useEffect(() => {
    if (!loading && session) {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({
                animated: true,
            });
        }, 50);
    }
}, [messages, loading, session]);

// Save the conversation history locally when messages change.
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem("furryMatcher_chat_history", JSON.stringify(messages));
            } catch {}
        }
    }, [messages]);

if (loading) {
    return null;
}

// Only logged in users can access Adam.
if (!session) {
    return <Redirect href="/login" />;
}

    // Send the user's message and conversation history to the FastAPI backend then add Adam's response and any matched pets to the chat.
    const sendMessage = async (text, currentHistory) => {
        if (!text.trim()) return;
        const userMessage = text.trim();
        const isSilentOpen = userMessage === "HELLO" && currentHistory.length === 0;

        let updatedMessages = currentHistory;

        if (!isSilentOpen) {
            const userEntry = { id: Date.now() + Math.random(), role: "user", content: userMessage };
            updatedMessages = [...currentHistory, userEntry];
            setMessages(updatedMessages);
            setInputText("");
        }

        setIsLoading(true);

        try {
            const conversation = updatedMessages;
            const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({message: userMessage, conversation }),
            });            

            const data = await response.json();

            const aiEntry = {
                id: Date.now() + Math.random(),
                role: "assistant",
                content: data.reply,
                matchedPets: data.matched_pets || [],
            };

            setMessages((prev) => [...prev, aiEntry]);
         }  catch (error) {
              const errorEntry = {
                id: Date.now() + Math.random(),
                role: "assistant",
                content: "Sorry, I couldn't connect to the server. Please make sure the backend is running.",
              };  
              
              setMessages((prev) => [...prev, errorEntry]);
        } finally {
              setIsLoading(false);
            }
        };

        // Send the current message unless the input is empty or Adam is already responding.
        const handleSend = () => {
            if (!inputText.trim() || isLoading) return;
            sendMessage(inputText, messages);
        };

        // Upload a pet photo for breed recognition, save the photo, then pass the detected breed back into the conversation.
        const handleImageUpload = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append("file", file);
                const response = await fetch("http://127.0.0.1:8000/predict", {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                const breedMessage = `Based on your photo, i can see this looks like a ${data.breed} (${Math.round(data.confidence)}% confidence)! I've noted that down.`;
                
                const uploadFormData = new FormData();
                uploadFormData.append("file", file);
                const uploadResponse = await fetch("http://127.0.0.1:8000/upload_photo", {
                    method: "POST",
                    body: uploadFormData,
            });
            const uploadData = await uploadResponse.json();
            const photoUrl = uploadData.photo_url;
    
                const aiEntry ={
                    id: Date.now() + Math.random(),
                    role: "assistant",
                    content: breedMessage,
                };
                setMessages((prev) => [...prev, aiEntry]);
            
                sendMessage(`[Photo uploaded: ${photoUrl}] [Detected breed: ${data.breed}]`, [...messages, aiEntry]);
            } catch (error) {
                sendMessage("Sorry, I could not identify that breed from that photo.", messages || [])
            } finally {
                setIsUploading(false);
            }
        };



        // Display user and Adam messages, including pet cards when matches are returned.
        const renderMessage = ({ item }) => {
            const isUser = item.role === "user";
            return (
                <>
                <View
                    style={[
                        styles.messageRow,
                        isUser ? styles.messageRowUser: styles.messageRowAI,
                    ]}
                >
                    {!isUser && (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>A</Text>
                        </View>
                    )}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
                    <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
                        {item.content}
                    </Text>
                </View>
            </View>
            {item.matchedPets && item.matchedPets.length > 0 && (
                <View style={styles.petCardsRow}> 
                    {item.matchedPets.map((pet) => (
                        <View key ={pet.name} style={styles.petCard}>
                            <Image source={{ uri: pet.photo }} style={styles.petCardPhoto} />
                            <Text style={styles.petCardName}>{pet.name}</Text>
                            <Text style={styles.petCardSummary}>{pet.summary}</Text>

                            {pet.match_reason && (
                                <Text style={styles.petCardMatchReason}>
                                    {pet.match_reason}</Text>
                            )}

                            <View style={styles.petCardDetails}>
                            {pet.breed && pet.breed !== "Unknown" && (
                                <Text style={styles.petCardDetailRow}><Text style={styles.petCardLabel}>Breed: </Text>{pet.breed}</Text>

                            )}
                            {pet.age && (
                                <Text style={styles.petCardDetailRow}><Text style={styles.petCardLabel}>Age: </Text>{pet.age}</Text>
                            )}
                            {pet.energy && (
                                <Text style={styles.petCardDetailRow}><Text style={styles.petCardLabel}>Energy: </Text>{pet.energy}</Text>
                            )}
                            {pet.indoor_outdoor && (
                                <Text style={styles.petCardDetailRow}><Text style={styles.petCardLabel}>Suited to: </Text>{pet.indoor_outdoor} living</Text>
                            )}
                            {pet.children_ok !== null && pet.children_ok !== undefined && (
                                <Text style={styles.petCardDetailRow}><Text style={styles.petCardLabel}>Good with children: </Text>{pet.children_ok ? "Yes": "No"}</Text>
                            )}
                            {pet.other_pets_ok !== null && pet.other_pets_ok !== undefined && (
                                <Text style={styles.petCardDetailRow}><Text style={styles.petCardLabel}>Good with other animals: </Text>{pet.other_pets_ok ? "Yes" : "No"}</Text>
                            )}
                            {pet.microchipped !== null && pet.microchipped !== undefined && (
                                <Text style={styles.petCardDetailRow}><Text style={styles.petCardLabel}>Microchipped: </Text>{pet.microchipped ? "Yes": "No"}</Text>                            
                            )}                    
                            {pet.is_rescue && (
                                <Text style={styles.petCardDetailRow}>Rescue animal</Text>
                            )}
                    </View>
                </View>
            ))}
        </View>
    )}
    </>
    );
};

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Adam</Text>
                <Text style={styles.headerSubtitle}>Your adoption assistant</Text>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90: 0}
            >
                <ScrollView
                    ref={flatListRef}
                    style={styles.messageContainer}
                        contentContainerStyle={styles.messageList}
                        showsVerticalScrollIndicator={true}
                        onContentSizeChange={() =>
                            flatListRef.current?.scrollToEnd({ animated: true })
                        }
                >
                    {messages.map((item) => (
                         <View key={item.id}>
                            {renderMessage({ item })}
                        </View>
                    ))}

                    {isLoading && (
                        <View style={styles.typingRow}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>A</Text>
                        </View>
                        <View style={styles.typingBubble}>
                            <ActivityIndicator size="small" color="#E8520A" />
                        </View>
                    </View>
                )}
            </ScrollView>

                <View style={styles.inputBar}>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        id="photo-upload"
                        onChange={handleImageUpload}
                    />
                    <TouchableOpacity
                        style={[styles.uploadButton, isUploading && styles.sendButtonDisabled]}
                        onPress={() => document.getElementById("photo-upload").click()}
                        disabled={isUploading}
                        >
                            <Text style={styles.sendButtonText}>Upload</Text>
                        </TouchableOpacity>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#aaa"
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        onKeyPress={(event) => {
                            if (event.nativeEvent.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                handleSend();
                            }
                        }}
                        returnKeyType="send"
                        editable={!isLoading}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        backgroundColor: "#E8520A",
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: "center",    
    },

    headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
    headerSubtitle: { fontSize: 13, color: "#ffd9c4", marginTop: 2 },
    messageList: {padding: 16, paddingBottom: 8 },
    messageRow: {flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
    messageRowUser: {justifyContent: "flex-end" },
    messageRowAI: {justifyContent: "flex-start" },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#FFF8C6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#E8520A22",
    },
    avatarText: { fontSize: 18 },
    bubble: {maxWidth: "75%", borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
    bubbleUser: { backgroundColor: "#E8520A", borderBottomRightRadius: 4 },
    bubbleAI: { backgroundColor: "#FFF8C6", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "#e8d88a" },
    bubbleText: { fontSize: 15, lineHeight: 21 },
    bubbleTextUser: { color: "#fff" },
    bubbleTextAI: { color: "#333" },
    petCardsRow: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 42, marginBottom: 12, gap: 10 },
    petCard: { backgroundColor: "#fff", borderRadius: 14, padding: 12,
borderWidth: 1, borderColor: "#e8d88a", maxWidth: 160, flexGrow: 1},
    petCardPhoto: { width: "100%", height: 180, borderRadius: 10, marginBottom: 8, resizeMode: "contain" },
    petCardName: { fontSize: 15, fontWeight: "700", color: "#333", marginBottom: 4},
    petCardSummary: { fontSize: 13, color: "#666", lineHeight: 18 },


    typingRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12 },
    petCardDetails: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f0e6c0", gap: 4 },
    petCardDetailRow: { fontSize: 12, color: "#555"},
    petCardLabel: {fontWeight: "700", color: "#333"}, 

    typingBubble: {
        backgroundColor: "#FFF8C6",
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: "#e8d88a",
    },

    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#FFFDF0",
        gap: 8,

    },
    input: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: "#333",
        maxHeight: 100,
    },
    sendButton: {backgroundColor: "#E8520A", borderRadius: 22, paddingHorizontal: 18, paddingVertical: 11},
    sendButtonDisabled: { backgroundColor: "#f0c4a8" },
    sendButtonText: {color: "#fff", fontWeight: "600", fontSize: 15 },
    uploadButton: { backgroundColor: "#E8520A", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 11},
    messageContainer: {
        flex: 1,
    },
});