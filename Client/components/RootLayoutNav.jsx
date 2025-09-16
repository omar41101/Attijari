 import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter, useSegments } from "expo-router";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)"; // Assuming login/register are under (auth)

    // If authenticated, redirect to dashboard immediately
    if (isAuthenticated) {
      if (user?.isAdmin) {
        router.replace("/(admin)/dashboard");
      } else {
        router.replace("/(home)/dashboard");
      }
    } else {
      // If not authenticated, allow only login/register pages
      if (!inAuthGroup && segments[0] !== "") {
        router.replace("/home"); // Redirect to login if trying to access other routes
      }
    }

    SplashScreen.hideAsync();
  }, [isAuthenticated, user, segments, isLoading, isNavigationReady]);

  if (!isNavigationReady || isLoading) {
    return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" /> {/* Login page */}
      <Stack.Screen name="(home)" /> {/* Protected home group */}
      <Stack.Screen name="(auth)" /> {/* Auth group for login/register */}
      <Stack.Screen name="(admin)" /> {/* Admin group */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}