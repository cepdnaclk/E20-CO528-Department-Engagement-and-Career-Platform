import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import api from '../api/axios';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data.events || data);
    } catch (err) {
      console.log('Events error:', err.message);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const rsvp = async (id) => {
    try {
      await api.post(`/events/${id}/rsvp`);
      Alert.alert('Success', 'RSVP confirmed!');
      fetchEvents();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not RSVP');
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'workshop': return '🛠️';
      case 'hackathon': return '💻';
      case 'seminar': return '📚';
      case 'meetup': return '🤝';
      default: return '📅';
    }
  };

  const renderEvent = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.icon}>{getEventIcon(item.type)}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.organizer}>by {item.organizer?.name || 'Unknown'}</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.details}>
        <Text style={styles.detail}>📅 {new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.detail}>📍 {item.location}</Text>
        <Text style={styles.detail}>👥 {item.rsvps?.length || 0} attending</Text>
      </View>
      <TouchableOpacity style={styles.rsvpBtn} onPress={() => rsvp(item._id)}>
        <Text style={styles.rsvpBtnText}>RSVP</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchEvents(); setRefreshing(false); }} tintColor="#6c63ff" />}
        contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>No upcoming events</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  icon: { fontSize: 32 },
  eventTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  organizer: { fontSize: 13, color: '#6c63ff' },
  description: { fontSize: 13, color: '#8892b0', lineHeight: 19, marginBottom: 10 },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  detail: { fontSize: 12, color: '#ccd6f6' },
  rsvpBtn: { backgroundColor: '#6c63ff', borderRadius: 10, padding: 12, alignItems: 'center' },
  rsvpBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { textAlign: 'center', color: '#8892b0', marginTop: 40, fontSize: 15 },
});
