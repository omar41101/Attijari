import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Switch } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://192.168.100.112:1919/api';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', isAdmin: false });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setUsers(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (userObj) => {
    setEditUser(userObj);
    setEditForm({
      username: userObj.username || '',
      email: userObj.email || '',
      isAdmin: !!userObj.isAdmin,
    });
    setEditModalVisible(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditSubmit = async () => {
    if (!editUser) return;
    setEditLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/users/${editUser._id}`,
        {
          username: editForm.username,
          email: editForm.email,
          isAdmin: editForm.isAdmin,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      Alert.alert('Success', 'User updated successfully!');
      setEditModalVisible(false);
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userObj) => {
    if (userObj.isAdmin) {
      Alert.alert('Error', 'Cannot delete admin user.');
      return;
    }
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userObj.username || userObj.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await axios.delete(`${API_BASE}/users/${userObj._id}`, {
                headers: { Authorization: `Bearer ${user?.token}` },
              });
              Alert.alert('Success', 'User deleted successfully!');
              fetchUsers();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || error.message);
            }
          }
        }
      ]
    );
  };

  if (!user?.isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 18, color: 'red', textAlign: 'center' }}>
          Access denied. Admins only.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.adminCard}>
        <Text style={styles.title}>All Users (Admin)</Text>
        <Text style={styles.subtitle}>Manage and view all registered users</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 16 }} />
        ) : (
          <View style={styles.usersSection}>
            {users.map((userItem) => (
              <View key={userItem._id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userIcon}>
                    <Ionicons name="person" size={24} color="#1A1F71" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userItem.username || 'No username'}</Text>
                    <Text style={styles.userEmail}>{userItem.email}</Text>
                    <View style={styles.userRoleContainer}>
                      <Text style={[styles.userRole, userItem.isAdmin && styles.adminRole]}>
                        {userItem.isAdmin ? 'Administrator' : 'User'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(userItem)}>
                    <Ionicons name="create-outline" size={20} color="#FFD700" />
                  </TouchableOpacity>
                  {!userItem.isAdmin && (
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(userItem)}>
                      <Ionicons name="trash-outline" size={20} color="#FF6347" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userDetail}>ID: {userItem._id}</Text>
                  <Text style={styles.userDetail}>
                    Bank Accounts: {userItem.bankAccounts?.length || 0}
                  </Text>
                  <Text style={styles.userDetail}>
                    Created: {new Date(userItem.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={styles.actionCard} onPress={fetchUsers}>
          <View style={styles.actionIcon}>
            <Ionicons name="refresh" size={32} color="#1A1F71" />
          </View>
          <Text style={styles.actionTitle}>Refresh Users</Text>
        </TouchableOpacity>
      </View>
      {/* Edit User Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={editForm.username}
              onChangeText={text => handleEditChange('username', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editForm.email}
              onChangeText={text => handleEditChange('email', text)}
              keyboardType="email-address"
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Is Admin</Text>
              <Switch
                value={editForm.isAdmin}
                onValueChange={val => handleEditChange('isAdmin', val)}
                trackColor={{ false: '#ccc', true: '#FFD700' }}
                thumbColor={editForm.isAdmin ? '#FFD700' : '#fff'}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={handleEditSubmit} disabled={editLoading}>
                <Ionicons name="save-outline" size={22} color="#1A1F71" />
                <Text style={styles.modalActionText}>{editLoading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={22} color="#1A1F71" />
                <Text style={styles.modalActionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#1A1F71',
    justifyContent: 'center',
  },
  adminCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
  },
  usersSection: {
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  userRoleContainer: {
    alignSelf: 'flex-start',
  },
  userRole: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminRole: {
    color: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  userDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  userDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  editButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 99, 71, 0.08)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1F71',
    borderRadius: 20,
    padding: 28,
    width: '90%',
    maxWidth: 400,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1A1F71',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#FFD700',
    flex: 1,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  modalActionBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  modalActionText: {
    color: '#1A1F71',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 6,
  },
});

export default Users; 