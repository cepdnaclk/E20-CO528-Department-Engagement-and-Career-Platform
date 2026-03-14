import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setProfile(data);
        setBio(data.bio || '');
        setSkills((data.skills || []).join(', '));
      } catch (err) {
        console.log('Profile error:', err.message);
      }
    })();
  }, []);

  const saveProfile = async () => {
    try {
      const { data } = await api.put('/auth/profile', {
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setProfile(data);
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (err) {
      Alert.alert('Error', 'Could not update profile');
    }
  };

  const p = profile || user;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}><Text style={styles.avatarLargeText}>{(p?.name || 'U')[0]}</Text></View>
        <Text style={styles.name}>{p?.name}</Text>
        <Text style={styles.email}>{p?.email}</Text>
        <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>{p?.role}</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bio</Text>
        {editing ? (
          <TextInput style={styles.input} value={bio} onChangeText={setBio} multiline placeholder="Tell us about yourself..." placeholderTextColor="#888" />
        ) : (
          <Text style={styles.bioText}>{p?.bio || 'No bio yet'}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {editing ? (
          <TextInput style={styles.input} value={skills} onChangeText={setSkills} placeholder="React, Node.js, Python..." placeholderTextColor="#888" />
        ) : (
          <View style={styles.skillsRow}>
            {(p?.skills || []).map((s, i) => (
              <View key={i} style={styles.skillBadge}><Text style={styles.skillText}>{s}</Text></View>
            ))}
            {(!p?.skills || p.skills.length === 0) && <Text style={styles.bioText}>No skills listed</Text>}
          </View>
        )}
      </View>

      {p?.registrationNumber && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Registration</Text>
          <Text style={styles.bioText}>{p.registrationNumber}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {editing ? (
          <>
            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}><Text style={styles.saveBtnText}>Save Changes</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}><Text style={styles.editBtnText}>Edit Profile</Text></TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Text style={styles.logoutBtnText}>Logout</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  header: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6c63ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLargeText: { color: '#fff', fontWeight: '800', fontSize: 32 },
  name: { fontSize: 22, fontWeight: '700', color: '#fff' },
  email: { fontSize: 14, color: '#8892b0', marginTop: 2 },
  roleBadge: { backgroundColor: 'rgba(108,99,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  roleBadgeText: { color: '#6c63ff', fontWeight: '600', textTransform: 'capitalize' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  bioText: { fontSize: 14, color: '#8892b0', lineHeight: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: 'rgba(108,99,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  skillText: { color: '#6c63ff', fontSize: 13, fontWeight: '600' },
  actions: { gap: 10, marginTop: 8, marginBottom: 30 },
  editBtn: { backgroundColor: 'rgba(108,99,255,0.2)', borderRadius: 12, padding: 14, alignItems: 'center' },
  editBtnText: { color: '#6c63ff', fontWeight: '700' },
  saveBtn: { backgroundColor: '#6c63ff', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  cancelBtnText: { color: '#8892b0', fontWeight: '600' },
  logoutBtn: { backgroundColor: 'rgba(231,76,60,0.15)', borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutBtnText: { color: '#e74c3c', fontWeight: '700' },
});
