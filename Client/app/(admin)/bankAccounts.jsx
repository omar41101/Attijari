"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Animated,
} from "react-native"
import axios from "axios"
import { useAuth } from "../../context/auth"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

const API_BASE = "http://192.168.0.7:1919/api"

const AdminBankAccounts = () => {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editAccount, setEditAccount] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const screenWidth = Dimensions.get("window").width
  const isLargeScreen = screenWidth > 700

  useEffect(() => {
    if (user?.isAdmin) fetchAccounts()
  }, [user])

  const fetchAccounts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/bankaccounts`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      setAccounts(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (account) => {
    setEditAccount(account)
    setEditForm({
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: String(account.balance),
      currency: account.currency,
      status: account.status,
      interestRate: account.interestRate ? String(account.interestRate) : "",
      minimumBalance: account.minimumBalance ? String(account.minimumBalance) : "",
    })
    setEditModalVisible(true)
  }

  const handleEditChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value })
  }

  const handleEditSubmit = async () => {
    if (!editAccount) return
    setEditLoading(true)
    try {
      await axios.put(
        `${API_BASE}/bankaccounts/${editAccount._id}`,
        {
          ...editForm,
          balance: Number.parseFloat(editForm.balance),
          interestRate: editForm.interestRate ? Number.parseFloat(editForm.interestRate) : undefined,
          minimumBalance: editForm.minimumBalance ? Number.parseFloat(editForm.minimumBalance) : undefined,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      )
      setEditModalVisible(false)
      setEditAccount(null)
      fetchAccounts()
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteAccount = (account) => {
    Alert.alert("Delete Bank Account", `Are you sure you want to delete account ${account.accountNumber}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleteLoading(true)
          try {
            await axios.delete(`${API_BASE}/bankaccounts/${account._id}`, {
              headers: { Authorization: `Bearer ${user?.token}` },
            })
            fetchAccounts()
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || err.message)
          } finally {
            setDeleteLoading(false)
          }
        },
      },
    ])
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "#10b981"
      case "Blocked":
        return "#f59e0b"
      case "Inactive":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  if (!user?.isAdmin) {
    return (
      <View style={styles.accessDenied}>
        <Ionicons name="shield-outline" size={64} color="#ef4444" />
        <Text style={styles.accessDeniedText}>Access denied. Admins only.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#f093fb", "#f5576c"]} style={styles.header}>
        <Text style={styles.title}>Bank Accounts</Text>
        <Text style={styles.subtitle}>View and manage all bank accounts in the system</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isLargeScreen && {
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "center",
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f093fb" />
            <Text style={styles.loadingText}>Loading accounts...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#94a3b8" />
            <Text style={styles.noAccounts}>No bank accounts found.</Text>
          </View>
        ) : (
          accounts.map((acc) => (
            <Animated.View
              key={acc._id}
              style={[styles.accountBox, isLargeScreen && { width: "46%", marginHorizontal: "2%" }]}
            >
              <LinearGradient colors={["#fff", "#f8fafc"]} style={styles.accountGradient}>
                <View style={styles.accountHeader}>
                  <View style={styles.accountIcon}>
                    <Ionicons name="wallet-outline" size={24} color="#f093fb" />
                  </View>
                  <Text style={styles.accountNumber}>{acc.accountNumber}</Text>
                  <View style={[styles.statusPill, { backgroundColor: getStatusColor(acc.status) + "20" }]}>
                    <Text style={[styles.statusPillText, { color: getStatusColor(acc.status) }]}>{acc.status}</Text>
                  </View>
                </View>

                <View style={styles.balanceSection}>
                  <Text style={styles.balanceLabel}>Current Balance</Text>
                  <Text style={styles.balanceAmount}>
                    {acc.balance} {acc.currency}
                  </Text>
                </View>

                <View style={styles.accountDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="layers-outline" size={16} color="#64748b" />
                    <Text style={styles.accountDetail}>
                      <Text style={styles.detailLabel}>Type:</Text> {acc.accountType}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color="#64748b" />
                    <Text style={styles.accountDetail}>
                      <Text style={styles.detailLabel}>Owner:</Text>{" "}
                      {acc.user?.username || acc.user?.email || acc.user || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                     <Text style={styles.accountDetail}>
                     </Text>
                  </View>
                  <View style={styles.detailRow}>
                   
                  </View>
                </View>

                <View style={styles.accountActionsRow}>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, styles.editBtn, pressed && styles.actionBtnPressed]}
                    onPress={() => openEditModal(acc)}
                  >
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, styles.deleteBtn, pressed && styles.actionBtnPressed]}
                    onPress={() => handleDeleteAccount(acc)}
                    disabled={deleteLoading}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </Animated.View>
          ))
        )}

        {/* Floating Add Account Button */}
        <Pressable style={styles.fab}>
          <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.fabGradient}>
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </Pressable>

        {/* Edit Account Modal */}
        <Modal
          visible={editModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Bank Account</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Account Number"
                value={editForm.accountNumber}
                onChangeText={(text) => handleEditChange("accountNumber", text)}
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={styles.input}
                placeholder="Account Type"
                value={editForm.accountType}
                onChangeText={(text) => handleEditChange("accountType", text)}
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={styles.input}
                placeholder="Balance"
                value={editForm.balance}
                onChangeText={(text) => handleEditChange("balance", text)}
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={styles.input}
                placeholder="Currency"
                value={editForm.currency}
                onChangeText={(text) => handleEditChange("currency", text)}
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={styles.input}
                placeholder="Status (Active, Inactive, etc.)"
                value={editForm.status}
                onChangeText={(text) => handleEditChange("status", text)}
                placeholderTextColor="#94a3b8"
              />
             

              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalActionBtn,
                    styles.saveBtn,
                    pressed && styles.modalActionBtnPressed,
                  ]}
                  onPress={handleEditSubmit}
                  disabled={editLoading}
                >
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.modalActionText}>{editLoading ? "Saving..." : "Save"}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalActionBtn,
                    styles.cancelBtn,
                    pressed && styles.modalActionBtnPressed,
                  ]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#64748b" />
                  <Text style={[styles.modalActionText, styles.cancelText]}>Cancel</Text>
                </Pressable>
              </View>
            </Animated.View>
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
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f8fafc",
  },
  accessDeniedText: {
    fontSize: 18,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
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
  errorContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  error: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  noAccounts: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
  },
  accountBox: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  accountGradient: {
    padding: 20,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  accountIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#fef7ff",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a202c",
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  balanceSection: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a202c",
  },
  accountDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accountDetail: {
    fontSize: 14,
    color: "#64748b",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#1a202c",
  },
  accountActionsRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  editBtn: {
    backgroundColor: "#3b82f6",
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
  },
  actionBtnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 420,
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
  saveBtn: {
    backgroundColor: "#f093fb",
  },
  cancelBtn: {
    backgroundColor: "#f1f5f9",
  },
  modalActionBtnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.8,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cancelText: {
    color: "#64748b",
  },
})

export default AdminBankAccounts
