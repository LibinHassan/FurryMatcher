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
                FurryMatcher helps people in the UK find the right cat or dog to adopt. Rather than scrolling through endless pet listings, you chat with Adam, our Adoption Assistant. Adam asks about your home, lifestyle and experience and then matches you with pets from local shelters that genuinely suit your circumstances. You can also ask Adam questions about any pet you're interested in and if you ever need to rehome a pet yourself, Adam can help with that too.
            </Text>

            <Text style={styles.sectionTitle}>The adoption process</Text>

            <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNum}>1</Text></View>
                <View style={styles.stepText}>
                    <Text style={styles.stepTitle}>Chat with Adam</Text>
                    <Text style={styles.stepDesc}>Adam asks about your lifestyle, home and experience with pets: whether you're after a cat or dog, how active you are, whether you have a garden, whether you have children or other pets at home and what age of pet suits you best.</Text>                    
                </View>
                </View>


            <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNum}>2</Text></View>
            <View style={styles.stepText}>
            <Text style={styles.stepTitle}>Get matched</Text>
            <Text style={styles.stepDesc}>Once Adam has everything it needs, it searches the available pets and shows you the ones that best fit your answers. Each match comes with a short explanation of why that pet was chosen for you, for example, their energy level, breed or how well they'd suit your home. If your exact preferences aren't available, such as a specific breed, Adam will say so honestly and offer the closest alternatives instead.</Text>
            </View>
            </View>



            <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNum}>3</Text></View>
                <View style={styles.stepText}>
                    <Text style={styles.stepTitle}>Ask questions about a specific pet</Text>
                    <Text style={styles.stepDesc}>Want to know more about one of your matches, such as their diet, vaccination status or whether they get on with children? Just ask Adam by name, for example "is Biscuit good with children"? Adam will answer using the real information on file for that pet. If the answer isn't known, Adam won't guess, it logs your question and passes it along to the shelter, so a real person can follow up with you.</Text>
                </View>
                </View>

            <View style={styles.step}>
                <View style={styles.stepNumber}><Text style={styles.stepNum}>4</Text></View>
                <View style={styles.stepText}>
                <Text style={styles.stepTitle}>Meet your pet</Text>
                <Text style={styles.stepDesc}>Once you've found a pet you're interested in, you can arrange a meet and greet directly with the shelter to make sure it's the right fit for both of you. If everyone's happy to proceed, the shelter will guide you through the rest of the adoption process and you can bring your new companion home.</Text>
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

