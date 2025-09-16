import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="users" />
      <Stack.Screen name="cards" />
      <Stack.Screen name="bankAccounts" />
      <Stack.Screen name="createBankAccount" />
    
      <Stack.Screen name="transactions" />
      <Stack.Screen name="transfer" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="admin" /> 
    </Stack>
  );
}
