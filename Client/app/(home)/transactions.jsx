import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function TransactionsPage() {
  const { id: accountId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.token || !accountId) {
        setIsLoading(false);
        setError(true);
        console.error("User token or account ID not available.");
        return;
      }

      try {
        const response = await axios.get(
          `http://192.168.0.7:1919/api/bankaccounts/${accountId}/transactions`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setTransactions(response.data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err.response?.data || err.message);
        setError(true);
        Alert.alert("Error", "Failed to load transactions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.token, accountId]);

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionType}>{item.transactionType}</Text>
        <Text style={[styles.transactionAmount, item.amount < 0 ? styles.amountNegative : styles.amountPositive]}>
          {item.amount < 0 ? '-' : '+'}{Math.abs(item.amount).toFixed(2)} {item.currency}
        </Text>
      </View>
      <Text style={styles.transactionDescription}>{item.description}</Text>
      <Text style={styles.transactionDate}>{new Date(item.transactionDate).toLocaleString()}</Text>
      <Text style={styles.transactionRef}>Ref: {item.referenceNumber}</Text>
      {item.sourceAccount && (
        <Text style={styles.relatedAccount}>From: {item.sourceAccount.accountNumber.slice(-4)}</Text>
      )}
      {item.destinationAccount && (
        <Text style={styles.relatedAccount}>To: {item.destinationAccount.accountNumber.slice(-4)}</Text>
      )}
      <Text style={styles.balanceAfter}>Balance After: {item.balanceAfterTransaction.toFixed(2)} {item.currency}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions History</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#FFD700" style={styles.loadingIndicator} />
      ) : error ? (
        <Text style={styles.errorMessage}>Failed to load transactions.</Text>
      ) : transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noTransactionsMessage}>No transactions found for this account.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F71',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1A1F71',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorMessage: {
    color: '#FF6347',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  noTransactionsMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountPositive: {
    color: '#4CAF50', // Green for positive amounts
  },
  amountNegative: {
    color: '#FF6347', // Red for negative amounts
  },
  transactionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  transactionRef: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  relatedAccount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  balanceAfter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 8,
  },
}); 