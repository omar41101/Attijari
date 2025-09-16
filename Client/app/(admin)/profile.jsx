import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../../services/api"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useAuth } from "../../context/auth"

export default function ProfilePage() {
  const { user, signOut, signIn } = useAuth()
  const router = useRouter()

  console.log("ProfilePage - Current User from AuthContext:", user)

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    console.log("ProfilePage - useEffect updating formData with user:", user)
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    })
  }, [user])

  const handleUpdateProfile = async () => {
    if (!formData.username || !formData.email) {
      Alert.alert("Missing Information", "Please fill in username and email fields.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.")
      return
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        Alert.alert("Password Too Short", "Password must be at least 6 characters long.")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert("Password Mismatch", "The passwords you entered do not match.")
        return
      }
    }

    setIsLoading(true)

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      console.log("ProfilePage - Sending updateData:", updateData)
      console.log("ProfilePage - Using token from AuthContext:", user?.token)

      const response = await api.put("/users/profile", updateData)

      console.log("Profile update successful - Response Data:", response.data)

      const updatedUser = {
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        isAdmin: response.data.isAdmin,
        token: user.token, // Retain the existing token unless the server provides a new one
      }

      console.log("ProfilePage - Constructed updatedUser:", updatedUser)

      // Update AsyncStorage with the full user object
      await AsyncStorage.setItem("authToken", JSON.stringify(updatedUser))

      // Update AuthContext with the full user object
      await signIn(updatedUser) // Pass the full object, not just the token

      Alert.alert(
        "Profile Updated! 🎉",
        "Your profile has been successfully updated.",
        [
          {
            text: "OK",
            onPress: () => {
              setFormData((prev) => ({
                ...prev,
                password: "",
                confirmPassword: "",
              }))
            },
          },
        ]
      )
    } catch (error) {
      console.error("Profile update error:", error.response?.data || error.message)

      let errorMessage = "Failed to update profile. Please try again."

      if (error.response?.status === 409) {
        errorMessage = "An account with this email already exists."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      Alert.alert("Update Failed", errorMessage, [{ text: "OK" }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await signOut()
              if (result.success) {
                Alert.alert(
                  "Signed Out",
                  "You have been successfully signed out.",
                  [{ text: "OK", onPress: () => router.replace("/landing") }]
                )
              } else {
                Alert.alert("Error", "Failed to sign out. Please try again.", [{ text: "OK" }])
              }
            } catch (error) {
              console.error("Sign out error:", error)
              Alert.alert("Error", "An unexpected error occurred. Please try again.", [{ text: "OK" }])
            }
          },
        },
      ]
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile Settings</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.userInfoSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.username || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
        <Text style={styles.userRole}>{user?.isAdmin ? "Administrator" : "User"}</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Update Profile</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={formData.username}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, username: text }))}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={formData.email}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password (optional)</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Enter new password"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={formData.password}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="rgba(255, 255, 255, 0.5)"
              />
            </TouchableOpacity>
          </View>
        </View>

        {formData.password ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm new password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: text }))
                }
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color="rgba(255, 255, 255, 0.5)"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
          onPress={handleUpdateProfile}
          disabled={isLoading}
        >
          <Text style={styles.updateButtonText}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1F71",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  signOutButton: {
    padding: 8,
  },
  userInfoSection: {
    alignItems: "center",
    padding: 20,
    paddingTop: 0,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: "#FFD700",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A1F71",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontStyle: "italic",
  },
  formSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  updateButton: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: "#1A1F71",
    fontSize: 18,
    fontWeight: "600",
  },
})