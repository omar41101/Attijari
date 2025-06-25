import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

export default function LandingPage() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Premium Gradient Background */}
      <LinearGradient
        colors={['#1A1F71', '#2E3192', '#1E3C72']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Abstract Shapes */}
      <View style={styles.shapesContainer}>
        <View style={[styles.shape, styles.shape1]} />
        <View style={[styles.shape, styles.shape2]} />
        <View style={[styles.shape, styles.shape3]} />
        <View style={[styles.shape, styles.shape4]} />
      </View>
      
      {/* Grid Pattern Overlay */}
      <View style={styles.gridOverlay} />
      
      {/* Main Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FFD700', '#FFC107']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoText}>Fehri</Text>
            </LinearGradient>
            <Text style={styles.brandName}>Fehri <Text style={styles.bankText}>Bank</Text></Text>
          </View>
          
          <Text style={styles.tagline}>Premium Banking Experience</Text>
          
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#FFD700" />
              <Text style={styles.featureText}>Secure</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={20} color="#FFD700" />
              <Text style={styles.featureText}>Fast</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons name="globe-outline" size={20} color="#FFD700" />
              <Text style={styles.featureText}>Global</Text>
            </View>
          </View>
        </View>

        {/* Card Visual */}
        <View style={styles.cardVisualContainer}>
          <View style={styles.cardVisual}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardChip} />
                <Text style={styles.cardNumber}>•••• •••• •••• 5678</Text>
                <View style={styles.cardDetails}>
                  <View>
                    <Text style={styles.cardLabel}>CARD HOLDER</Text>
                    <Text style={styles.cardValue}>JOHN DOE</Text>
                  </View>
                  <View>
                    <Text style={styles.cardLabel}>EXPIRES</Text>
                    <Text style={styles.cardValue}>05/28</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Auth Buttons Container */}
        <View style={styles.authContainer}>
          {isIOS ? (
            <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
              <View style={styles.buttonContainer}>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                    <LinearGradient
                      colors={['#FFD700', '#FFC107']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
                
                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                    <Text style={styles.secondaryButtonText}>Create Account</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </BlurView>
          ) : (
            <View style={[styles.blurContainer, { backgroundColor: 'rgba(20, 25, 75, 0.85)' }]}>
              <View style={styles.buttonContainer}>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
                    <LinearGradient
                      colors={['#FFD700', '#FFC107']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
                
                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
                    <Text style={styles.secondaryButtonText}>Create Account</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={14} color="#FFD700" />
            <Text style={styles.securityText}>Bank-Grade Security</Text>
          </View>
          
          <Text style={styles.footerText}>
            © 2023  Financial Services, Inc.
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  shapesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  shape: {
    position: 'absolute',
    borderRadius: 100,
  },
  shape1: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  shape2: {
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: 'rgba(0, 71, 255, 0.08)',
    bottom: height * 0.2,
    left: -width * 0.25,
  },
  shape3: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    top: height * 0.45,
    right: -30,
  },
  shape4: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -50,
    right: width * 0.3,
  },
  gridOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.4,
    backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1F71',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  bankText: {
    fontWeight: '300',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  featureDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  cardVisualContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  cardVisual: {
    width: width * 0.85,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    opacity: 0.8,
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 2,
    marginVertical: 20,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  authContainer: {
    marginBottom: 20,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContainer: {
    padding: 24,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#FFD700',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#1A1F71',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  securityText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
});