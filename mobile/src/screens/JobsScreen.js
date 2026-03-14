import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function JobsScreen() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(data.jobs || data);
    } catch (err) {
      console.log('Jobs error:', err.message);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const applyForJob = async (id) => {
    try {
      await api.post(`/jobs/${id}/apply`, { coverLetter: 'I am interested in this position.' });
      Alert.alert('Success', 'Application submitted!');
      fetchJobs();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not apply');
    }
  };

  const renderJob = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{item.type || 'Job'}</Text></View>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.company}>{item.company}</Text>
      <Text style={styles.location}>📍 {item.location || 'Remote'}</Text>
      {item.salary && <Text style={styles.salary}>💰 {item.salary}</Text>}
      <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
      {item.deadline && <Text style={styles.deadline}>📅 Deadline: {new Date(item.deadline).toLocaleDateString()}</Text>}
      {user?.role === 'student' && (
        <TouchableOpacity style={styles.applyBtn} onPress={() => applyForJob(item._id)}>
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        renderItem={renderJob}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchJobs(); setRefreshing(false); }} tintColor="#6c63ff" />}
        contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>No job listings available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(108,99,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  typeBadgeText: { color: '#6c63ff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  jobTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  company: { fontSize: 15, color: '#6c63ff', fontWeight: '600', marginBottom: 6 },
  location: { fontSize: 13, color: '#8892b0', marginBottom: 4 },
  salary: { fontSize: 13, color: '#64ffda', marginBottom: 8 },
  description: { fontSize: 13, color: '#8892b0', lineHeight: 19, marginBottom: 8 },
  deadline: { fontSize: 12, color: '#e74c3c', marginBottom: 12 },
  applyBtn: { backgroundColor: '#6c63ff', borderRadius: 10, padding: 12, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { textAlign: 'center', color: '#8892b0', marginTop: 40, fontSize: 15 },
});
