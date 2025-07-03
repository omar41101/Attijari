"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import axios from "axios"
import { useAuth } from "../../context/auth"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

const API_BASE = "http://192.168.1.77:1919/api"

const CreateBankAccount = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({
    accountNumber: "",
    accountType: "",
    balance: "",
    currency: "",
    status: "",
    interestRate: "",
    minimumBalance: "",
    userId: "",
  })
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const router = useRouter()

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      setUsers(res.data)
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers()
    }
  }, [user])

  if (!user?.isAdmin) {
    return (
      <View style={styles.accessDenied}>
        <Ionicons name="shield-outline" size={64} color="#ef4444" />
        <Text style={styles.accessDeniedText}>Access denied. Admins only.</Text>
      </View>
    )
  }

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const handleUserSelect = (userId) => {
    setSelectedUser(userId)
    setForm({ ...form, userId })
  }

  const handleSubmit = async () => {
    if (!form.accountNumber || !form.accountType || form.balance === "" || !form.currency || !form.userId) {
      Alert.alert("Error", "Please fill in all required fields.")
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(
        `${API_BASE}/bankaccounts`,
        {
          ...form,
          balance: Number.parseFloat(form.balance),
          interestRate: form.interestRate ? Number.parseFloat(form.interestRate) : undefined,
          minimumBalance: form.minimumBalance ? Number.parseFloat(form.minimumBalance) : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        },
      )
      Alert.alert("Success", "Bank account created successfully!")
      setForm({
        accountNumber: "",
        accountType: "",
        balance: "",
        currency: "",
        status: "",
        interestRate: "",
        minimumBalance: "",
        userId: selectedUser || "",
      })
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#43e97b", "#38f9d7"]} style={styles.header}>
        <Text style={styles.title}>Create Bank Account</Text>
        <Text style={styles.subtitle}>Select a user to add a bank account</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.adminCard}>
          <Text style={styles.sectionTitle}>All Users</Text>
          {usersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#43e97b" />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : (
            <View style={styles.usersList}>
              {users.map((user) => (
                <View key={user._id} style={styles.userCard}>
                  <View style={styles.userIcon}>
                    <Text style={styles.userInitial}>{(user.username || user.email).charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.username || "No username"}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.userMeta}>
                      <View style={[styles.userRole, user.isAdmin && styles.adminRole]}>
                        <Text style={[styles.roleText, user.isAdmin && styles.adminText]}>
                          {user.isAdmin ? "Admin" : "User"}
                        </Text>
                      </View>
                      <Text style={styles.userAccounts}>Accounts: {user.bankAccounts?.length || 0}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.selectUserButton, selectedUser === user._id && styles.selectUserButtonSelected]}
                    onPress={() => handleUserSelect(user._id)}
                  >
                    <Text
                      style={[
                        styles.selectUserButtonText,
                        selectedUser === user._id && styles.selectUserButtonTextSelected,
                      ]}
                    >
                      {selectedUser === user._id ? "Selected" : "Select"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Create Bank Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Account Number*"
              value={form.accountNumber}
              onChangeText={(text) => handleChange("accountNumber", text)}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Account Type* (e.g., Savings, Checking)"
              value={form.accountType}
              onChangeText={(text) => handleChange("accountType", text)}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Balance*"
              value={form.balance}
              onChangeText={(text) => handleChange("balance", text)}
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Currency* (e.g., USD, EUR)"
              value={form.currency}
              onChangeText={(text) => handleChange("currency", text)}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Status (e.g., Active, Inactive)"
              value={form.status}
              onChangeText={(text) => handleChange("status", text)}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Interest Rate (%)"
              value={form.interestRate}
              onChangeText={(text) => handleChange("interestRate", text)}
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Minimum Balance"
              value={form.minimumBalance}
              onChangeText={(text) => handleChange("minimumBalance", text)}
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="User ID* (Owner of Account)"
              value={form.userId}
              onChangeText={(text) => handleChange("userId", text)}
              editable={false}
              placeholderTextColor="#94a3b8"
            />

            <TouchableOpacity
              style={[styles.actionCard, (!form.userId || loading) && styles.actionCardDisabled]}
              onPress={handleSubmit}
              disabled={loading || !form.userId}
            >
              <LinearGradient
                colors={!form.userId || loading ? ["#94a3b8", "#cbd5e1"] : ["#43e97b", "#38f9d7"]}
                style={styles.actionGradient}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.actionTitle}>{loading ? "Creating..." : "Create Account"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  adminCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 16,
  },
  usersList: {
    marginBottom: 24,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  userIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#43e97b",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userRole: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  adminRole: {
    backgroundColor: "#fef3c7",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  adminText: {
    color: "#d97706",
  },
  userAccounts: {
    fontSize: 12,
    color: "#64748b",
  },
  selectUserButton: {
    backgroundColor: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectUserButtonSelected: {
    backgroundColor: "#43e97b",
    borderColor: "#43e97b",
  },
  selectUserButtonText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  selectUserButtonTextSelected: {
    color: "#fff",
  },
  formSection: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    color: "#1a202c",
  },
  disabledInput: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
  },
  actionCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  actionGradient: {
    padding: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
})

export default CreateBankAccount
