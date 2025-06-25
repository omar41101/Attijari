import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '../context/auth';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Set navigation as ready after initial mount
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady || isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup && segments[0] !== '') {
      // Redirect to the landing page if not authenticated and not in auth group
      router.replace('/');
    } else if (isAuthenticated && (inAuthGroup || segments[0] === '')) {
      // Redirect to home page if authenticated and trying to access auth or landing page
      router.replace('/(home)');
    }

    // Hide splash screen after navigation is ready
    SplashScreen.hideAsync();
  }, [isAuthenticated, segments, isLoading, isNavigationReady]);

  // Show nothing until navigation is ready
  if (!isNavigationReady || isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(home)" />
      <Stack.Screen name="(auth)" />
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