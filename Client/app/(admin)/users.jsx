import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import api from "../../services/api";
const users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for add/edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add or Update user
  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Update
        await api.put(`/users/${editingUser._id}`, { username, email });
        Alert.alert("✅ Updated", "User updated successfully");
      } else {
        // Create
        await api.post("/users", { username, email, password: "123456" });
        Alert.alert("✅ Added", "User created successfully");
      }
      setModalVisible(false);
      setEditingUser(null);
      setUsername("");
      setEmail("");
      fetchUsers();
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error", err.response?.data?.error || "Something went wrong");
    }
  };

  // ✅ Delete user
  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      Alert.alert("🗑️ Deleted", "User removed successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error", "Could not delete user");
    }
  };

  // Open modal for edit
  const openEditModal = (user) => {
    setEditingUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Add user button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingUser(null);
          setUsername("");
          setEmail("");
          setModalVisible(true);
        }}
      >
        <Text style={styles.addText}>➕ Add User</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Text style={styles.edit}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteUser(item._id)}>
                <Text style={styles.delete}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal for Add/Edit */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? "Edit User" : "Add User"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUser}>
                <Text style={styles.saveText}>💾 Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ✅ Styles (inspired by your old UI)
const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginVertical: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  edit: {
    marginRight: 16,
    color: "#007BFF",
    fontWeight: "600",
  },
  delete: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    margin: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  addText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelBtn: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  cancelText: {
    color: "#000",
    fontWeight: "600",
  },
});

export default users;
