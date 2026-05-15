import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { Layout } from '@/components/ui/layout';
import { useAuthCtx } from '@/contexts/auth';
import { usePosSettings } from '@/contexts/settings';
import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsSection } from '@/components/settings/settings-section';
import { SettingsItem } from '@/components/settings/settings-item';
import { Prompt } from '@/components/ui/prompt';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { logout, state } = useAuthCtx();
  const { defaults } = usePosSettings();
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);

  const hasAppLock = state.status === 'authenticated' && state.hasAppLockSetup;

  return (
    <Layout className="px-0 pt-0">
      <Stack.Screen options={{ headerShown: false }} />
      <SettingsHeader title="Settings" showBack={true} />

      <Prompt
        visible={showLogoutPrompt}
        title="Sign Out?"
        submitText="Sign Out"
        cancelText="Cancel"
        onSubmit={() => {
          setShowLogoutPrompt(false);
          logout();
        }}
        onClose={() => setShowLogoutPrompt(false)}>
        <Text style={{ color: colors.fgSecondary }} className="mb-4 text-center">
          Are you sure you want to sign out of your account? You will need to log in again to access
          the POS.
        </Text>
      </Prompt>

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
            onPress={() => setShowLogoutPrompt(true)}
            className="mt-4 h-16 flex-row items-center justify-center rounded-2xl border"
            style={{ backgroundColor: colors.errorBg + '20', borderColor: colors.error + '40' }}
          >
            <MaterialIcons name="logout" size={22} color={colors.error} />
            <Text style={{ color: colors.error }} className="ml-3 text-[16px] font-black uppercase tracking-widest">
              SIGN OUT
            </Text>
          </Pressable>
          
          <Text className="mt-8 text-center text-[11px] font-bold uppercase tracking-[3px]" style={{ color: colors.fgMuted }}>
            Divya Jyoti Foundation POS v1.0.0
          </Text>
        </View>
      </ScrollView>
    </Layout>
  );
}
