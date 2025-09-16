"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native"
import axios from "axios"
import { useAuth } from "../../context/auth"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

const API_BASE = "http://192.168.0.7:1919/api"

const AdminCards = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createForm, setCreateForm] = useState({
    cardNumber: "",
    cardType: "",
    expiryDate: "",
    cvv: "",
    linkedBankAccount: "",
  })
  const [bankAccounts, setBankAccounts] = useState([])
  const [createLoading, setCreateLoading] = useState(false)
  const statusOptions = ["Active", "Blocked", "Cancelled"]
  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchCards(selectedUser)
      fetchBankAccounts(selectedUser)
    } else {
      setCards([])
      setBankAccounts([])
    }
  }, [selectedUser])

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      setUsers(res.data)
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message)
    }
  }

  const fetchCards = async (userId) => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/cards?userId=${userId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      setCards(res.data)
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBankAccounts = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/bankaccounts?userId=${userId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      setBankAccounts(res.data)
    } catch (error) {
      setBankAccounts([])
    }
  }

  const handleCreateCard = async () => {
    if (
      !selectedUser ||
      !createForm.cardNumber ||
      !createForm.cardType ||
      !createForm.expiryDate ||
      !createForm.cvv ||
      !createForm.linkedBankAccount
    ) {
      Alert.alert("Error", "Please fill in all fields.")
      return
    }
    setCreateLoading(true)
    try {
      await axios.post(
        `${API_BASE}/cards`,
        {
          userId: selectedUser,
          cardNumber: createForm.cardNumber,
          cardType: createForm.cardType,
          expiryDate: createForm.expiryDate,
          cvv: createForm.cvv,
          linkedBankAccount: createForm.linkedBankAccount,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      )
      Alert.alert("Success", "Card created!")
      setCreateModalVisible(false)
      setCreateForm({ cardNumber: "", cardType: "", expiryDate: "", cvv: "", linkedBankAccount: "" })
      fetchCards(selectedUser)
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteCard = async (cardId) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/cards/${cardId}`, {
              headers: { Authorization: `Bearer ${user?.token}` },
            })
            Alert.alert("Success", "Card deleted!")
            fetchCards(selectedUser)
          } catch (error) {
            Alert.alert("Error", error.response?.data?.message || error.message)
          }
        },
      },
    ])
  }

  const handleStatusChange = async (cardId, newStatus) => {
    setStatusLoading(true)
    try {
      await axios.put(
        `${API_BASE}/cards/${cardId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      )
      Alert.alert("Success", "Card status updated!")
      setStatusModalVisible(false)
      fetchCards(selectedUser)
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message)
    } finally {
      setStatusLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "#10b981"
      case "Blocked":
        return "#f59e0b"
      case "Cancelled":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  const getCardTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "credit":
        return "card"
      case "debit":
        return "card-outline"
      case "prepaid":
        return "wallet"
      default:
        return "card-outline"
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.header}>
        <Text style={styles.title}>Card Management</Text>
        <Text style={styles.subtitle}>Select a user to view and manage their cards</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.userSelectSection}>
          <Text style={styles.userSelectTitle}>Choose User</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userScrollView}>
            {users.map((u) => (
              <TouchableOpacity
                key={u._id}
                style={[styles.userButton, selectedUser === u._id && styles.userButtonSelected]}
                onPress={() => setSelectedUser(u._id)}
              >
                <View style={styles.userButtonIcon}>
                  <Ionicons name="person" size={16} color={selectedUser === u._id ? "#fff" : "#4facfe"} />
                </View>
                <Text style={[styles.userButtonText, selectedUser === u._id && styles.userButtonTextSelected]}>
                  {u.username || u.email || u._id}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedUser && (
          <>
            <TouchableOpacity style={styles.createBtn} onPress={() => setCreateModalVisible(true)}>
              <LinearGradient colors={["#43e97b", "#38f9d7"]} style={styles.createBtnGradient}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.createBtnText}>Create Card</Text>
              </LinearGradient>
            </TouchableOpacity>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4facfe" />
                <Text style={styles.loadingText}>Loading cards...</Text>
              </View>
            ) : cards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="card-outline" size={64} color="#94a3b8" />
                <Text style={styles.noCards}>No cards found for this user.</Text>
              </View>
            ) : (
              cards.map((card) => (
                <View key={card._id} style={styles.cardBox}>
                  <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.cardGradient}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIcon}>
                        <Ionicons name={getCardTypeIcon(card.cardType)} size={24} color="#fff" />
                      </View>
                      <Text style={styles.cardType}>{card.cardType}</Text>
                      <View style={[styles.cardStatusBadge, { backgroundColor: getStatusColor(card.status) + "30" }]}>
                        <Text style={[styles.cardStatus, { color: getStatusColor(card.status) }]}>{card.status}</Text>
                      </View>
                    </View>

                    <View style={styles.cardDetails}>
                      <Text style={styles.cardNumber}>**** **** **** {card.cardNumber.slice(-4)}</Text>
                      <View style={styles.cardMeta}>
                        <View style={styles.cardMetaItem}>
                          <Text style={styles.cardMetaLabel}>Expires</Text>
                          <Text style={styles.cardMetaValue}>{card.expiryDate}</Text>
                        </View>
                        <View style={styles.cardMetaItem}>
                          <Text style={styles.cardMetaLabel}>Account</Text>
                          <Text style={styles.cardMetaValue}>
                            {card.linkedBankAccount?.accountNumber || card.linkedBankAccount || "N/A"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedCard(card)
                        setStatusModalVisible(true)
                      }}
                    >
                      <Ionicons name="settings-outline" size={18} color="#4facfe" />
                      <Text style={styles.actionText}>Change Status</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteActionButton]}
                      onPress={() => handleDeleteCard(card._id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      <Text style={[styles.actionText, styles.deleteActionText]}>Delete</Text>
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Card</Text>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={createForm.cardNumber}
                onChangeText={(text) => setCreateForm({ ...createForm, cardNumber: text })}
                keyboardType="numeric"
                maxLength={16}
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={styles.input}
                placeholder="Card Type (Debit, Credit, Prepaid)"
                value={createForm.cardType}
                onChangeText={(text) => setCreateForm({ ...createForm, cardType: text })}
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={styles.input}
                placeholder="Expiry Date (MM/YY)"
                value={createForm.expiryDate}
                onChangeText={(text) => setCreateForm({ ...createForm, expiryDate: text })}
                maxLength={5}
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={styles.input}
                placeholder="CVV"
                value={createForm.cvv}
                onChangeText={(text) => setCreateForm({ ...createForm, cvv: text })}
                keyboardType="numeric"
                maxLength={4}
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.inputLabel}>Linked Bank Account</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountScrollView}>
                {bankAccounts.map((acc) => (
                  <TouchableOpacity
                    key={acc._id}
                    style={[
                      styles.accountButton,
                      createForm.linkedBankAccount === acc._id && styles.accountButtonSelected,
                    ]}
                    onPress={() => setCreateForm({ ...createForm, linkedBankAccount: acc._id })}
                  >
                    <Text
                      style={[
                        styles.accountButtonText,
                        createForm.linkedBankAccount === acc._id && styles.accountButtonTextSelected,
                      ]}
                    >
                      {acc.accountNumber} | {acc.accountType} | {acc.currency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionBtn, styles.createActionBtn]}
                  onPress={handleCreateCard}
                  disabled={createLoading}
                >
                  <Ionicons name="save-outline" size={18} color="#fff" />
                  <Text style={styles.modalActionText}>{createLoading ? "Creating..." : "Create"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionBtn, styles.cancelActionBtn]}
                  onPress={() => setCreateModalVisible(false)}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#64748b" />
                  <Text style={[styles.modalActionText, styles.cancelActionText]}>Cancel</Text>
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Card Status</Text>
                <TouchableOpacity onPress={() => setStatusModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.statusOption, selectedCard?.status === opt && styles.selectedStatus]}
                  onPress={() => handleStatusChange(selectedCard._id, opt)}
                  disabled={statusLoading}
                >
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(opt) }]} />
                  <Text style={[styles.statusOptionText, selectedCard?.status === opt && styles.selectedStatusText]}>
                    {opt}
                  </Text>
                  {selectedCard?.status === opt && (
                    <Ionicons name="checkmark-circle" size={20} color={getStatusColor(opt)} />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setStatusModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  scrollContent: {
    padding: 20,
  },
  userSelectSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userSelectTitle: {
    color: "#1a202c",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  userScrollView: {
    marginBottom: 8,
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  userButtonSelected: {
    backgroundColor: "#4facfe",
    borderColor: "#4facfe",
  },
  userButtonIcon: {
    marginRight: 8,
  },
  userButtonText: {
    color: "#64748b",
    fontWeight: "500",
    fontSize: 14,
  },
  userButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  createBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  noCards: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
  },
  cardBox: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardType: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  cardStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDetails: {
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: 2,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardMetaItem: {
    flex: 1,
  },
  cardMetaLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  cardMetaValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#f8fafc",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    gap: 6,
  },
  deleteActionButton: {
    backgroundColor: "#fef2f2",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4facfe",
  },
  deleteActionText: {
    color: "#ef4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a202c",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#f8fafc",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 16,
    color: "#1a202c",
  },
  inputLabel: {
    color: "#1a202c",
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
    fontSize: 16,
  },
  accountScrollView: {
    marginBottom: 16,
  },
  accountButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  accountButtonSelected: {
    backgroundColor: "#4facfe",
    borderColor: "#4facfe",
  },
  accountButtonText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  accountButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  createActionBtn: {
    backgroundColor: "#4facfe",
  },
  cancelActionBtn: {
    backgroundColor: "#f1f5f9",
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cancelActionText: {
    color: "#64748b",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedStatus: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
    flex: 1,
  },
  selectedStatusText: {
    color: "#1a202c",
    fontWeight: "600",
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  cancelText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default AdminCards
