import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme, fonts } from '../theme';
import { Eyebrow, MonoText } from '../components/UI';
import { useT } from '../i18n';

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionBody}>{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { lang } = useT();
  const zh = lang === 'zh';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <MonoText style={{ fontSize: 12, color: theme.accent }}>← {zh ? '返回' : 'Back'}</MonoText>
        </TouchableOpacity>
      </View>

      <Eyebrow style={{ marginBottom: 8 }}>{zh ? 'L/C · 隐私政策' : 'L/C · Privacy Policy'}</Eyebrow>
      <Text style={s.title}>{zh ? '你的数据，只属于你。' : 'Your data.\nYours alone.'}</Text>
      <MonoText style={s.updated}>{zh ? '最后更新 2026 年 5 月' : 'Last updated May 2026'}</MonoText>

      <View style={s.divider} />

      {zh ? (
        <>
          <Section title="数据收集">
            Life Counter 不收集任何个人信息。我们不追踪你，不分析你，也不向任何第三方传输你的数据。
          </Section>
          <Section title="本地存储">
            你在 App 中输入的所有内容——年龄、姓名、打卡记录、时光胶囊——全部储存在你自己设备上的本地空间（AsyncStorage）。这些数据不会上传到任何服务器。
          </Section>
          <Section title="Firebase / Firestore">
            App 使用 Firebase Firestore 读取社区内容（名言、历史人物）。这些是只读的公开数据，你的个人信息不会写入 Firestore。
          </Section>
          <Section title="通知">
            如果你开启了每日提醒，通知完全在设备本地生成，不经过任何外部服务。
          </Section>
          <Section title="小组件">
            主屏幕小组件直接从本地读取你的数据，无任何网络请求。
          </Section>
          <Section title="联系我们">
            如有疑问，请通过 GitHub Issues 联系我们：github.com/catflyx520/LifeCountDown
          </Section>
        </>
      ) : (
        <>
          <Section title="Data Collection">
            Life Counter collects no personal information. We do not track you, profile you, or transmit your data to any third party.
          </Section>
          <Section title="Local Storage">
            Everything you enter in the app — your age, name, check-ins, time capsules — is stored locally on your device using AsyncStorage. None of it leaves your device.
          </Section>
          <Section title="Firebase / Firestore">
            The app uses Firebase Firestore to fetch community content (quotes, historical figures). This is read-only public data. Your personal information is never written to Firestore.
          </Section>
          <Section title="Notifications">
            If you enable daily reminders, notifications are generated entirely on-device. No external service is involved.
          </Section>
          <Section title="Home Screen Widgets">
            Widgets read your data directly from local storage. No network requests are made.
          </Section>
          <Section title="Contact">
            Questions? Reach us via GitHub Issues: github.com/catflyx520/LifeCountDown
          </Section>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { marginBottom: 16 },
  back: { alignSelf: 'flex-start', paddingVertical: 4 },
  title: { fontFamily: fonts.serif, fontSize: 28, color: theme.fg, lineHeight: 36, marginBottom: 10 },
  updated: { fontSize: 9, color: theme.muted, marginBottom: 20 },
  divider: { height: 1, backgroundColor: theme.border, marginBottom: 24 },
  section: { marginBottom: 22 },
  sectionTitle: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: theme.accent, textTransform: 'uppercase', marginBottom: 8 },
  sectionBody: { fontFamily: fonts.body, fontSize: 14, color: theme.muted, lineHeight: 22 },
});
