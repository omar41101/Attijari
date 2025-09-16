 // app/_layout.js
import { Stack } from "expo-router";
import { AuthProvider } from "../context/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="landing" /> {/* Login page */}
        <Stack.Screen name="(home)" /> {/* Protected home group */}
        <Stack.Screen name="(auth)" /> {/* Auth group */}
        <Stack.Screen name="(admin)" /> {/* Admin group */}
      </Stack>
      
    </AuthProvider>
  );
}