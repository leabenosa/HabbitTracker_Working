import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Profile = {
  name: string;
  email?: string;
  bio?: string;
  imageUri?: string;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', bio: '' });
  const [editField, setEditField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('profile').then(data => {
      if (data) setProfile(JSON.parse(data));
    });
  }, []);

  const saveProfile = async (updatedProfile: Profile) => {
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      Alert.alert('Profile Saved', 'Your profile has been updated successfully.');
    } catch (e) {
      console.error('Error saving profile', e);
    }
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0].uri) {
        const updatedProfile = { ...profile, imageUri: response.assets[0].uri };
        saveProfile(updatedProfile);
      }
    });
  };

  const startEditing = (field: keyof Profile) => {
    setEditField(field);
    setTempValue(profile[field] || '');
    setModalVisible(true);
  };

  const confirmEdit = () => {
    if (editField) {
      const updatedProfile = { ...profile, [editField]: tempValue };
      saveProfile(updatedProfile);
    }
    setModalVisible(false);
    setEditField(null);
  };

  return (
    <View style={styles.container}>
      {profile.name !== '' && (
        <Text style={styles.nameText}>{profile.name}</Text>
      )}

      <TouchableOpacity onPress={pickImage}>
        {profile.imageUri ? (
          <Image source={{ uri: profile.imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="camera" size={30} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Name</Text>
          <Text style={styles.detailValue}>{profile.name || 'Not set'}</Text>
          <TouchableOpacity onPress={() => startEditing('name')}>
            <Ionicons name="create-outline" size={20} color={darkViolet} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{profile.email || 'Not set'}</Text>
          <TouchableOpacity onPress={() => startEditing('email')}>
            <Ionicons name="create-outline" size={20} color={darkViolet} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Message</Text>
          <Text style={styles.detailValue}>{profile.bio || 'Not set'}</Text>
          <TouchableOpacity onPress={() => startEditing('bio')}>
            <Ionicons name="create-outline" size={20} color={darkViolet} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={`Enter ${editField}`}
            />
            <TouchableOpacity style={styles.saveButton} onPress={confirmEdit}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#ccc', marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const darkViolet = '#512da8';
const lightViolet = '#d1c4e9';
const backgroundViolet = '#f3e5f5';

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: backgroundViolet },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: darkViolet,
    marginBottom: 10,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: darkViolet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: { backgroundColor: lightViolet },
  detailsContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  detailLabel: { fontSize: 16, fontWeight: 'bold', color: darkViolet },
  detailValue: { fontSize: 16, color: '#333', flex: 1, marginHorizontal: 10 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: darkViolet,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: darkViolet,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
