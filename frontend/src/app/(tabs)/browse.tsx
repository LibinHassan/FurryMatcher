import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Displays all available pets and allows users to filter them by their preferences.
export default function Browse() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [energyFilter, setEnergyFilter] = useState('all');
  const [indoorOutdoorFilter, setIndoorOutdoorFilter] = useState('all');
  const [childrenFilter, setChildrenFilter] = useState('all');
  const [otherPetsFilter, setOtherPetsFilter] = useState('all');


  // Load all available pets from the FastAPI backend when the page opens.
  useEffect(() => {
    fetch('http://127.0.0.1:8000/browse')
      .then((response) => response.json())
      .then((data) => {
        setPets(data);
        setIsLoading(false);
      })
      .catch(() => {
        setPets([]);
        setIsLoading(false);
      });
  },  []);

  // Filter the pets using the options selected by the user.
  const filteredPets = pets.filter((pet) => {
    if (speciesFilter !== 'all' && pet.species !== speciesFilter) return false;
    if (genderFilter !== 'all' && pet.gender !== genderFilter) return false;
    if (energyFilter !== 'all' && pet.energy !== energyFilter) return false;
    if (indoorOutdoorFilter !== 'all' && pet.indoor_outdoor !== indoorOutdoorFilter) return false;
    if (childrenFilter === 'yes' && pet.children_ok !== true) return false;
    if (otherPetsFilter === 'yes' && pet.other_pets_ok !== true) return false;
    return true
  });

  // Reset all filters so every available pet is shown again.
  const resetFilters = () => {
    setSpeciesFilter('all');
    setGenderFilter('all');
    setEnergyFilter('all');
    setIndoorOutdoorFilter('all');
    setChildrenFilter('all')
    setOtherPetsFilter('all');
  };

  // Reusable filter component used to display each group of filter options.
  const FilterGroup = ({ label, options, value, onChange }) => (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterOptionsRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.filterChip, value === option.value && styles.filterChipActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.filterChipText, value === option.value && styles.filterChipTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Browse Pets</Text>
      <Text style={styles.subtitle}>All pets currently available for adoption</Text>
      
      <View style={styles.mainRow}>
      <View style={styles.filtersContainer}>
        <View style={styles.filtersHeaderRow}>
          <Text style={styles.filtersTitle}>Filters</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <FilterGroup
          label="species"
          value={speciesFilter}
          onChange={setSpeciesFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'dog', label: 'Dog' },
            { value: 'cat', label: 'Cat' },
          ]}
        />

          <FilterGroup
            label="Gender"
            value={genderFilter}
            onChange={setGenderFilter}
            options={[
              { value: 'all', label: 'All'},
              { value: 'male', label: 'Male'},
              { value: 'female', label: 'Female'},
            ]}
          />

            <FilterGroup
              label="Energy level"
              value={energyFilter}
              onChange={setEnergyFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />

            <FilterGroup
              label="Living space"
              value={indoorOutdoorFilter}
              onChange={setIndoorOutdoorFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'indoor', label: 'Indoor' },
                { value: 'outdoor', label: 'Outdoor' },
              ]}
            />

            <FilterGroup
              label="Good with children"
              value={childrenFilter}
              onChange={setChildrenFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'yes', label: 'Yes only' }
              ]}
            />

            <FilterGroup
              label="Good with other pets"
              value={otherPetsFilter}
              onChange={setOtherPetsFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'yes', label: 'Yes only' },
              ]}
            />
          </View>

      <View style={styles.petsColumn}>
      {isLoading && (
        <ActivityIndicator size="small" color="#E8520A" style={styles.loader} />
      )}
      {!isLoading && filteredPets.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No pets match these filters. Try adjusting them.</Text>
        </View>
      )}

      // Display each pet that remains after the selected filters are applied.
      {filteredPets.map((pet) => (
        <TouchableOpacity
          key={pet.name}
          style={styles.card}
          onPress={() => router.push({ pathname: '/pet-detail', params: { ...pet, breedInfo: pet.breed_facts, reason: pet.browse_description } })}
        >

        <Image source={{ uri: pet.photo }} style={styles.photo} />
        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{pet.name}</Text>
            <View style={[styles.tag, pet.species === 'dog' && styles.dogTag]}>
              <Text style={styles.tagText}>{pet.species === 'dog' ? 'Dog' : 'Cat'}</Text>
            </View>
          </View>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{pet.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Breed</Text>
              <Text style={styles.infoValue}>{pet.breed}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{pet.age}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sex</Text>
              <Text style={styles.infoValue}>{pet.gender === 'male' ? 'Male' : 'Female'}</Text>
            </View>
          </View>
          {(pet.browse_description) && (
            <Text style={styles.description}>{pet.browse_description}</Text>
          )}

          <View style={styles.detailsRow}>
            {pet.energy && (
              <Text style={styles.detailChip}>{pet.energy} energy</Text>
            )}
            {pet.indoor_outdoor && (
              <Text style={styles.detailChip}>{pet.indoor_outdoor}</Text>
            )}
            {pet.children_ok !== null && pet.children_ok !== undefined && (
              <Text style={styles.detailChip}>{pet.children_ok ? 'Good with children' : 'Not suited to children'}</Text>
            )}
            {pet.other_pets_ok !== null && pet.other_pets_ok !== undefined && (
              <Text style={styles.detailChip}>{pet.other_pets_ok ? 'Good with other pets' : 'No other pets'}</Text>
            )}
        </View>
            <Text style={styles.idealHome}>
              Best suited to: {pet.indoor_outdoor === 'indoor' ? 'an indoor focused home' : 'a home with outdoor space'}
              {pet.energy === 'high' ? ', an active household with time for daily exercise': pet.energy === 'low' ? ', a calm, relaxed household' : ', a household with a moderate space of life'}
              {pet.children_ok ? ', suitable for families with children' : ', better suited to a home without young children'}
              {pet.other_pets_ok ? ' and comfortable around other pets' : ', best as the only pet in the home'}.
            </Text>
      </View>
    </TouchableOpacity>
  ))}
  </View>
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
    padding: 20,
    maxWidth: 1200,
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
  mainRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8d88a',
    padding: 16,
    marginBottom: 20,
    width: 220,
  },
  petsColumn: {
    flex: 1,
  },
  filtersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filtersTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  resetText: {
    fontSize: 13,
    color: '#E8520A',
    fontWeight: '600',
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A2D00',
    marginBottom: 6,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF8E0',
    borderWidth: 1,
    borderColor: '#e8d88a',
  },
  filterChipActive: {
    backgroundColor: '#E8520A',
    borderColor: '#E8520A',
  },
  filterChipText: {
    fontSize: 12,
    color: '#7A2D00',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
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
    marginBottom: 16,
    overflow: 'hidden',
  },
   photo: {
    width: '100%',
    height: 320,
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
   infoBlock: {
    marginTop: 8,
    marginBottom: 8,
   },
   infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f0d8',
   },
   infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
   },
   infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
   },
   meta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    marginBottom: 8,
   },
   description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginTop: 8,
   },
   detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
   },
   detailChip: {
    fontSize: 11,
    color: '#7A2D00',
    backgroundColor: '#FFF0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
   },
   idealHome: {
    fontSize: 13,
    color: '#7A2D00',
    fontWeight: '600',
    marginTop: 10,
    lineHeight: 18,
   },
  });





