import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/auth";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === "ios";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignUp = async () => {
    setError("");

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert(
        'Missing Information',
        'Please fill in all fields to continue.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'The passwords you entered do not match. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert(
        'Password Too Short',
        'Password must be at least 6 characters long.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
      };

      console.log("Attempting sign up with:", {
        email: formData.email,
        username: formData.name,
      });

      const response = await axios.post(
        "http://192.168.1.77:1919/api/users",
        userData
      );

      console.log("Sign up successful:", response.data);

      // After successful sign up, automatically sign in the user
      const loginResponse = await axios.post(
        "http://192.168.1.77:1919/api/users/auth",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      console.log("Auto login successful:", loginResponse.data);

      // Sign in the user immediately
      await signIn(loginResponse.data.token, {
        _id: loginResponse.data._id,
        username: loginResponse.data.username,
        email: loginResponse.data.email,
        isAdmin: loginResponse.data.isAdmin,
        token: loginResponse.data.token, // Ensure token is part of user data
      });

      // Navigate immediately
      router.replace("/(home)");

      // Show welcome alert after navigation
      Alert.alert(
        'Welcome! 🎉',
        `Welcome to Fehri Bank, ${formData.name}! Your account has been successfully created and you are now signed in.`,
        [{ text: 'Get Started' }]
      );

    } catch (error) {
      console.error("Sign up error:", error.response?.data || error.message);

      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.response?.status === 409) {
        errorMessage = "An account with this email already exists. Please try signing in instead.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      }

      Alert.alert(
        'Account Creation Failed',
        errorMessage,
        [
          { text: 'Try Again', style: 'default' },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Gradient Background */}
      <LinearGradient
        colors={["#1A1F71", "#2E3192", "#1E3C72"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Abstract Shapes */}
      <View style={styles.shapesContainer}>
        <View style={[styles.shape, styles.shape1]} />
        <View style={[styles.shape, styles.shape2]} />
        <View style={[styles.shape, styles.shape3]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={["#FFD700", "#FFC107"]}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.logoText}>Fehri</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {isIOS ? (
                <BlurView
                  intensity={30}
                  tint="dark"
                  style={styles.blurContainer}
                >
                  <View style={styles.form}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Fehri Bank today</Text>

                    {error ? (
                      <View style={styles.errorContainer}>
                        <Ionicons
                          name="alert-circle"
                          size={16}
                          color="#FF6B6B"
                        />
                        <Text style={styles.error}>{error}</Text>
                      </View>
                    ) : null}

                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Full name"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={formData.name}
                          onChangeText={(text) =>
                            setFormData({ ...formData, name: text })
                          }
                          autoCapitalize="words"
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Email address"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={formData.email}
                          onChangeText={(text) =>
                            setFormData({ ...formData, email: text })
                          }
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Password"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={formData.password}
                          onChangeText={(text) =>
                            setFormData({ ...formData, password: text })
                          }
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeButton}
                        >
                          <Ionicons
                            name={
                              showPassword ? "eye-outline" : "eye-off-outline"
                            }
                            size={20}
                            color="rgba(255,255,255,0.6)"
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Confirm password"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={formData.confirmPassword}
                          onChangeText={(text) =>
                            setFormData({ ...formData, confirmPassword: text })
                          }
                          secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          style={styles.eyeButton}
                        >
                          <Ionicons
                            name={
                              showConfirmPassword
                                ? "eye-outline"
                                : "eye-off-outline"
                            }
                            size={20}
                            color="rgba(255,255,255,0.6)"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleSignUp}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          isLoading ? ["#999", "#777"] : ["#FFD700", "#FFC107"]
                        }
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#1A1F71" size="small" />
                        ) : (
                          <Text style={styles.buttonText}>Create Account</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.termsContainer}>
                      <Text style={styles.termsText}>
                        By creating an account, you agree to our{" "}
                        <Text style={styles.termsLink}>Terms of Service</Text>{" "}
                        and <Text style={styles.termsLink}>Privacy Policy</Text>
                      </Text>
                    </View>

                    <View style={styles.signInContainer}>
                      <Text style={styles.signInText}>
                        Already have an account?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={() => router.push("/(auth)/sign-in")}
                      >
                        <Text style={styles.signInLink}>Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
              ) : (
                <View
                  style={[
                    styles.blurContainer,
                    { backgroundColor: "rgba(20, 25, 75, 0.9)" },
                  ]}
                >
                  <View style={styles.form}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Fehri Bank today</Text>

                    {error ? (
                      <View style={styles.errorContainer}>
                        <Ionicons
                          name="alert-circle"
                          size={16}
                          color="#FF6B6B"
                        />
                        <Text style={styles.error}>{error}</Text>
                      </View>
                    ) : null}

                    <View style={styles.inputContainer}>
                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Full name"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={formData.name}
                          onChangeText={(text) =>
                            setFormData({ ...formData, name: text })
                          }
                          autoCapitalize="words"
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Email address"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={formData.email}
                          onChangeText={(text) =>
                            setFormData({ ...formData, email: text })
                          }
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Password"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={formData.password}
                          onChangeText={(text) =>
                            setFormData({ ...formData, password: text })
                          }
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeButton}
                        >
                          <Ionicons
                            name={
                              showPassword ? "eye-outline" : "eye-off-outline"
                            }
                            size={20}
                            color="rgba(255,255,255,0.6)"
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color="rgba(255,255,255,0.6)"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Confirm password"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={formData.confirmPassword}
                          onChangeText={(text) =>
                            setFormData({ ...formData, confirmPassword: text })
                          }
                          secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          style={styles.eyeButton}
                        >
                          <Ionicons
                            name={
                              showConfirmPassword
                                ? "eye-outline"
                                : "eye-off-outline"
                            }
                            size={20}
                            color="rgba(255,255,255,0.6)"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleSignUp}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          isLoading ? ["#999", "#777"] : ["#FFD700", "#FFC107"]
                        }
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#1A1F71" size="small" />
                        ) : (
                          <Text style={styles.buttonText}>Create Account</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.termsContainer}>
                      <Text style={styles.termsText}>
                        By creating an account, you agree to our{" "}
                        <Text style={styles.termsLink}>Terms of Service</Text>{" "}
                        and <Text style={styles.termsLink}>Privacy Policy</Text>
                      </Text>
                    </View>

                    <View style={styles.signInContainer}>
                      <Text style={styles.signInText}>
                        Already have an account?{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={() => router.push("/(auth)/sign-in")}
                      >
                        <Text style={styles.signInLink}>Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1F71",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  shapesContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  shape: {
    position: "absolute",
    borderRadius: 100,
  },
  shape1: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: "rgba(41, 98, 255, 0.1)",
    top: -width * 0.2,
    right: -width * 0.2,
  },
  shape2: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    bottom: height * 0.2,
    left: -width * 0.2,
  },
  shape3: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    top: height * 0.15,
    right: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    minHeight: height - 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 60, // Offset for back button
  },
  logoGradient: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1F71",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  blurContainer: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  form: {
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 32,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.2)",
  },
  error: {
    color: "#FF6B6B",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#1A1F71",
    fontSize: 18,
    fontWeight: "700",
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#FFD700",
    fontWeight: "500",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  signInLink: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
  },
});
