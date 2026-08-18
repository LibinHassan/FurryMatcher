import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function About() {
    const router = useRouter();


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backLink}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>About FurryMatcher</Text>

            <Text style={styles.sectionTitle}>What is FurryMatcher?</Text>
            <Text style={styles.paragraph}>
                FurryMatcher helps people in the UK find the right cat or dog to adopt. Instead of scrolling through endless pet listings, you chat with Adam, our Adoption Assistant, who asks about your lifestyle, home and experience, then finds pets that genuinely suit you.
            </Text>

            <Text style={styles.sectionTitle}>How it works</Text>


            <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNum}>1</Text></View>
                <View style={styles.stepText}>
                    <Text style={styles.stepTitle}>Chat with Adam</Text>
                    <Text style={styles.stepDesc}>Tell Adam about your lifestyle, home and what you're looking for in a pet.</Text>                    
                </View>
            </View>


            <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNum}>2</Text></View>
                <View style={styles.stepText}>
                    <Text style={styles.stepTitle}>Ask questions</Text>
                    <Text style={styles.stepDesc}>Ask Adam about a specific pet. If Adam doesn't know the answer, it gets passed to the shelter for you.</Text>
                </View>
            </View>

            <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNum}>4</Text></View>
                <View style={styles.stepText}>
                <Text style={styles.stepTitle}>Meet your pet</Text>
                <Text style={styles.stepDesc}>Arrange a meet and greet, then bring your new companion home.</Text>
            </View>
            </View>

        <Text style={styles.sectionTitle}>Giving up a pet?</Text>
        <Text style={styles.paragraph}>
            If you can no longer care for a pet, Adam can also help you create a profile for them, which is reviewed before going live to potential adopters.
        </Text>
    </ScrollView>
    );
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#FFF8C6'
},
content: {
    padding: 20,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
},
backLink: {
    color: '#E8520A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
},
title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
},
sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
},
paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
},
step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
},
stepNumber: {
    backgroundColor: '#E8520A',
    borderRadius: 18,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
},
stepNum: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
},
stepText: {
    flex: 1,
},
stepTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
},
stepDesc: {
    fontSize: 13,
    color:'#888',
    marginTop: 2,
},
});

