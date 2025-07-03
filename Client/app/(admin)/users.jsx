import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Switch } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE = 'http://192.168.1.77:1919/api';

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
      <View style={styles.accessDenied}>
        <Ionicons name="shield-outline" size={64} color="#ef4444" />
        <Text style={styles.accessDeniedText}>
          Access denied. Admins only.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>Manage and view all registered users</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : (
          <View style={styles.usersSection}>
            {users.map((userItem) => (
              <View key={userItem._id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userIcon}>
                    <Text style={styles.userInitial}>
                      {(userItem.username || userItem.email).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userItem.username || 'No username'}</Text>
                    <Text style={styles.userEmail}>{userItem.email}</Text>
                    <View style={styles.userRoleContainer}>
                      <View style={[styles.userRole, userItem.isAdmin && styles.adminRole]}>
                        <Text style={[styles.roleText, userItem.isAdmin && styles.adminText]}>
                          {userItem.isAdmin ? 'Administrator' : 'User'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(userItem)}>
                      <Ionicons name="create-outline" size={20} color="#667eea" />
                    </TouchableOpacity>
                    {!userItem.isAdmin && (
                      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(userItem)}>
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="finger-print" size={16} color="#64748b" />
                    <Text style={styles.userDetail}>ID: {userItem._id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="wallet-outline" size={16} color="#64748b" />
                    <Text style={styles.userDetail}>
                      Bank Accounts: {userItem.bankAccounts?.length || 0}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#64748b" />
                    <Text style={styles.userDetail}>
                      Created: {new Date(userItem.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity style={styles.actionCard} onPress={fetchUsers}>
          <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.actionGradient}>
            <Ionicons name="refresh" size={28} color="#fff" />
            <Text style={styles.actionTitle}>Refresh Users</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit User Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={editForm.username}
              onChangeText={text => handleEditChange('username', text)}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editForm.email}
              onChangeText={text => handleEditChange('email', text)}
              keyboardType="email-address"
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Administrator</Text>
              <Switch
                value={editForm.isAdmin}
                onValueChange={val => handleEditChange('isAdmin', val)}
                trackColor={{ false: '#e2e8f0', true: '#667eea' }}
                thumbColor={editForm.isAdmin ? '#fff' : '#f1f5f9'}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalActionBtn, styles.saveBtn]} 
                onPress={handleEditSubmit} 
                disabled={editLoading}
              >
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.modalActionText}>{editLoading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalActionBtn, styles.cancelBtn]} 
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="close-circle-outline" size={20} color="#64748b" />
                <Text style={[styles.modalActionText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  scrollContent: {
    padding: 20,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  accessDeniedText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  usersSection: {
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#667eea',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  userRoleContainer: {
    alignSelf: 'flex-start',
  },
  userRole: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminRole: {
    backgroundColor: '#fef3c7',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  adminText: {
    color: '#d97706',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userDetail: {
    fontSize: 14,
    color: '#64748b',
  },
  actionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#1a202c',
    backgroundColor: '#f8fafc',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveBtn: {
    backgroundColor: '#667eea',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
  },
  modalActionText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
  cancelText: {
    color: '#64748b',
  },
});

export default Users;
