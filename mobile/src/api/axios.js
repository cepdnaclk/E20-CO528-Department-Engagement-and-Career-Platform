import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the machine's local IP address so physical devices running Expo Go can connect.
// If your IP changes, you will need to update this!
const API_URL = 'http://172.20.10.4:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem('token', data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(error.config);
        } catch {
          await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
