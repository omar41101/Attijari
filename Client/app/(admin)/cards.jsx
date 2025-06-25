import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Picker } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://192.168.100.112:1919/api';

const AdminCards = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm, setCreateForm] = useState({
    cardNumber: '',
    cardType: '',
    expiryDate: '',
    cvv: '',
    linkedBankAccount: '',
  });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const statusOptions = ['Active', 'Blocked', 'Cancelled'];
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchCards(selectedUser);
      fetchBankAccounts(selectedUser);
    } else {
      setCards([]);
      setBankAccounts([]);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setUsers(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    }
  };

  const fetchCards = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/cards?userId=${userId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setCards(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/bankaccounts?userId=${userId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setBankAccounts(res.data);
    } catch (error) {
      setBankAccounts([]);
    }
  };

  const handleCreateCard = async () => {
    console.log('DEBUG:', {
      selectedUser,
      cardNumber: createForm.cardNumber,
      cardType: createForm.cardType,
      expiryDate: createForm.expiryDate,
      cvv: createForm.cvv,
      linkedBankAccount: createForm.linkedBankAccount,
    });
    if (!selectedUser || !createForm.cardNumber || !createForm.cardType || !createForm.expiryDate || !createForm.cvv || !createForm.linkedBankAccount) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setCreateLoading(true);
    try {
      await axios.post(`${API_BASE}/cards`, {
        userId: selectedUser,
        cardNumber: createForm.cardNumber,
        cardType: createForm.cardType,
        expiryDate: createForm.expiryDate,
        cvv: createForm.cvv,
        linkedBankAccount: createForm.linkedBankAccount,
      }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      Alert.alert('Success', 'Card created!');
      setCreateModalVisible(false);
      setCreateForm({ cardNumber: '', cardType: '', expiryDate: '', cvv: '', linkedBankAccount: '' });
      fetchCards(selectedUser);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/cards/${cardId}`, {
              headers: { Authorization: `Bearer ${user?.token}` },
            });
            Alert.alert('Success', 'Card deleted!');
            fetchCards(selectedUser);
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || error.message);
          }
        }
      }
    ]);
  };

  const handleStatusChange = async (cardId, newStatus) => {
    setStatusLoading(true);
    try {
      await axios.put(`${API_BASE}/cards/${cardId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      Alert.alert('Success', 'Card status updated!');
      setStatusModalVisible(false);
      fetchCards(selectedUser);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setStatusLoading(false);
    }
  };

  console.log('BANK ACCOUNTS:', bankAccounts);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin: Card Management</Text>
      <Text style={styles.subtitle}>Select a user to view and manage their cards</Text>
      <View style={styles.userSelectSection}>
        <Text style={styles.userSelectTitle}>Choose User</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {users.map(u => (
            <TouchableOpacity
              key={u._id}
              style={[styles.userButton, selectedUser === u._id && styles.userButtonSelected]}
              onPress={() => setSelectedUser(u._id)}
            >
              <Ionicons name="person" size={18} color={selectedUser === u._id ? '#fff' : '#1A1F71'} style={{ marginRight: 6 }} />
              <Text style={[styles.userButtonText, selectedUser === u._id && { color: '#fff', fontWeight: 'bold' }]}>{u.username || u.email || u._id}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {selectedUser && (
        <>
          <TouchableOpacity style={styles.createBtn} onPress={() => setCreateModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={22} color="#1A1F71" />
            <Text style={styles.createBtnText}>Create Card</Text>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />
          ) : cards.length === 0 ? (
            <Text style={styles.noCards}>No cards found for this user.</Text>
          ) : (
            cards.map(card => (
              <View key={card._id} style={styles.cardBox}>
                <View style={styles.cardHeader}>
                  <Ionicons name="card-outline" size={28} color="#FFD700" />
                  <Text style={styles.cardType}>{card.cardType}</Text>
                  <Text style={[styles.cardStatus, { color: card.status === 'Active' ? '#4CAF50' : card.status === 'Blocked' ? '#FFA500' : '#FF6347' }]}>{card.status}</Text>
                </View>
                <Text style={styles.cardNumber}>Card: **** **** **** {card.cardNumber.slice(-4)}</Text>
                <Text style={styles.cardDetail}>Expiry: {card.expiryDate}</Text>
                <Text style={styles.cardDetail}>Linked Account: {card.linkedBankAccount?.accountNumber || card.linkedBankAccount || 'N/A'}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedCard(card); setStatusModalVisible(true); }}>
                    <Ionicons name="settings-outline" size={20} color="#1A1F71" />
                    <Text style={styles.actionText}>Change Status</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255,99,71,0.08)' }]} onPress={() => handleDeleteCard(card._id)}>
                    <Ionicons name="trash-outline" size={20} color="#FF6347" />
                    <Text style={[styles.actionText, { color: '#FF6347' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </>
      )}
      {/* Create Card Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Card</Text>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              value={createForm.cardNumber}
              onChangeText={text => setCreateForm({ ...createForm, cardNumber: text })}
              keyboardType="numeric"
              maxLength={16}
            />
            <TextInput
              style={styles.input}
              placeholder="Card Type (Debit, Credit, Prepaid)"
              value={createForm.cardType}
              onChangeText={text => setCreateForm({ ...createForm, cardType: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Expiry Date (MM/YY)"
              value={createForm.expiryDate}
              onChangeText={text => setCreateForm({ ...createForm, expiryDate: text })}
              maxLength={5}
            />
            <TextInput
              style={styles.input}
              placeholder="CVV"
              value={createForm.cvv}
              onChangeText={text => setCreateForm({ ...createForm, cvv: text })}
              keyboardType="numeric"
              maxLength={4}
            />
            <Text style={styles.inputLabel}>Linked Bank Account</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {bankAccounts.map(acc => (
                <TouchableOpacity
                  key={acc._id}
                  style={[styles.userButton, createForm.linkedBankAccount === acc._id && styles.userButtonSelected]}
                  onPress={() => setCreateForm({ ...createForm, linkedBankAccount: acc._id })}
                >
                  <Text style={styles.userButtonText}>
                    {acc.accountNumber} | {acc.accountType} | {acc.currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={handleCreateCard} disabled={createLoading}>
                <Ionicons name="save-outline" size={20} color="#1A1F71" />
                <Text style={styles.modalActionText}>{createLoading ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={20} color="#1A1F71" />
                <Text style={styles.modalActionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Status Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Card Status</Text>
            {statusOptions.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.statusOption, selectedCard?.status === opt && styles.selectedStatus]}
                onPress={() => handleStatusChange(selectedCard._id, opt)}
                disabled={statusLoading}
              >
                <Text style={styles.statusOptionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setStatusModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
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
    minHeight: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
    textAlign: 'center',
  },
  userSelectSection: {
    marginBottom: 18,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  userSelectTitle: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 80,
  },
  userButtonSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  userButtonText: {
    color: '#1A1F71',
    fontWeight: '500',
    fontSize: 15,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 16,
    marginRight: 10,
  },
  createBtnText: {
    color: '#1A1F71',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 6,
  },
  noCards: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  cardBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardNumber: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  actionText: {
    color: '#1A1F71',
    fontWeight: 'bold',
    marginLeft: 6,
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
  inputLabel: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 4,
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
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#eee',
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectedStatus: {
    backgroundColor: '#FFD700',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#1A1F71',
    fontWeight: 'bold',
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#FFD700',
  },
  cancelText: {
    color: '#1A1F71',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminCards; 