import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, AppState } from 'react-native';
import { seedIfEmpty, seedSagePacks } from './src/db/seed';
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
import * as SplashScreen from 'expo-splash-screen';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { navigationRef } from './src/navigation/ref';
import { setupChannels } from './src/notifications/channels';
import { scheduleAllNotifications, cleanupNotifications } from './src/notifications/scheduler';
import { initAudio } from './src/utils/sound';
import { isAnchorMissed } from './src/utils/anchorWindow';
import { today, localDateString } from './src/db/database';

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
import { OnboardingToneScreen } from './src/screens/OnboardingToneScreen';

function navigateForNotification(response: Notifications.NotificationResponse): void {
  // Refresh daily picks before reading slotAffirmations — the app may have
  // been backgrounded overnight, leaving the store with yesterday's picks.
  useAffirmationStore.getState().refreshDailyAffirmations();

  const slot = response.notification.request.content.data?.slot as string | undefined;

  if (slot === 'gratitude') {
    // Gratitude always routes based on today's state, regardless of when the
    // notification was delivered. A lingering tray notification from a previous
    // session should still land on EveningNotif if today's entry isn't written.
    const done = useJournalStore.getState().entries.some(e => e.date === today());
    navigationRef.navigate(done ? 'GratitudeComposer' : 'EveningNotif');
    return;
  }

  // Stale affirmation notification (delivered on a previous calendar day). The
  // app dismisses these from the tray on every foreground transition, but a
  // cold-start tap can still arrive here before that cleanup runs.
  const notifDay = localDateString(new Date(response.notification.date * 1000));
  if (notifDay !== today()) {
    navigationRef.navigate('Today');
    return;
  }

  if (slot === 'anchor1' || slot === 'anchor2' || slot === 'anchor3') {
    // Compute the active slot directly from current time — no store dependency.
    const schedule = useSettingsStore.getState();
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const currentSlot: 'anchor1' | 'anchor2' | 'anchor3' =
      nowMins < toMins(schedule.scheduleAnchor2) ? 'anchor1'
    : nowMins < toMins(schedule.scheduleAnchor3) ? 'anchor2'
    : 'anchor3';
    const { completedSlotsToday } = useStatsStore.getState();
    // Past-slot tap (same day, different time window): go straight to review-only affirmation.
    // Current-slot tap: go through LockScreen so the user can read the affirmation and
    // choose to engage ("Read & absorb") or snooze, rather than landing in the timer directly.
    const reviewOnly = slot !== currentSlot || (!completedSlotsToday.has(slot) && isAnchorMissed(slot, schedule, nowMins));
    if (reviewOnly) {
      navigationRef.navigate('AffirmationMoment', { slot, reviewOnly: true });
    } else {
      navigationRef.navigate('Lock', { slot });
    }
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Keep the native splash visible until fonts + stores are ready below.
SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingName: undefined;
  OnboardingTone: undefined;
  OnboardingSchedule: undefined;
  Lock: { slot?: 'anchor1' | 'anchor2' | 'anchor3' };
  Today: undefined;
  AffirmationMoment: { slot: 'anchor1' | 'anchor2' | 'anchor3'; reviewOnly?: boolean };
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
        <Stack.Screen name="OnboardingTone" component={OnboardingToneScreen}/>
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
  const [startupError, setStartupError] = useState(false);
  const [startupAttempt, setStartupAttempt] = useState(0);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Today');
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const handledResponseIdRef = useRef<string | null>(null);
  const lastRescheduledRef = useRef(0);

  useEffect(() => {
    if (!fontsLoaded) return;
    setStartupError(false);
    (async () => {
      try {
        await seedIfEmpty();
        await seedSagePacks();
        const settings = await loadSettings().then(() => useSettingsStore.getState());
        await setupChannels(settings.sound);
        await initAudio();
        await Promise.all([loadAffirmations(), loadJournal(), loadStats()]);
        await scheduleAllNotifications(settings);
        await cleanupNotifications(settings);

        setInitialRoute(settings.onboardingComplete ? 'Today' : 'OnboardingWelcome');
        setStoresReady(true);
        await SplashScreen.hideAsync();
      } catch {
        await SplashScreen.hideAsync();
        setStartupError(true);
      }
    })();
  }, [fontsLoaded, startupAttempt]);

  // Cold-start: app was launched by tapping a notification (nav not yet ready).
  useEffect(() => {
    if (!storesReady || !lastNotificationResponse) return;
    const id = lastNotificationResponse.notification.request.identifier;
    if (handledResponseIdRef.current === id) return;
    handledResponseIdRef.current = id;
    const tryNav = () => {
      if (navigationRef.isReady()) {
        navigateForNotification(lastNotificationResponse);
      } else {
        setTimeout(tryNav, 50);
      }
    };
    tryNav();
  }, [storesReady, lastNotificationResponse]);

  // Foreground / background→active: notification tapped while app was running.
  useEffect(() => {
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(response => {
      if (!navigationRef.isReady()) return;
      const id = response.notification.request.identifier;
      if (handledResponseIdRef.current === id) return;
      handledResponseIdRef.current = id;
      navigateForNotification(response);
    });
    return () => responseListenerRef.current?.remove();
  }, []);

  // Every time the app comes to foreground: reschedule notifications (so
  // exact alarms are used immediately after the user grants the permission)
  // and evict stale/superseded notifications from the tray.
  // 30-second debounce avoids double-firing right after startup.
  useEffect(() => {
    if (!storesReady) return;
    lastRescheduledRef.current = Date.now();
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        const settings = useSettingsStore.getState();
        const now = Date.now();
        if (now - lastRescheduledRef.current > 30_000) {
          lastRescheduledRef.current = now;
          scheduleAllNotifications(settings).catch(() => {});
        }
        cleanupNotifications(settings);
      }
    });
    return () => sub.remove();
  }, [storesReady]);

  if (startupError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A2B4A', gap: 24 }}>
        <Text style={{ color: '#C8BFA8', fontSize: 15, textAlign: 'center', paddingHorizontal: 48, lineHeight: 22 }}>
          Something went wrong starting up.
        </Text>
        <Pressable
          onPress={() => setStartupAttempt(n => n + 1)}
          style={{ paddingVertical: 10, paddingHorizontal: 28, borderRadius: 20, borderWidth: 1, borderColor: '#D4A24C' }}
        >
          <Text style={{ color: '#D4A24C', fontSize: 14 }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (!fontsLoaded || !storesReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A2B4A' }}>
        <ActivityIndicator color="#D4A24C"/>
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
