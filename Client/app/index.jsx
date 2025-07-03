"use client"

import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { Link } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useRef } from "react"
import { Animated, Dimensions, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width, height } = Dimensions.get("window")
const isIOS = Platform.OS === "ios"

export default function LandingPage() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start()

    // Continuous animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 10,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Premium Gradient Background */}
      <LinearGradient
        colors={["#0F0C29", "#24243e", "#302b63", "#0f0c29"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Background Elements */}
      <View style={styles.shapesContainer}>
        <Animated.View style={[styles.shape, styles.shape1, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.shape, styles.shape2, { transform: [{ translateY: floatAnim }] }]} />
        <Animated.View style={[styles.shape, styles.shape3, { transform: [{ scale: pulseAnim }] }]} />
        <View style={[styles.shape, styles.shape4]} />
        <View style={[styles.shape, styles.shape5]} />
        <View style={[styles.shape, styles.shape6]} />
      </View>

      {/* Enhanced Grid Pattern Overlay */}
      <View style={styles.gridOverlay} />

      {/* Floating Particles */}
      <View style={styles.particlesContainer}>
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
        <View style={[styles.particle, styles.particle4]} />
        <View style={[styles.particle, styles.particle5]} />
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={["#FFD700", "#FFA000", "#FF8F00"]}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.logoInner}>
                <Text style={styles.logoText}>F</Text>
                <View style={styles.logoAccent} />
              </View>
            </LinearGradient>
            <Text style={styles.brandName}>
              Fehri <Text style={styles.bankText}>Bank</Text>
            </Text>
            <View style={styles.brandUnderline} />
          </Animated.View>

          <Text style={styles.tagline}>Premium Banking Experience</Text>
          <Text style={styles.subTagline}>Where Innovation Meets Trust</Text>

          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="shield-checkmark" size={18} color="#FFD700" />
              </View>
              <Text style={styles.featureText}>Secure</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="flash" size={18} color="#FFD700" />
              </View>
              <Text style={styles.featureText}>Fast</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="globe-outline" size={18} color="#FFD700" />
              </View>
              <Text style={styles.featureText}>Global</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Card Visual */}
        <Animated.View style={[styles.cardVisualContainer, { transform: [{ translateY: floatAnim }] }]}>
          <View style={styles.cardShadow} />
          <View style={styles.cardVisual}>
            <LinearGradient
              colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardChip} />
                  <View style={styles.cardWifi}>
                    <Ionicons name="wifi" size={20} color="rgba(255,255,255,0.8)" />
                  </View>
                </View>

                <View style={styles.cardMiddle}>
                  <Text style={styles.cardNumber}>•••• •••• •••• 5678</Text>
                  <View style={styles.cardHologram} />
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.cardDetailItem}>
                    <Text style={styles.cardLabel}>CARD HOLDER</Text>
                    <Text style={styles.cardValue}>JOHN DOE</Text>
                  </View>
                  <View style={styles.cardDetailItem}>
                    <Text style={styles.cardLabel}>EXPIRES</Text>
                    <Text style={styles.cardValue}>05/28</Text>
                  </View>
                  <View style={styles.cardDetailItem}>
                    <Text style={styles.cardLabel}>CVV</Text>
                    <Text style={styles.cardValue}>•••</Text>
                  </View>
                </View>
              </View>

              {/* Card Pattern Overlay */}
              <View style={styles.cardPattern} />
            </LinearGradient>
          </View>

          {/* Floating Elements around Card */}
          <View style={styles.floatingElements}>
            <View style={[styles.floatingElement, styles.floatingElement1]}>
              <Ionicons name="card" size={16} color="#FFD700" />
            </View>
            <View style={[styles.floatingElement, styles.floatingElement2]}>
              <Ionicons name="lock-closed" size={14} color="#4CAF50" />
            </View>
            <View style={[styles.floatingElement, styles.floatingElement3]}>
              <Ionicons name="flash" size={12} color="#2196F3" />
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Auth Buttons Container */}
        <View style={styles.authContainer}>
          {isIOS ? (
            <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
              <View style={styles.buttonContainer}>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                    <LinearGradient
                      colors={["#FFD700", "#FFA000", "#FF8F00"]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.buttonContent}>
                        <Ionicons name="log-in-outline" size={20} color="#0F0C29" />
                        <Text style={styles.primaryButtonText}>Sign In</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>

                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                    <View style={styles.secondaryButtonContent}>
                      <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.secondaryButtonText}>Create Account</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              </View>
            </BlurView>
          ) : (
            <View style={[styles.blurContainer, { backgroundColor: "rgba(15, 12, 41, 0.9)" }]}>
              <View style={styles.buttonContainer}>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                    <LinearGradient
                      colors={["#FFD700", "#FFA000", "#FF8F00"]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.buttonContent}>
                        <Ionicons name="log-in-outline" size={20} color="#0F0C29" />
                        <Text style={styles.primaryButtonText}>Sign In</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>

                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                    <View style={styles.secondaryButtonContent}>
                      <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.secondaryButtonText}>Create Account</Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )}
        </View>

        {/* Enhanced Footer */}
        <View style={styles.footer}>
          <View style={styles.securitySection}>
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
              <Text style={styles.securityText}>Bank-Grade Security</Text>
            </View>

            <View style={styles.certificationBadges}>
              <View style={styles.certBadge}>
                <Text style={styles.certText}>SSL</Text>
              </View>
              <View style={styles.certBadge}>
                <Text style={styles.certText}>256-bit</Text>
              </View>
              <View style={styles.certBadge}>
                <Text style={styles.certText}>FDIC</Text>
              </View>
            </View>
          </View>

          <Text style={styles.footerText}>© 2024 Fehri Financial Services, Inc.</Text>
          <Text style={styles.footerSubText}>Licensed & Regulated Banking Institution</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0C29",
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
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    top: -width * 0.3,
    right: -width * 0.3,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.1)",
  },
  shape2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: "rgba(46, 49, 146, 0.12)",
    bottom: height * 0.15,
    left: -width * 0.3,
    borderWidth: 1,
    borderColor: "rgba(46, 49, 146, 0.2)",
  },
  shape3: {
    width: 180,
    height: 180,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    top: height * 0.4,
    right: -40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  shape4: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(255, 160, 0, 0.05)",
    bottom: height * 0.3,
    right: width * 0.2,
  },
  shape5: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(33, 150, 243, 0.08)",
    top: height * 0.25,
    left: width * 0.1,
  },
  shape6: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(76, 175, 80, 0.06)",
    bottom: height * 0.45,
    right: width * 0.8,
  },
  gridOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.3,
    backgroundColor: "transparent",
  },
  particlesContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 215, 0, 0.6)",
  },
  particle1: {
    top: "20%",
    left: "15%",
  },
  particle2: {
    top: "35%",
    right: "20%",
    backgroundColor: "rgba(46, 49, 146, 0.6)",
  },
  particle3: {
    bottom: "30%",
    left: "25%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  particle4: {
    top: "60%",
    right: "15%",
    backgroundColor: "rgba(255, 160, 0, 0.5)",
  },
  particle5: {
    bottom: "45%",
    right: "35%",
    backgroundColor: "rgba(76, 175, 80, 0.4)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoInner: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F0C29",
  },
  logoAccent: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0F0C29",
  },
  brandName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bankText: {
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.9)",
  },
  brandUnderline: {
    width: 60,
    height: 3,
    backgroundColor: "#FFD700",
    borderRadius: 2,
    marginTop: 8,
  },
  tagline: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subTagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    fontWeight: "400",
    letterSpacing: 0.5,
    marginBottom: 24,
    fontStyle: "italic",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  featureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 15,
    fontWeight: "600",
  },
  featureDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 12,
  },
  cardVisualContainer: {
    alignItems: "center",
    marginVertical: 40,
    position: "relative",
  },
  cardShadow: {
    position: "absolute",
    width: width * 0.85,
    height: 220,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    top: 8,
    left: 4,
  },
  cardVisual: {
    width: width * 0.85,
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cardGradient: {
    flex: 1,
    padding: 24,
    position: "relative",
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardChip: {
    width: 48,
    height: 36,
    backgroundColor: "#FFD700",
    borderRadius: 8,
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  cardWifi: {
    opacity: 0.8,
  },
  cardMiddle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  cardNumber: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardHologram: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardDetailItem: {
    flex: 1,
  },
  cardLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cardPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: "transparent",
  },
  floatingElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  floatingElement: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  floatingElement1: {
    top: -10,
    right: 20,
  },
  floatingElement2: {
    bottom: -10,
    left: 30,
  },
  floatingElement3: {
    top: "50%",
    right: -15,
  },
  authContainer: {
    marginBottom: 20,
  },
  blurContainer: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonContainer: {
    padding: 28,
  },
  primaryButton: {
    height: 64,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  primaryButtonText: {
    color: "#0F0C29",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.25)",
    marginBottom: 24,
  },
  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: "center",
  },
  securitySection: {
    alignItems: "center",
    marginBottom: 16,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  securityText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  certificationBadges: {
    flexDirection: "row",
    gap: 12,
  },
  certBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  certText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 4,
  },
  footerSubText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "400",
    fontStyle: "italic",
  },
})
