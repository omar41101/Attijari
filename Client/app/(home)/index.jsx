"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native"
import { useAuth } from "../../context/auth"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { PieChart } from "react-native-chart-kit"
import { LinearGradient } from "expo-linear-gradient"

const screenWidth = Dimensions.get("window").width
const API_BASE = "http://192.168.1.77:1919/api"

export default function HomePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [bankAccounts, setBankAccounts] = useState([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [errorLoadingAccounts, setErrorLoadingAccounts] = useState(false)
  const [expenseData, setExpenseData] = useState([])
  const [isLoadingCharts, setIsLoadingCharts] = useState(true)
  const [errorLoadingCharts, setErrorLoadingCharts] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()

    // Pulse animation for status badge
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
  }, [])

  useEffect(() => {
    const fetchBankAccountsAndSummaries = async () => {
      if (!user?.token) {
        setIsLoadingAccounts(false)
        setErrorLoadingAccounts(true)
        setIsLoadingCharts(false)
        setErrorLoadingCharts(true)
        console.error("User token not available.")
        return
      }

      try {
        // Fetch bank accounts
        const accountsResponse = await axios.get("http://192.168.1.77:1919/api/bankaccounts/myaccounts", {
          headers: { Authorization: `Bearer ${user.token}` },
        })

        setBankAccounts(accountsResponse.data)
        setIsLoadingAccounts(false)

        // Fetch transaction summaries for each account
        const summaries = []
        for (const account of accountsResponse.data) {
          const summaryResponse = await axios.get(`http://192.168.1.77:1919/api/bankaccounts/${account._id}/summary`, {
            headers: { Authorization: `Bearer ${user.token}` },
          })
          summaries.push(summaryResponse.data)
        }

        // Aggregate expense data for charting
        const aggregatedExpenses = {}
        summaries.forEach((summary) => {
          for (const type in summary.transactionsByType) {
            if (type !== "Deposit" && type !== "Transfer") {
              // Exclude deposits and transfers as income for charting expenses
              aggregatedExpenses[type] = (aggregatedExpenses[type] || 0) + summary.transactionsByType[type]
            }
          }
        })

        const chartData = Object.keys(aggregatedExpenses).map((type, index) => {
          const colorOptions = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]
          const color = colorOptions[index % colorOptions.length]
          return {
            name: type,
            population: aggregatedExpenses[type],
            color: color,
            legendFontColor: "#FFFFFF",
            legendFontSize: 14,
          }
        })

        setExpenseData(chartData)
        setIsLoadingCharts(false)
      } catch (error) {
        console.error("Failed to fetch data for charts:", error.response?.data || error.message)
        setErrorLoadingAccounts(true)
        setErrorLoadingCharts(true)
        Alert.alert("Error", "Failed to load banking data. Please try again later.")
      }
    }

    fetchBankAccountsAndSummaries()
  }, [user?.token])

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await signOut()
            if (result.success) {
              Alert.alert("Signed Out", "You have been successfully signed out.", [
                {
                  text: "OK",
                  onPress: () => router.replace("/"),
                },
              ])
            } else {
              Alert.alert("Error", "Failed to sign out. Please try again.", [{ text: "OK" }])
            }
          } catch (error) {
            console.error("Sign out error:", error)
            Alert.alert("Error", "An unexpected error occurred. Please try again.", [{ text: "OK" }])
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Enhanced Gradient Background */}
      <LinearGradient colors={["#0F0C29", "#24243e", "#302b63"]} style={styles.backgroundGradient} />

      {/* Floating Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.floatingShape, styles.shape1]} />
        <View style={[styles.floatingShape, styles.shape2]} />
        <View style={[styles.floatingShape, styles.shape3]} />
        <View style={[styles.floatingShape, styles.shape4]} />
      </View>

      {/* Enhanced Header */}
      <LinearGradient colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]} style={styles.header}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient colors={["#FFD700", "#FFA000", "#FF8F00"]} style={styles.logo}>
            <Text style={styles.logoText}>F</Text>
          </LinearGradient>
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>Fehri Bank</Text>
            <Text style={styles.brandTagline}>Premium Banking</Text>
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
          <LinearGradient colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]} style={styles.signOutGradient}>
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Show user dashboard only if NOT admin */}
        {!user?.isAdmin && (
          <>
            {/* Enhanced Welcome Section */}
            <Animated.View
              style={[
                styles.welcomeSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                style={styles.welcomeGradient}
              >
                <View style={styles.welcomeHeader}>
                  <View style={styles.welcomeIcon}>
                    <Ionicons name="person-circle" size={48} color="#FFD700" />
                  </View>
                  <View style={styles.welcomeInfo}>
                    <Text style={styles.welcomeText}>Welcome back!</Text>
                    <Text style={styles.userName}>{user?.username || "User"}</Text>
                  </View>
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.userDetailRow}>
                    <Ionicons name="mail-outline" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.userEmail}>{user?.email || ""}</Text>
                  </View>
                  <View style={styles.userDetailRow}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.userRole}>{user?.isAdmin ? "Administrator" : "Premium Member"}</Text>
                  </View>
                </View>
                <Text style={styles.subtitle}>Your personalized banking dashboard</Text>
              </LinearGradient>
            </Animated.View>

            {/* Enhanced Account Overview */}
            <Animated.View
              style={[
                styles.accountOverviewContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.accountOverviewTitle}>Your Accounts</Text>
                <View style={styles.accountCount}>
                  <Text style={styles.accountCountText}>{bankAccounts.length}</Text>
                </View>
              </View>

              {isLoadingAccounts ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFD700" />
                  <Text style={styles.loadingText}>Loading your accounts...</Text>
                </View>
              ) : errorLoadingAccounts ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorMessage}>Could not load accounts.</Text>
                </View>
              ) : bankAccounts.length > 0 ? (
                bankAccounts.map((account, index) => (
                  <Animated.View
                    key={account._id}
                    style={[
                      styles.accountCard,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/(home)/transactions", params: { id: account._id } })}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                        style={styles.accountCardGradient}
                      >
                        <View style={styles.accountCardContent}>
                          <View style={styles.accountCardHeader}>
                            <View style={styles.accountTypeContainer}>
                              <Ionicons name="wallet-outline" size={24} color="#FFD700" />
                              <Text style={styles.accountType}>{account.accountType}</Text>
                            </View>
                            <View
                              style={[
                                styles.statusIndicator,
                                { backgroundColor: account.status === "Active" ? "#4CAF50" : "#FFA500" },
                              ]}
                            />
                          </View>
                          <Text style={styles.accountNumber}>•••• •••• •••• {account.accountNumber.slice(-4)}</Text>
                          <View style={styles.balanceContainer}>
                            <Text style={styles.balanceLabel}>Current Balance</Text>
                            <Text style={styles.accountBalance}>
                              {account.balance.toFixed(2)} {account.currency}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.accountCardArrow}>
                          <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.6)" />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="wallet-outline" size={64} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.noAccountsMessage}>No bank accounts found.</Text>
                  <Text style={styles.noAccountsSubMessage}>Contact support to set up an account.</Text>
                </View>
              )}
            </Animated.View>

            {/* Enhanced Expense Analysis Chart */}
            <Animated.View
              style={[
                styles.chartContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.chartTitle}>Expense Analysis</Text>
                <View style={styles.chartIcon}>
                  <Ionicons name="pie-chart-outline" size={20} color="#FFD700" />
                </View>
              </View>

              {isLoadingCharts ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFD700" />
                  <Text style={styles.loadingText}>Analyzing your expenses...</Text>
                </View>
              ) : errorLoadingCharts ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorMessage}>Could not load expense data.</Text>
                </View>
              ) : expenseData.length > 0 ? (
                <LinearGradient
                  colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                  style={styles.chartWrapper}
                >
                  <PieChart
                    data={expenseData}
                    width={screenWidth - 80}
                    height={240}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                    hasLegend={true}
                  />
                </LinearGradient>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="analytics-outline" size={64} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.noChartDataMessage}>No expense data available for analysis.</Text>
                </View>
              )}
            </Animated.View>

            {/* Enhanced Quick Actions (user) */}
            <Animated.View
              style={[
                styles.actionsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.actionsTitle}>Quick Actions</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push("/(home)/cards")}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={styles.actionGradient}>
                    <View style={styles.actionIcon}>
                      <Ionicons name="card-outline" size={28} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionTitle}>Cards</Text>
                    <Text style={styles.actionSubtitle}>Manage your cards</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push("/(home)/transfer")}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#4ECDC4", "#44A08D"]} style={styles.actionGradient}>
                    <View style={styles.actionIcon}>
                      <Ionicons name="swap-horizontal-outline" size={28} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionTitle}>Transfer</Text>
                    <Text style={styles.actionSubtitle}>Send money</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push("/(home)/notifications")}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#45B7D1", "#96C93D"]} style={styles.actionGradient}>
                    <View style={styles.actionIcon}>
                      <Ionicons name="notifications-outline" size={28} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionTitle}>Notifications</Text>
                    <Text style={styles.actionSubtitle}>View your inbox</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push("/(home)/profile")}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#96CEB4", "#FFEAA7"]} style={styles.actionGradient}>
                    <View style={styles.actionIcon}>
                      <Ionicons name="person-outline" size={28} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionTitle}>Profile</Text>
                    <Text style={styles.actionSubtitle}>Account settings</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Enhanced Status Message */}
            <Animated.View
              style={[
                styles.statusContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient colors={["rgba(76, 175, 80, 0.2)", "rgba(76, 175, 80, 0.1)"]} style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.statusText}>Successfully authenticated</Text>
              </LinearGradient>
            </Animated.View>
          </>
        )}

        {/* Enhanced Admin Dashboard */}
        {user?.isAdmin && (
          <>
            {/* Admin Welcome Section */}
            <Animated.View
              style={[
                styles.adminWelcomeSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,215,0,0.2)", "rgba(255,215,0,0.1)"]}
                style={styles.adminWelcomeGradient}
              >
                <View style={styles.adminHeader}>
                  <View style={styles.adminIcon}>
                    <Ionicons name="shield-checkmark" size={48} color="#FFD700" />
                  </View>
                  <View style={styles.adminInfo}>
                    <Text style={styles.adminWelcomeText}>Administrator Panel</Text>
                    <Text style={styles.adminUserName}>{user?.username || "Admin"}</Text>
                  </View>
                </View>
                <Text style={styles.adminSubtitle}>System Management Dashboard</Text>
              </LinearGradient>
            </Animated.View>

            {/* Enhanced Admin Quick Actions */}
            <Animated.View
              style={[
                styles.actionsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.actionsTitle}>Administrative Actions</Text>

              <TouchableOpacity
                style={styles.adminActionCard}
                onPress={() => router.push("/(admin)/createBankAccount")}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#43E97B", "#38F9D7"]} style={styles.adminActionGradient}>
                  <View style={styles.adminActionIcon}>
                    <Ionicons name="add-circle-outline" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.adminActionContent}>
                    <Text style={styles.adminActionTitle}>Create Bank Account</Text>
                    <Text style={styles.adminActionSubtitle}>Add account for any user</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminActionCard}
                onPress={() => router.push("/(admin)/users")}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#667EEA", "#764BA2"]} style={styles.adminActionGradient}>
                  <View style={styles.adminActionIcon}>
                    <Ionicons name="people-outline" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.adminActionContent}>
                    <Text style={styles.adminActionTitle}>Manage Users</Text>
                    <Text style={styles.adminActionSubtitle}>View and manage user accounts</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminActionCard}
                onPress={() => router.push("/(admin)/cards")}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#4FACFE", "#00F2FE"]} style={styles.adminActionGradient}>
                  <View style={styles.adminActionIcon}>
                    <Ionicons name="card-outline" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.adminActionContent}>
                    <Text style={styles.adminActionTitle}>Card Management</Text>
                    <Text style={styles.adminActionSubtitle}>Create, delete, and view cards</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminActionCard}
                onPress={() => router.push("/(admin)/bankAccounts")}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#F093FB", "#F5576C"]} style={styles.adminActionGradient}>
                  <View style={styles.adminActionIcon}>
                    <Ionicons name="wallet-outline" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.adminActionContent}>
                    <Text style={styles.adminActionTitle}>All Bank Accounts</Text>
                    <Text style={styles.adminActionSubtitle}>View and manage all accounts</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0C29",
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundElements: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  floatingShape: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.1,
  },
  shape1: {
    width: 200,
    height: 200,
    backgroundColor: "#FFD700",
    top: 100,
    right: -50,
  },
  shape2: {
    width: 150,
    height: 150,
    backgroundColor: "#4ECDC4",
    bottom: 200,
    left: -30,
  },
  shape3: {
    width: 100,
    height: 100,
    backgroundColor: "#FF6B6B",
    top: 300,
    left: 50,
  },
  shape4: {
    width: 80,
    height: 80,
    backgroundColor: "#45B7D1",
    bottom: 100,
    right: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F0C29",
  },
  brandInfo: {
    justifyContent: "center",
  },
  brandName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  signOutButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  signOutGradient: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  welcomeGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeIcon: {
    marginRight: 16,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  userDetails: {
    marginBottom: 16,
    gap: 8,
  },
  userDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  userRole: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    fontStyle: "italic",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  accountOverviewContainer: {
    marginBottom: 28,
  },
  accountOverviewTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  accountCount: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  accountCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F0C29",
  },
  accountCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  accountCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  accountCardContent: {
    flex: 1,
  },
  accountCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  accountTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accountType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  accountNumber: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
    letterSpacing: 2,
    fontWeight: "500",
  },
  balanceContainer: {
    gap: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFD700",
    letterSpacing: 0.5,
  },
  accountCardArrow: {
    marginLeft: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorMessage: {
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noAccountsMessage: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  noAccountsSubMessage: {
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
  chartContainer: {
    marginBottom: 28,
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  chartIcon: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 12,
    padding: 8,
  },
  chartWrapper: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noChartDataMessage: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
  },
  actionsContainer: {
    marginBottom: 28,
  },
  actionsTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  actionIcon: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontWeight: "500",
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Admin specific styles
  adminWelcomeSection: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  adminWelcomeGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  adminIcon: {
    marginRight: 16,
  },
  adminInfo: {
    flex: 1,
  },
  adminWelcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  adminUserName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  adminSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
  adminActionCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  adminActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    minHeight: 80,
  },
  adminActionIcon: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  adminActionContent: {
    flex: 1,
  },
  adminActionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  adminActionSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
})

const chartConfig = {
  backgroundColor: "#0F0C29",
  backgroundGradientFrom: "#0F0C29",
  backgroundGradientTo: "#302b63",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
}
