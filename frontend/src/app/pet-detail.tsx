import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PetDetail() {
    const router = useRouter();
    const params = useLocalSearchParams();


    const pet = {
        name: params.name,
        breed: params.breed,
        age: params.age,
        photo: params.photo,
        species: params.species,
        breedInfo: params.breedInfo,
        reason: params.summary,
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/matches')}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <Image source={{ uri: pet.photo }} style={styles.photo} />


            <View style={styles.body}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{pet.name}</Text>
                    <View style={[styles.tag, pet.species === 'dog' && styles.dogTag]}>
                        <Text style={styles.tagText}>{pet.species === 'dog' ? 'Dog' : 'Cat'}</Text>
                    </View>
                </View>

                <Text style={styles.meta}>{pet.breed}, {pet.age}</Text>

            {pet.breedInfo && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>About the Breed</Text>
                    <Text style={styles.reason}>{pet.breedInfo}</Text>
                </View>
            )}
            
        {pet.reason && (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{params.tag ? 'Why We Matched You' : 'About this Pet'}</Text>
                <Text style={styles.reason}>
                    {params.tag ? pet.breedInfo : pet.breedInfo?.split("That's exactly why")[0].trim()}
                </Text>
                </View>
        )}
                <TouchableOpacity style={styles.contactButton}>
                    <Text style={styles.contactButtonText}>Contact Shelter</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF0',
    },
    content: {
        paddingBottom: 40,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },
    backButton: {
        padding: 16,
    },
    backButtonText: {
        fontSize: 15,
        color: '#E8520A',
        fontWeight: '600',
    },
    photo: {
        width: '100%',
        height: 280,
        resizeMode: 'contain',
        backgroundColor: '#f5f0d8',
    },
    body: {
        padding: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    tag: {
        backgroundColor: '#FFF0E0',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    dogTag: {
        backgroundColor:  '#E0F0FF',
    },
    tagText: {
        fontSize: 12,
        color: '#E8520A',
        fontWeight: '600',
    },
    meta: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e8d88a',
        padding: 16,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 6,
    },
    reason: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    contactButton: {
        backgroundColor: '#E8520A',
        borderRadius: 22,
        paddingVertical: 14,
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});

