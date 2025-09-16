import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { Link } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useRef } from "react"
import { Animated, Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width, height } = Dimensions.get("window")
const isIOS = Platform.OS === "ios"

export default function LandingPage() {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 15000,
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
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 8,
          duration: 2500,
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
      <LinearGradient
        colors={["#0F0C29", "#24243e", "#302b63", "#0f0c29"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.shapesContainer}>
        <Animated.View style={[styles.shape, styles.shape1, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.shape, styles.shape2, { transform: [{ translateY: floatAnim }] }]} />
        <Animated.View style={[styles.shape, styles.shape3, { transform: [{ scale: pulseAnim }] }]} />
        <View style={[styles.shape, styles.shape4]} />
        <View style={[styles.shape, styles.shape5]} />
        <View style={[styles.shape, styles.shape6]} />
      </View>
      <View style={styles.gridOverlay} />
      <View style={styles.particlesContainer}>
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
        <View style={[styles.particle, styles.particle4]} />
        <View style={[styles.particle, styles.particle5]} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
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
                E-Bank <Text style={styles.bankText}>Bank</Text>
              </Text>
              <View style={styles.brandUnderline} />
            </Animated.View>
            <Text style={styles.tagline}>Premium Banking Experience</Text>
            <Text style={styles.subTagline}>Where Innovation Meets Trust</Text>
            <View style={styles.featureRow}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="shield-checkmark" size={14} color="#FFD700" />
                </View>
                <Text style={styles.featureText}>Secure</Text>
              </View>
              <View style={styles.featureDivider} />
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="flash" size={14} color="#FFD700" />
                </View>
                <Text style={styles.featureText}>Fast</Text>
              </View>
              <View style={styles.featureDivider} />
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name="globe-outline" size={14} color="#FFD700" />
                </View>
                <Text style={styles.featureText}>Global</Text>
              </View>
            </View>
          </View>
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
                      <Ionicons name="wifi" size={16} color="rgba(255,255,255,0.8)" />
                    </View>
                  </View>
                  <View style={styles.cardMiddle}>
                    <Text style={styles.cardNumber}>**** **** **** ****</Text>
                    <View style={styles.cardHologram} />
                  </View>
                  <View style={styles.cardDetails}>
                    <View style={styles.cardDetailItem}>
                      <Text style={styles.cardLabel}>CARD HOLDER</Text>
                      <Text style={styles.cardValue}>Card Holder</Text>
                    </View>
                    <View style={styles.cardDetailItem}>
                      <Text style={styles.cardLabel}>EXPIRES</Text>
                      <Text style={styles.cardValue}>MM/YY</Text>
                    </View>
                    <View style={styles.cardDetailItem}>
                      <Text style={styles.cardLabel}>CVV</Text>
                      <Text style={styles.cardValue}>***</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardPattern} />
              </LinearGradient>
            </View>
            <View style={styles.floatingElements}>
              <View style={[styles.floatingElement, styles.floatingElement1]}>
                <Ionicons name="card" size={12} color="#FFD700" />
              </View>
              <View style={[styles.floatingElement, styles.floatingElement2]}>
                <Ionicons name="lock-closed" size={10} color="#4CAF50" />
              </View>
              <View style={[styles.floatingElement, styles.floatingElement3]}>
                <Ionicons name="flash" size={10} color="#2196F3" />
              </View>
            </View>
          </Animated.View>
          <View style={styles.authContainer}>
            {isIOS ? (
              <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
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
                          <Ionicons name="log-in-outline" size={16} color="#0F0C29" />
                          <Text style={styles.primaryButtonText}>Sign In</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Link>
                  <Link href="/(auth)/sign-up" asChild>
                    <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                      <View style={styles.secondaryButtonContent}>
                        <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
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
                          <Ionicons name="log-in-outline" size={16} color="#0F0C29" />
                          <Text style={styles.primaryButtonText}>Sign In</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Link>
                  <Link href="/(auth)/sign-up" asChild>
                    <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                      <View style={styles.secondaryButtonContent}>
                        <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.secondaryButtonText}>Create Account</Text>
                      </View>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <View style={styles.securitySection}>
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#4CAF50" />
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
            <Text style={styles.footerText}>© 2024 E-Bank Financial Services, Inc.</Text>
            <Text style={styles.footerSubText}>Licensed & Regulated Banking Institution</Text>
          </View>
        </Animated.View>
      </ScrollView>
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
    borderRadius: 80,
  },
  shape1: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    top: -width * 0.2,
    right: -width * 0.2,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.1)",
  },
  shape2: {
    width: width * 0.45,
    height: width * 0.45,
    backgroundColor: "rgba(46, 49, 146, 0.12)",
    bottom: height * 0.1,
    left: -width * 0.2,
    borderWidth: 1,
    borderColor: "rgba(46, 49, 146, 0.2)",
  },
  shape3: {
    width: 140,
    height: 140,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    top: height * 0.3,
    right: -30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  shape4: {
    width: 90,
    height: 90,
    backgroundColor: "rgba(255, 160, 0, 0.05)",
    bottom: height * 0.2,
    right: width * 0.15,
  },
  shape5: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(33, 150, 243, 0.08)",
    top: height * 0.2,
    left: width * 0.08,
  },
  shape6: {
    width: 45,
    height: 45,
    backgroundColor: "rgba(76, 175, 80, 0.06)",
    bottom: height * 0.35,
    right: width * 0.6,
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
    width: 3,
    height: 3,
    borderRadius: 1.5,
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18,
  },
  header: {
    alignItems: "center",
    marginTop: 15,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  logoInner: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F0C29",
  },
  logoAccent: {
    position: "absolute",
    bottom: -1.5,
    right: -1.5,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#0F0C29",
  },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  bankText: {
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.9)",
  },
  brandUnderline: {
    width: 45,
    height: 2,
    backgroundColor: "#FFD700",
    borderRadius: 1.5,
    marginTop: 6,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 0.8 },
    textShadowRadius: 1.5,
  },
  subTagline: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    fontWeight: "400",
    letterSpacing: 0.4,
    marginBottom: 18,
    fontStyle: "italic",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 30,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
  },
  featureIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 12,
    fontWeight: "600",
  },
  featureDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 9,
  },
  cardVisualContainer: {
    alignItems: "center",
    marginVertical: 30,
    position: "relative",
  },
  cardShadow: {
    position: "absolute",
    width: width * 0.75,
    height: 170,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    top: 6,
    left: 3,
  },
  cardVisual: {
    width: width * 0.75,
    height: 170,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cardGradient: {
    flex: 1,
    padding: 18,
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
    width: 36,
    height: 27,
    backgroundColor: "#FFD700",
    borderRadius: 6,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  cardWifi: {
    opacity: 0.8,
  },
  cardMiddle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  cardNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 0.8 },
    textShadowRadius: 1.5,
  },
  cardHologram: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1.5,
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
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 0.8 },
    textShadowRadius: 0.8,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  floatingElement1: {
    top: -8,
    right: 15,
  },
  floatingElement2: {
    bottom: -8,
    left: 22,
  },
  floatingElement3: {
    top: "50%",
    right: -12,
  },
  authContainer: {
    marginBottom: 15,
  },
  blurContainer: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonContainer: {
    padding: 22,
  },
  primaryButton: {
    height: 50,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryButtonText: {
    color: "#0F0C29",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
    marginBottom: 18,
  },
  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  footer: {
    alignItems: "center",
  },
  securitySection: {
    alignItems: "center",
    marginBottom: 12,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  securityText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 6,
  },
  certificationBadges: {
    flexDirection: "row",
    gap: 9,
  },
  certBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  certText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 3,
  },
  footerSubText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 9,
    textAlign: "center",
    fontWeight: "400",
    fontStyle: "italic",
  },
})