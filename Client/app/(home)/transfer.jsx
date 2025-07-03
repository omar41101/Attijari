import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { StatusBar } from 'expo-status-bar';

export default function TransferPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [sourceAccount, setSourceAccount] = useState("");
  const [destinationAccountNumber, setDestinationAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [userBankAccounts, setUserBankAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState(false);
  const [errorAccounts, setErrorAccounts] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  useEffect(() => {
    const fetchUserAccounts = async () => {
      if (!user?.token) {
        setIsLoadingAccounts(false);
        setErrorAccounts(true);
        console.error("User token not available.");
        return;
      }
      try {
        const response = await axios.get(
          "http://192.168.1.77:1919/api/bankaccounts/myaccounts",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setUserBankAccounts(response.data);
        if (response.data.length > 0) {
          setSourceAccount(response.data[0]._id); // Pre-select the first account
        }
      } catch (err) {
        console.error("Failed to fetch bank accounts for transfer:", err.response?.data || err.message);
        setErrorAccounts(true);
        Alert.alert("Error", "Failed to load your bank accounts. Please try again later.");
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchUserAccounts();
  }, [user?.token]);

  const handleTransfer = async () => {
    if (!sourceAccount || !destinationAccountNumber || !amount) {
      Alert.alert("Missing Information", "Please fill all required fields.");
      return;
    }
    if (parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a positive amount for transfer.");
      return;
    }

    setIsLoadingTransfer(true);
    try {
      const response = await axios.post(
        "http://192.168.1.77:1919/api/bankaccounts/transfer",
        {
          sourceAccountNumber: userBankAccounts.find(acc => acc._id === sourceAccount)?.accountNumber, // Get account number from selected ID
          destinationAccountNumber,
          amount: parseFloat(amount),
          description,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      Alert.alert("Transfer Successful!", response.data.message || "Funds transferred successfully.");
      // Clear form
      setDestinationAccountNumber("");
      setAmount("");
      setDescription("");
      // Optionally refresh accounts or navigate back
      router.replace('/(home)/index');

    } catch (err) {
      console.error("Transfer error:", err.response?.data || err.message);
      Alert.alert("Transfer Failed", err.response?.data?.message || "An error occurred during transfer. Please try again.");
    } finally {
      setIsLoadingTransfer(false);
    }
  };

  const selectedAccount = userBankAccounts.find(acc => acc._id === sourceAccount);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfer Funds</Text>
      </View>

      {isLoadingAccounts ? (
        <ActivityIndicator size="large" color="#FFD700" style={styles.loadingIndicator} />
      ) : errorAccounts ? (
        <Text style={styles.errorMessage}>Failed to load your accounts. Cannot proceed with transfer.</Text>
      ) : userBankAccounts.length === 0 ? (
        <Text style={styles.noAccountsMessage}>No bank accounts available for transfer. Please add an account.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Source Account</Text>
            <TouchableOpacity 
              style={styles.pickerContainer} 
              onPress={() => setShowAccountPicker(true)}
            >
              <Text style={styles.pickerText}>
                {selectedAccount ? 
                  `${selectedAccount.accountType} (****${selectedAccount.accountNumber.slice(-4)}) - ${selectedAccount.balance.toFixed(2)} ${selectedAccount.currency}` 
                  : 'Select an account'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter destination account number"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={destinationAccountNumber}
              onChangeText={setDestinationAccountNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Dinner, Rent payment"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoadingTransfer && styles.buttonDisabled]}
            onPress={handleTransfer}
            disabled={isLoadingTransfer}
          >
            {isLoadingTransfer ? (
              <ActivityIndicator color="#1A1F71" />
            ) : (
              <Text style={styles.buttonText}>Confirm Transfer</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Account Picker Modal */}
      <Modal
        visible={showAccountPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Source Account</Text>
              <TouchableOpacity onPress={() => setShowAccountPicker(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {userBankAccounts.map((account) => (
                <TouchableOpacity
                  key={account._id}
                  style={styles.accountOption}
                  onPress={() => {
                    setSourceAccount(account._id);
                    setShowAccountPicker(false);
                  }}
                >
                  <Text style={styles.accountOptionText}>
                    {account.accountType} (****{account.accountNumber.slice(-4)})
                  </Text>
                  <Text style={styles.accountOptionBalance}>
                    {account.balance.toFixed(2)} {account.currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  noAccountsMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  formContainer: {
    flexGrow: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#1A1F71',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1F71',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  accountOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  accountOptionBalance: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
}); 