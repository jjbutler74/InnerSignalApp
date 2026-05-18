import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { seedIfEmpty } from './src/db/seed';
import { useSettingsStore } from './src/store/settingsStore';
import { useAffirmationStore } from './src/store/affirmationStore';
import { useJournalStore } from './src/store/journalStore';
import { useStatsStore } from './src/store/statsStore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  Geist_300Light,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
} from '@expo-google-fonts/geist';
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
} from '@expo-google-fonts/geist-mono';
import * as Notifications from 'expo-notifications';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { navigationRef } from './src/navigation/ref';
import { setupChannels } from './src/notifications/channels';
import { scheduleAllNotifications } from './src/notifications/scheduler';

import { TodayScreen } from './src/screens/TodayScreen';
import { OnboardingWelcomeScreen } from './src/screens/OnboardingWelcomeScreen';
import { OnboardingNameScreen } from './src/screens/OnboardingNameScreen';
import { OnboardingScheduleScreen } from './src/screens/OnboardingScheduleScreen';
import { LockScreen } from './src/screens/LockScreen';
import { AffirmationMomentScreen } from './src/screens/AffirmationMomentScreen';
import { AffirmationLibraryScreen } from './src/screens/AffirmationLibraryScreen';
import { AddAffirmationScreen } from './src/screens/AddAffirmationScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { EveningNotifScreen } from './src/screens/EveningNotifScreen';
import { GratitudeComposerScreen } from './src/screens/GratitudeComposerScreen';
import { GratitudeJournalScreen } from './src/screens/GratitudeJournalScreen';
import { WeeklyRecapScreen } from './src/screens/WeeklyRecapScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type RootStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingName: undefined;
  OnboardingSchedule: undefined;
  Lock: undefined;
  Today: undefined;
  AffirmationMoment: undefined;
  AffirmationLibrary: undefined;
  AddAffirmation: undefined;
  Settings: undefined;
  Schedule: undefined;
  EveningNotif: undefined;
  GratitudeComposer: undefined;
  GratitudeJournal: undefined;
  WeeklyRecap: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator({ initialRoute }: { initialRoute: keyof RootStackParamList }) {
  const { t } = useTheme();
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen}/>
        <Stack.Screen name="OnboardingName" component={OnboardingNameScreen}/>
        <Stack.Screen name="OnboardingSchedule" component={OnboardingScheduleScreen}/>
        <Stack.Screen name="Lock" component={LockScreen}/>
        <Stack.Screen name="Today" component={TodayScreen}/>
        <Stack.Screen name="AffirmationMoment" component={AffirmationMomentScreen} options={{ animation: 'slide_from_bottom' }}/>
        <Stack.Screen name="AffirmationLibrary" component={AffirmationLibraryScreen}/>
        <Stack.Screen name="AddAffirmation" component={AddAffirmationScreen} options={{ animation: 'slide_from_bottom' }}/>
        <Stack.Screen name="Settings" component={SettingsScreen}/>
        <Stack.Screen name="Schedule" component={ScheduleScreen}/>
        <Stack.Screen name="EveningNotif" component={EveningNotifScreen}/>
        <Stack.Screen name="GratitudeComposer" component={GratitudeComposerScreen} options={{ animation: 'slide_from_bottom' }}/>
        <Stack.Screen name="GratitudeJournal" component={GratitudeJournalScreen}/>
        <Stack.Screen name="WeeklyRecap" component={WeeklyRecapScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Geist_300Light,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
  });

  const loadSettings     = useSettingsStore(s => s.load);
  const loadAffirmations = useAffirmationStore(s => s.load);
  const loadJournal      = useJournalStore(s => s.load);
  const loadStats        = useStatsStore(s => s.load);

  const [storesReady, setStoresReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Today');
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!fontsLoaded) return;
    (async () => {
      await setupChannels();
      await seedIfEmpty();
      const settings = await loadSettings().then(() => useSettingsStore.getState());
      await Promise.all([loadAffirmations(), loadJournal(), loadStats()]);
      await scheduleAllNotifications(settings);
      setInitialRoute(settings.onboardingComplete ? 'Today' : 'OnboardingWelcome');
      setStoresReady(true);
    })();
  }, [fontsLoaded]);

  useEffect(() => {
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(response => {
      const slot = response.notification.request.content.data?.slot as string | undefined;
      if (!navigationRef.isReady()) return;
      if (slot === 'gratitude') {
        navigationRef.navigate('EveningNotif');
      } else if (slot === 'anchor1' || slot === 'anchor2' || slot === 'anchor3') {
        navigationRef.navigate('AffirmationMoment');
      }
    });
    return () => responseListenerRef.current?.remove();
  }, []);

  if (!fontsLoaded || !storesReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2EDE2' }}>
        <ActivityIndicator color="#6F8169"/>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator initialRoute={initialRoute}/>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
