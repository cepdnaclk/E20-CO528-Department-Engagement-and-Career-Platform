import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl, Alert } from 'react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get('/feed');
      setPosts(data.posts || data);
    } catch (err) {
      console.log('Feed error:', err.message);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const createPost = async () => {
    if (!content.trim()) return;
    try {
      await api.post('/feed', { content });
      setContent('');
      fetchPosts();
    } catch (err) {
      Alert.alert('Error', 'Could not create post');
    }
  };

  const likePost = async (id) => {
    try {
      await api.post(`/feed/${id}/like`);
      fetchPosts();
    } catch (err) {
      console.log('Like error:', err.message);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(item.author?.name || 'U')[0]}</Text></View>
        <View>
          <Text style={styles.authorName}>{item.author?.name || 'Unknown'}</Text>
          <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => likePost(item._id)}>
          <Text style={styles.actionText}>❤️ {item.likes?.length || 0}</Text>
        </TouchableOpacity>
        <Text style={styles.actionText}>💬 {item.comments?.length || 0}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.composer}>
        <TextInput style={styles.input} placeholder="What's on your mind?" placeholderTextColor="#888" value={content} onChangeText={setContent} multiline />
        <TouchableOpacity style={styles.postBtn} onPress={createPost}>
          <Text style={styles.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6c63ff" />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>No posts yet. Be the first!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  composer: { flexDirection: 'row', padding: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, maxHeight: 80 },
  postBtn: { backgroundColor: '#6c63ff', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  postBtnText: { color: '#fff', fontWeight: '700' },
  card: { margin: 12, marginBottom: 0, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6c63ff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  authorName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  postDate: { color: '#8892b0', fontSize: 12 },
  postContent: { color: '#ccd6f6', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  postActions: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { color: '#8892b0', fontSize: 13 },
  empty: { textAlign: 'center', color: '#8892b0', marginTop: 40, fontSize: 15 },
});
