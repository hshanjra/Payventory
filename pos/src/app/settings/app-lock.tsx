import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useAuthCtx } from '@/contexts/auth';
import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsSection } from '@/components/settings/settings-section';
import { SettingsItem } from '@/components/settings/settings-item';
import * as LocalAuthentication from 'expo-local-authentication';

export default function AppLockSettingsScreen() {
  const { colors } = useTheme();
  const { state, setupAppLock, disableAppLock } = useAuthCtx();
  const hasAppLock = state.status === 'authenticated' && state.hasAppLockSetup;

  const handleToggleLock = async () => {
    if (hasAppLock) {
      Alert.alert(
        'Disable Device Lock',
        'Are you sure you want to disable the device lock? This will reduce the security of your sales data.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await disableAppLock();
            },
          },
        ]
      );
    } else {
      const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();

      if (enrolledLevel === LocalAuthentication.SecurityLevel.NONE) {
        Alert.alert('Error', 'No screen lock (PIN, Pattern, or Biometrics) is configured on this device.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable device lock',
      });

      if (result.success) {
        await setupAppLock();
      }
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ title: 'Device Lock', headerShown: false }} />
      <SettingsHeader title="Device Lock" />

      <ScrollView className="flex-1 px-6">
        <View className="mb-8 items-center gap-4 py-6">
          <View
            className="h-20 w-20 items-center justify-center rounded-[24px]"
            style={{ backgroundColor: colors.primary + '1e' }}>
            <MaterialIcons name="security" size={40} color={colors.primary} />
          </View>
          <Text className="text-center text-[15px] leading-6" style={{ color: colors.fgSecondary }}>
            Device lock protects your account from unauthorized access by requiring your system passcode, PIN, pattern, or biometrics when the app is opened.
          </Text>
        </View>

        <SettingsSection title="SECURITY">
          <SettingsItem
            label="Enable Device Lock"
            icon="security"
            type="switch"
            value={hasAppLock}
            onPress={handleToggleLock}
            isLast
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
