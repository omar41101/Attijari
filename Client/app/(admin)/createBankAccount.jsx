import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://192.168.100.112:1919/api';

const CreateBankAccount = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    accountNumber: '',
    accountType: '',
    balance: '',
    currency: '',
    status: '',
    interestRate: '',
    minimumBalance: '',
    userId: '',
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const router = useRouter();

  if (!user?.isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 18, color: 'red', textAlign: 'center' }}>
          Access denied. Admins only.
        </Text>
      </View>
    );
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
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
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setForm({ ...form, userId });
  };

  const handleSubmit = async () => {
    if (!form.accountNumber || !form.accountType || form.balance === '' || !form.currency || !form.userId) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/bankaccounts`,
        {
          ...form,
          balance: parseFloat(form.balance),
          interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
          minimumBalance: form.minimumBalance ? parseFloat(form.minimumBalance) : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      Alert.alert('Success', 'Bank account created successfully!');
      setForm({
        accountNumber: '',
        accountType: '',
        balance: '',
        currency: '',
        status: '',
        interestRate: '',
        minimumBalance: '',
        userId: selectedUser || '',
      });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.adminCard}>
        <Text style={styles.title}>Create Bank Account (Admin)</Text>
        <Text style={styles.subtitle}>Select a user to add a bank account:</Text>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>All Users</Text>
          {usersLoading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 16 }} />
          ) : (
            <View style={styles.usersList}>
              {users.map((user) => (
                <View key={user._id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.username || 'No username'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.userMeta}>
                      <Text style={styles.userRole}>{user.isAdmin ? 'Admin' : 'User'}</Text>
                      <Text style={styles.userAccounts}>Accounts: {user.bankAccounts?.length || 0}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.selectUserButton,
                      selectedUser === user._id && styles.selectUserButtonSelected,
                    ]}
                    onPress={() => handleUserSelect(user._id)}
                  >
                    <Text style={styles.selectUserButtonText}>
                      {selectedUser === user._id ? 'Selected' : 'Select'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.sectionTitle}>Create Bank Account</Text>
          <TextInput
            style={styles.input}
            placeholder="Account Number*"
            value={form.accountNumber}
            onChangeText={text => handleChange('accountNumber', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Account Type* (e.g., Savings, Checking)"
            value={form.accountType}
            onChangeText={text => handleChange('accountType', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Balance*"
            value={form.balance}
            onChangeText={text => handleChange('balance', text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Currency* (e.g., USD, EUR)"
            value={form.currency}
            onChangeText={text => handleChange('currency', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Status (e.g., Active, Inactive)"
            value={form.status}
            onChangeText={text => handleChange('status', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Interest Rate (%)"
            value={form.interestRate}
            onChangeText={text => handleChange('interestRate', text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Minimum Balance"
            value={form.minimumBalance}
            onChangeText={text => handleChange('minimumBalance', text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="User ID* (Owner of Account)"
            value={form.userId}
            onChangeText={text => handleChange('userId', text)}
            editable={false}
          />
          <TouchableOpacity
            style={[styles.actionCard, (!form.userId || loading) && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading || !form.userId}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle-outline" size={32} color="#1A1F71" />
            </View>
            <Text style={styles.actionTitle}>{loading ? 'Creating...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    marginBottom: 8,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
  },
  formSection: {
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 16,
  },
  usersList: {
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  userRole: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
  },
  userAccounts: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  selectUserButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectUserButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectUserButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
    marginTop: 8,
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
});

export default CreateBankAccount; 