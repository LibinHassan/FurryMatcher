import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';


export default function Profile() {
    const [profileType, setProfileType] = useState('adopter');
    const [profileData, setProfileData] = useState(null);
    const { session } = useAuth();

    useEffect(() => {
        async function fetchProfile() {
            if (!session) return;
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
            setProfileData(data);
        }
        fetchProfile();
    }, [session]);
    
    async function handleLogout() {
        await fetch('http://127.0.0.1:8000/clear_matches', { method: 'POST'});
        await supabase.auth.signOut();
        router.replace('/login');
    }    
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.toggleRow}>
                <TouchableOpacity
                style={[styles.toggleButton, profileType === 'adopter' && styles.toggleButtonActive]}
                onPress={() => setProfileType('adopter')}
                >

                <Text style={[styles.toggleText, profileType === 'adopter' && styles.toggleTextActive]}>
                Adopter
                </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, profileType === 'shelter' && styles.toggleButtonActive]}
                    onPress={() => setProfileType('shelter')}
                >
                    <Text style={[styles.toggleText, profileType === 'shelter' && styles.toggleTextActive]}>
                    Shelter
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                    {profileType === 'adopter' ? 'J' : 'S'}
                </Text>
            </View>

            {profileType === 'adopter' ? (
                <>
                    <Text style={styles.name}>{profileData?.full_name ||
                session?.user?.email || 'Adopter'}</Text>
                    <Text style={styles.subtitle}>Adopter</Text>
                    <View style={styles.infoCard}>
                        <InfoRow label="Email" value={session?.user?.email || ''} />
                        <InfoRow label="Location" value={profileData?.location || 'Not set'} />
                        <InfoRow label="Member since" value={profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('en-GB', {month: 'long', year: 'numeric' }) : ''} />
                        <InfoRow label="Home type" value={profileData?.home_type || 'Not set'} />
                        <InfoRow label="Household" value={profileData?.household || 'Not set'} />
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}>Saved Pets</Text>
                        <Text style={styles.cardBody}>No pets saved yet. Chatt with Adam to start finding matches.</Text>
                    </View>
                </>
            ) : (
            <>
                    <Text style={styles.name}>Celia Hammond Animal Trust</Text>
                    <Text style={styles.subtitle}>Shelter</Text>


                    <View style={styles.infoCard}>
                        <InfoRow label="Contact email" value="info@celiahammond.example" />
                        <InfoRow label="Location" value="Manchester, UK" />
                        <InfoRow label="Registered since" value="May 2026" />
                        <InfoRow label="Pets currently listed" value="12" />
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}>Recent Submissions</Text>
                        <Text style={styles.cardBody}>Pet profiles submitted through Adam appear here for review.</Text>
                    </View>
                </>
            )}

            <View style={styles.menuCard}>
                <MenuRow label="About FurryMatcher" />
                <MenuRow label="Contact Us" />
                <MenuRow label="Settings" />
                <MenuRow label="Log Out" onPress={handleLogout} />
            </View>
        </ScrollView>
    );
}

                
function InfoRow({ label, value}) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

function MenuRow({ label, onPress }) {
    return (
        <TouchableOpacity style={styles.menuRow} onPress={onPress}>
            <Text style={styles.menuText}>{label}</Text>
            <Text style={styles.menuArrow}>{'>'}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF0',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    toggleRow: {
        flexDirection: 'row',
        backgroundColor: '#FFF0E0',
        borderRadius: 20,
        padding: 4,
        marginBottom: 20,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    toggleButtonActive: {
        backgroundColor: '#E8520A'
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E8520A'
    },
    toggleTextActive: {
        color: '#fff',
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8520A',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    subtitle: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
        marginBottom: 20,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        width: '100%',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e8d88a',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 6,
    },
    cardBody: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f0d8',
    },
    infoLabel: {
        fontSize: 13,
        color: '#888',
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        width: '100%',
        borderWidth: 1,
        borderColor: '#e8d88a',
        overflow: 'hidden',
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f0d8',
    },
    menuText: {
        fontSize: 18,
        color: '#ccc',
    },
    menuArrow: {
        fontSize: 18,
        color: '#ccc',
    },
});