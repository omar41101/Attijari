import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://192.168.0.7:1919/api';

const statusOptions = ['Active', 'Blocked', 'Cancelled'];

const UserCards = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/cards/mycards`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setCards(res.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (cardId, newStatus) => {
    setStatusLoading(true);
    try {
      await axios.put(`${API_BASE}/cards/${cardId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      Alert.alert('Success', 'Card status updated!');
      setStatusModalVisible(false);
      fetchCards();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setStatusLoading(false);
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
            fetchCards();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || error.message);
          }
        }
      }
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FFD700" style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Cards</Text>
      {cards.length === 0 ? (
        <Text style={styles.noCards}>No cards found.</Text>
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
            <Text style={styles.cardDetail}>Linked Account: {card.linkedBankAccount?.accountNumber || 'N/A'}</Text>
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
    marginBottom: 18,
    textAlign: 'center',
  },
  noCards: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
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
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1F71',
    marginBottom: 18,
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

export default UserCards; 