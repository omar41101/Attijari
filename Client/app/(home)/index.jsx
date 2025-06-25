import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { useAuth } from '../../context/auth';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function HomePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [errorLoadingAccounts, setErrorLoadingAccounts] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [errorLoadingCharts, setErrorLoadingCharts] = useState(false);

  useEffect(() => {
    const fetchBankAccountsAndSummaries = async () => {
      if (!user?.token) {
        setIsLoadingAccounts(false);
        setErrorLoadingAccounts(true);
        setIsLoadingCharts(false);
        setErrorLoadingCharts(true);
        console.error("User token not available.");
        return;
      }
      try {
        // Fetch bank accounts
        const accountsResponse = await axios.get(
          "http://192.168.100.112:1919/api/bankaccounts/myaccounts",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setBankAccounts(accountsResponse.data);
        setIsLoadingAccounts(false);

        // Fetch transaction summaries for each account
        const summaries = [];
        for (const account of accountsResponse.data) {
          const summaryResponse = await axios.get(
            `http://192.168.100.112:1919/api/bankaccounts/${account._id}/summary`,
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );
          summaries.push(summaryResponse.data);
        }

        // Aggregate expense data for charting
        const aggregatedExpenses = {};
        summaries.forEach(summary => {
          for (const type in summary.transactionsByType) {
            if (type !== 'Deposit' && type !== 'Transfer') { // Exclude deposits and transfers as income for charting expenses
              aggregatedExpenses[type] = (aggregatedExpenses[type] || 0) + summary.transactionsByType[type];
            }
          }
        });

        const chartData = Object.keys(aggregatedExpenses).map((type, index) => {
          const colorOptions = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];
          const color = colorOptions[index % colorOptions.length];
          return {
            name: type,
            population: aggregatedExpenses[type],
            color: color,
            legendFontColor: "#7F7F7F",
            legendFontSize: 15,
          };
        });
        setExpenseData(chartData);
        setIsLoadingCharts(false);

      } catch (error) {
        console.error("Failed to fetch data for charts:", error.response?.data || error.message);
        setErrorLoadingAccounts(true);
        setErrorLoadingCharts(true);
        Alert.alert("Error", "Failed to load banking data. Please try again later.");
      }
    };

    fetchBankAccountsAndSummaries();
  }, [user?.token]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await signOut();
              if (result.success) {
                Alert.alert(
                  'Signed Out',
                  'You have been successfully signed out.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.replace('/')
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Error',
                  'Failed to sign out. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert(
                'Error',
                'An unexpected error occurred. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header - Fixed */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>Fehri</Text>
          </View>
          <Text style={styles.brandName}>Fehri Bank</Text>
        </View>
        
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Show user dashboard only if NOT admin */}
        {!user?.isAdmin && (
          <>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userName}>{user?.username || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              <Text style={styles.userRole}>{user?.isAdmin ? 'Administrator' : 'User'}</Text>
              <Text style={styles.subtitle}>Your banking dashboard</Text>
            </View>

            {/* Account Overview */}
            <View style={styles.accountOverviewContainer}>
              <Text style={styles.accountOverviewTitle}>Your Accounts</Text>
              {isLoadingAccounts ? (
                <ActivityIndicator size="large" color="#FFD700" style={styles.loadingIndicator} />
              ) : errorLoadingAccounts ? (
                <Text style={styles.errorMessage}>Could not load accounts.</Text>
              ) : bankAccounts.length > 0 ? (
                bankAccounts.map((account) => (
                  <TouchableOpacity key={account._id} style={styles.accountCard} onPress={() => router.push({ pathname: "/(home)/transactions", params: { id: account._id } })}>
                    <View style={styles.accountCardContent}>
                      <View style={styles.accountCardHeader}>
                        <Text style={styles.accountType}>{account.accountType}</Text>
                        <View style={[styles.statusIndicator, { backgroundColor: account.status === 'Active' ? '#4CAF50' : '#FFA500' }]} />
                      </View>
                      <Text style={styles.accountNumber}>**** **** **** {account.accountNumber.slice(-4)}</Text>
                      <Text style={styles.accountBalance}>Current Balance: {account.balance.toFixed(2)} {account.currency}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noAccountsMessage}>No bank accounts found. Contact support to set up an account.</Text>
              )}
            </View>

            {/* Expense Analysis Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Expense Breakdown</Text>
              {isLoadingCharts ? (
                <ActivityIndicator size="large" color="#FFD700" style={styles.loadingIndicator} />
              ) : errorLoadingCharts ? (
                <Text style={styles.errorMessage}>Could not load expense data.</Text>
              ) : expenseData.length > 0 ? (
                <View style={styles.chartWrapper}>
                  <PieChart
                    data={expenseData}
                    width={screenWidth - 60} // Subtract padding
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute // Show absolute values on the chart
                  />
                </View>
              ) : (
                <Text style={styles.noChartDataMessage}>No expense data available for analysis.</Text>
              )}
            </View>

            {/* Quick Actions (user) */}
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>Quick Actions</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(home)/cards')}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="card-outline" size={32} color="#1A1F71" />
                  </View>
                  <Text style={styles.actionTitle}>Cards</Text>
                  <Text style={styles.actionSubtitle}>Manage your cards</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(home)/transfer')}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="swap-horizontal-outline" size={32} color="#1A1F71" />
                  </View>
                  <Text style={styles.actionTitle}>Transfer</Text>
                  <Text style={styles.actionSubtitle}>Send money</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(home)/notifications')}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="receipt-outline" size={32} color="#1A1F71" />
                  </View>
                  <Text style={styles.actionTitle}>Notifications</Text>
                  <Text style={styles.actionSubtitle}>View your inbox</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(home)/profile')}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="person-outline" size={32} color="#1A1F71" />
                  </View>
                  <Text style={styles.actionTitle}>Profile</Text>
                  <Text style={styles.actionSubtitle}>Account settings</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Message */}
            <View style={styles.statusContainer}>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.statusText}>Successfully authenticated</Text>
              </View>
            </View>
          </>
        )}

        {/* Show admin dashboard only if admin */}
        {user?.isAdmin && (
          <>
            {/* Admin Quick Actions */}
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>Quick Actions</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/createBankAccount')}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="add-circle-outline" size={32} color="#1A1F71" />
                  </View>
                  <Text style={styles.actionTitle}>Admin: Create Bank Account</Text>
                  <Text style={styles.actionSubtitle}>Add account for any user</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/users')}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="people-outline" size={32} color="#1A1F71" />
                  </View>
                  <Text style={styles.actionTitle}>Admin: View All Users</Text>
                  <Text style={styles.actionSubtitle}>Manage user accounts</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/cards')}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="card-outline" size={32} color="#1A1F71" />
                  </View>
                  <Text style={styles.actionTitle}>Admin: Manage Cards</Text>
                  <Text style={styles.actionSubtitle}>Create, delete, and view cards</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1A1F71',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1F71',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signOutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  accountOverviewContainer: {
    marginBottom: 25,
  },
  accountOverviewTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  accountCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountCardContent: {
    flex: 1,
  },
  accountCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accountNumber: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    letterSpacing: 1,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
  },
  chartContainer: {
    marginBottom: 25,
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  chartWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  actionsContainer: {
    marginBottom: 25,
  },
  actionsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  errorMessage: {
    color: '#FF6347',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  noAccountsMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  noChartDataMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

const chartConfig = {
  backgroundColor: "#1A1F71",
  backgroundGradientFrom: "#1A1F71",
  backgroundGradientTo: "#2E3192",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
}; 