import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useAuthCtx } from '@/contexts/auth';
import { usePosSettings } from '@/contexts/settings';
import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsSection } from '@/components/settings/settings-section';
import { SettingsItem } from '@/components/settings/settings-item';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { logout, state } = useAuthCtx();
  const { defaults } = usePosSettings();

  const hasAppLock = state.status === 'authenticated' && state.hasAppLockSetup;

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.canvas }}>
      <Stack.Screen options={{ headerShown: false }} />
      <SettingsHeader title="Settings" showBack={true} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-6 pb-10">
          
          <SettingsSection title="POS CONFIGURATION">
            <SettingsItem 
              label="Region" 
              icon="public" 
              type="link"
              value={defaults?.region.name ?? 'Not Set'} 
              onPress={() => router.push('/settings/region')} 
            />
            <SettingsItem 
              label="Sales Channel" 
              icon="shopping-basket" 
              type="link"
              value={defaults?.salesChannel.name ?? 'Default'} 
              onPress={() => router.push('/settings/sales-channel')} 
            />
            <SettingsItem 
              label="Department" 
              icon="label" 
              type="link"
              value={defaults?.departmentTag?.value ?? 'All Departments'} 
              onPress={() => router.push('/settings/department')} 
              isLast
            />
          </SettingsSection>

          <SettingsSection title="SECURITY">
            <SettingsItem 
              label="Device Lock" 
              icon="lock" 
              type="link"
              value={hasAppLock ? 'Enabled' : 'Disabled'} 
              onPress={() => router.push('/settings/app-lock')} 
              isLast
            />
          </SettingsSection>

          <SettingsSection title="APP PREFERENCES">
            <SettingsItem 
              label="Dark Mode" 
              icon="dark-mode" 
              type="switch" 
              value={isDark} 
            />
            <SettingsItem 
              label="Push Notifications" 
              icon="notifications" 
              type="switch" 
              value={true} 
              isLast
            />
          </SettingsSection>

          <Pressable
            onPress={logout}
            className="mt-4 h-16 flex-row items-center justify-center rounded-2xl border"
            style={{ backgroundColor: colors.errorBg + '20', borderColor: colors.error + '40' }}
          >
            <MaterialIcons name="logout" size={22} color={colors.error} />
            <Text style={{ color: colors.error }} className="ml-3 text-[16px] font-black uppercase tracking-widest">
              SIGN OUT
            </Text>
          </Pressable>
          
          <Text className="mt-8 text-center text-[11px] font-bold uppercase tracking-[3px]" style={{ color: colors.fgMuted }}>
            Payventory POS v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
