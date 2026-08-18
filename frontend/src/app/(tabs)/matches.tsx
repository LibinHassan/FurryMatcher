import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Shows the pets most recently matched to the user by Adam.
export default function Matches() {
  const router = useRouter();
  const [matchedPets, setMatchedPets] = useState([])
  const [isLoading, setIsLoading] = useState(true);

  // Load the user's latest matches from the FastAPI backend when the page first opens.
  useEffect(() => {
    fetch('http://127.0.0.1:8000/matches')
    .then((response) => response.json())
    .then((data) => {
      setMatchedPets(data);
      setIsLoading(false)
    })
    .catch(() => {
      setMatchedPets([])
      setIsLoading(false);
    });
    },  []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Matches</Text>
      <Text style={styles.subtitle}>Pets matched to your answers with Adam</Text>

      {isLoading && (
        <ActivityIndicator size="small" color='#E8520A' style={styles.loader} />
      )}

      {/* Shows a message when the user has no matches yet. */}
      {!isLoading && matchedPets.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No matches yet. Chat with Adam to find pets suited to you.</Text>
        </View>
      )}

      {/* Display each matched pet as a card. */}
      {matchedPets.map((pet) => (
        <TouchableOpacity 
          key={pet.name}
          style={styles.card}
          onPress={() => router.push({ pathname: '/pet-detail',  params: pet })}
        >
          <Image source ={{ uri: pet.photo }} style={styles.photo} />
          <View style={styles.cardBody}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{pet.name}</Text>
                <View style={[styles.tag, pet.species === 'dog' && styles.dogTag]}>
                  <Text style={styles.tagText}>{pet.species === 'dog' ? 'Dog': 'Cat'}</Text>
              </View>
            </View>
            <Text style={styles.meta}>{pet.breed}, {pet.age}</Text>
            <Text style={styles.reason}>{pet.summary}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF0',
  },
  content: {
    padding: 20,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8d88a',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8d88a',
    padding: 16,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    backgroundColor: '#f5f0d8',
  },
  cardBody: {
    padding: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  tag: {
    backgroundColor: '#FFF0E0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  dogTag: {
    backgroundColor: '#E0F0FF',
  },
  tagText: {
    fontSize: 11,
    color: '#E8520A',
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    marginBottom: 8,
  },
  reason: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});

 