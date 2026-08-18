import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen(){
  const router = useRouter();
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.hero}>
        <Text style={styles.title}>FurryMatcher</Text>
        <Text style={styles.tagline}>Every pet deserves a perfect match</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/chat')}>
          <Text style={styles.buttonText}>Chat with Adam</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
        <Text style={styles.statNum}>1 in 4</Text>
        <Text style={styles.statLabel}>households own a cat</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNum}>23%</Text>
        <Text style={styles.statLabel}>of cats adopted not bought</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNum}>47K+</Text>
        <Text style={styles.statLabel}>people tried to give up their dog</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNum}>11,707</Text>
        <Text style={styles.statLabel}>dogs in rehoming centres</Text>
      </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured pets</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll}>
          <View style={styles.petCard}>
            <Image
            source={{ uri: "https://images.unsplash.com/photo-1635421211739-d5940b120868?q=80&w=1404&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
            style={styles.petPhoto}
            />
            <Text style={styles.petName}>Whiskers</Text>
            <Text style={styles.petInfo}>3 years old, Camden, London</Text>
            <View style={styles.petTag}><Text style={styles.petTagText}>Cat</Text></View>
      </View>
      <View style={styles.petCard}>
        <Image
            source={{ uri: "https://images.unsplash.com/photo-1693615775129-f2004d6e3e0b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
            style={styles.petPhoto}
            />
            <Text style={styles.petName}>Biscuit</Text>
            <Text style={styles.petInfo}>2 years old, Richmond, London</Text>
            <View style={[styles.petTag, styles.dogTag]}><Text style={styles.petTagText}>Dog</Text></View>
      </View>
      <View style={styles.petCard}>
        <Image
            source={{ uri: "https://images.stockcake.com/public/8/c/e/8ce15260-1b2d-4b51-ba22-8a6f198183f1_large/curious-siamese-kitten-stockcake.jpg" }}
            style={styles.petPhoto}
            />
        <Text style={styles.petName}>Luna</Text>
        <Text style={styles.petInfo}>1 year old, Hackney, London</Text>
        <View style={styles.petTag}><Text style={styles.petTagText}>Cat</Text></View>
      </View>
      <View style={styles.petCard}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1647097298829-e41dd4d8f92f?q=80&w=1626&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
          style={styles.petPhoto}
          />
          <Text style={styles.petName}>Buddy</Text>
          <Text style={styles.petInfo}>4 years old, Croydon, London</Text>
          <View style={[styles.petTag, styles.dogTag]}><Text style={styles.petTagText}>Dog</Text></View>
        
      </View>
    </ScrollView>  

      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.step}>
          <View style={styles.stepNumber}><Text style={styles.stepNum}>1</Text></View>
          <View>
              <Text style={styles.stepTitle}>Chat with Adam</Text>
              <Text style={styles.stepDesc}>Tell our AI assistant about your lifestyle and home</Text>
          </View>
        </View>
        <View style={styles.step}>
          <View style={styles.stepNumber}><Text style={styles.stepNum}>2</Text></View>
          <View>
            <Text style={styles.stepTitle}>Browse your matches</Text>
            <Text style={styles.stepDesc}>See pets matched to your answers</Text>
        </View>
      </View>
      <View style={styles.step}>
        <View style={styles.stepNumber}><Text style={styles.stepNum}>3</Text></View>
        <View>
          <Text style={styles.stepTitle}>Meet your pet</Text>
          <Text style={styles.stepDesc}>Contact to arrange a visit</Text>
        </View>
      </View>
    </View>

    <StatusBar style="auto" />
  </ScrollView>
  );
}
      
 const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#FFF8C6'},
  hero: { backgroundColor: '#E8520A', paddingTop: 80, paddingBottom: 24, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF8C6' },
  tagline: { fontSize: 16, color: '#fff', marginTop: 8, marginBottom: 16 },
  button: { backgroundColor: '#FFF8C6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25, marginTop: 16 },
  buttonText: { color: '#E8520A', fontSize: 16, fontWeight: 'bold' }, loginLink: { color: '#fff', fontSize: 14, marginTop: 16, textDecorationLine: 'underline' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, backgroundColor: '#E8520A', justifyContent: 'space-between'},
  statBox: { backgroundColor: '#FFF8C6', borderRadius: 12, padding: 12, width: '48%', alignItems: 'center', marginBottom: 10},
  statNum: {fontSize: 18, fontWeight: 'bold', color: '#E8520A' },
  statLabel: {fontSize: 10, color: '#7A2D00', marginTop: 3, textAlign: 'center' }, 

 section: { padding: 16, marginTop: 8 },
 sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
 petScroll: { flexDirection: 'row' },
 petCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginRight: 16, width: 230, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3},
 petPhoto: { width: 190, height: 190, borderRadius: 16, marginBottom: 12, resizeMode: 'contain', backgroundColor: '#f5f0d8' },
 petName: { fontSize: 20, fontWeight: 'bold', color: '#333'},
 petInfo: { fontSize: 14, color: '#888', marginTop: 6},
 petTag: { backgroundColor: '#FFF0E0', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5, marginTop: 10 },
 dogTag: { backgroundColor: '#E0F0FF' },
 petTagText: { fontSize: 13, color: '#E8520A', fontWeight: '600' },
 step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 12},
 stepNumber: {backgroundColor: '#E8520A', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
 stepNum: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
 stepTitle: { fontSize: 16, fontWeight: 'bold', color: '#333'},
 stepDesc: { fontSize: 13, color: '#888', marginTop: 2 },

});