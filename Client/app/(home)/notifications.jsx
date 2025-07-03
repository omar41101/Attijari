import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.token) {
      setIsLoading(false);
      setError(true);
      console.error("User token not available.");
      return;
    }

    try {
      const response = await axios.get(
        "http://192.168.1.77:1919/api/users/notifications",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err.response?.data || err.message);
      setError(true);
      Alert.alert("Error", "Failed to load notifications. Please try again later.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://192.168.1.77:1919/api/users/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to mark notification as read. Please try again.");
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, item.read ? styles.readNotification : styles.unreadNotification]}
      onPress={() => !item.read && handleMarkAsRead(item._id)}
      disabled={item.read}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {!item.read && (
          <Ionicons name="mail" size={20} color="#FFD700" />
        )}
      </View>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationDate}>{new Date(item.date).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#FFD700" style={styles.loadingIndicator} />
      ) : error ? (
        <Text style={styles.errorMessage}>Failed to load notifications.</Text>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}
        />
      ) : (
        <Text style={styles.noNotificationsMessage}>No notifications to display.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1A1F71',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorMessage: {
    color: '#FF6347',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  noNotificationsMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
  },
  unreadNotification: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  readNotification: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flexShrink: 1, // Allow text to wrap
    marginRight: 10,
  },
  notificationMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
}); 