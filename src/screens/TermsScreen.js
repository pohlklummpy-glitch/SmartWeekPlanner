import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

// Custom Icon Components
const IconDocument = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={[styles.iconDoc, { borderColor: color }]}>
      <View style={[styles.iconDocLine, { backgroundColor: color }]} />
      <View style={[styles.iconDocLine, { backgroundColor: color }]} />
    </View>
  </View>
);

const IconUser = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={[styles.iconUserHead, { backgroundColor: color }]} />
    <View style={[styles.iconUserBody, { backgroundColor: color }]} />
  </View>
);

const IconCheck = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={[styles.iconCheckmark, { borderColor: color }]} />
  </View>
);

const IconStar = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={styles.iconStarContainer}>
      <View style={[styles.iconStarPoint, { backgroundColor: color }]} />
      <View style={[styles.iconStarPoint, { backgroundColor: color, transform: [{ rotate: '72deg' }] }]} />
      <View style={[styles.iconStarPoint, { backgroundColor: color, transform: [{ rotate: '144deg' }] }]} />
    </View>
  </View>
);

const IconLock = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={[styles.iconLockBody, { backgroundColor: color }]} />
    <View style={[styles.iconLockShackle, { borderColor: color }]} />
  </View>
);

const IconWarning = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={[styles.iconTriangle, { borderBottomColor: color }]} />
    <View style={[styles.iconExclamation, { backgroundColor: color }]} />
  </View>
);

const IconBan = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={[styles.iconCircle, { borderColor: color }]}>
      <View style={[styles.iconSlash, { backgroundColor: color }]} />
    </View>
  </View>
);

const IconRefresh = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={[styles.iconArrowCircle, { borderColor: color }]}>
      <View style={[styles.iconArrowHead, { borderColor: color }]} />
    </View>
  </View>
);

const IconMail = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={[styles.iconEnvelope, { borderColor: color }]}>
      <View style={[styles.iconEnvelopeFlap, { borderColor: color }]} />
    </View>
  </View>
);

const IconScale = ({ color }) => (
  <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
    <View style={[styles.iconScaleBase, { backgroundColor: color }]} />
    <View style={[styles.iconScalePole, { backgroundColor: color }]} />
    <View style={[styles.iconScaleBeam, { backgroundColor: color }]} />
  </View>
);

export default function TermsScreen({ navigation }) {
  const { colors } = useTheme();

  const Section = ({ IconComponent, title, children }) => (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <IconComponent color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{children}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={[styles.backChevron, { borderColor: colors.primary }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Intro Card */}
          <View style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={[styles.introTitle, { color: colors.text }]}>Welcome to Smart Week Planner</Text>
            <Text style={[styles.introText, { color: colors.textSecondary }]}>
              By using our app, you agree to these terms. Please read them carefully.
            </Text>
            <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Last Updated: May 3, 2026</Text>
          </View>

          <Section IconComponent={IconDocument} title="1. Scope of Agreement">
            These Terms of Service govern your use of the Smart Week Planner app. By creating an account, you accept and agree to be bound by these terms.
          </Section>

          <Section IconComponent={IconUser} title="2. User Account">
            • You must provide a valid email address{'\n'}
            • You are responsible for maintaining the security of your password{'\n'}
            • Disposable email addresses are not permitted{'\n'}
            • One account per person{'\n'}
            • You must be at least 13 years old to use this service
          </Section>

          <Section IconComponent={IconCheck} title="3. Acceptable Use">
            The app is designed for personal week planning and goal management. The following activities are prohibited:{'\n\n'}
            • Misuse of the app or its features{'\n'}
            • Automated access or use of bots{'\n'}
            • Sharing your account with third parties{'\n'}
            • Reverse engineering or decompiling the app{'\n'}
            • Uploading malicious content or spam{'\n'}
            • Violating any applicable laws or regulations
          </Section>

          <Section IconComponent={IconStar} title="4. Premium Features">
            • Premium subscriptions are paid services{'\n'}
            • Payment is processed through your platform (App Store / Google Play){'\n'}
            • Premium can be cancelled at any time{'\n'}
            • Upon cancellation, premium features remain active until the end of the paid period{'\n'}
            • No refunds for partial subscription periods{'\n'}
            • Prices may change with 30 days notice
          </Section>

          <Section IconComponent={IconLock} title="5. Privacy & Data">
            • We only store necessary data (name, email, tasks, goals){'\n'}
            • Your data will never be sold to third parties{'\n'}
            • You can delete your account at any time from Settings{'\n'}
            • Account deletion permanently removes all your data{'\n'}
            • We use industry-standard encryption for data protection{'\n'}
            • For more details, see our Privacy Policy
          </Section>

          <Section IconComponent={IconWarning} title="6. Disclaimer of Warranties">
            The app is provided "as is" without warranties of any kind. We do not guarantee:{'\n\n'}
            • Uninterrupted availability or uptime{'\n'}
            • Error-free operation{'\n'}
            • Protection against data loss due to technical issues{'\n'}
            • Compatibility with all devices or operating systems{'\n\n'}
            You use the app at your own risk. We are not liable for any damages arising from your use of the service.
          </Section>

          <Section IconComponent={IconBan} title="7. Account Suspension & Termination">
            We reserve the right to suspend or terminate accounts for:{'\n\n'}
            • Violation of these Terms of Service{'\n'}
            • Abuse of the app or its features{'\n'}
            • Suspected fraudulent activity{'\n'}
            • Non-payment of premium subscriptions{'\n'}
            • Any conduct that harms other users or the service{'\n\n'}
            You may delete your account at any time from the Settings screen.
          </Section>

          <Section IconComponent={IconRefresh} title="8. Changes to Terms">
            We may update these Terms of Service at any time. We will notify you of significant changes via email or in-app notification. Continued use of the app after changes constitutes acceptance of the new terms.
          </Section>

          <Section IconComponent={IconMail} title="9. Contact & Support">
            If you have questions about these Terms of Service, please contact us through the Support feature in the app. We typically respond within 24-48 hours.
          </Section>

          <Section IconComponent={IconScale} title="10. Governing Law">
            These terms are governed by the laws of Germany. Any disputes will be resolved in accordance with German law. If any provision is found invalid, the remaining provisions remain in effect.
          </Section>

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.footerIcon, { backgroundColor: colors.primary + '20' }]}>
              <View style={[styles.footerCheckCircle, { borderColor: colors.primary }]}>
                <View style={[styles.footerCheck, { borderColor: colors.primary }]} />
              </View>
            </View>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Thank you for using Smart Week Planner!{'\n\n'}
              By continuing to use our app, you acknowledge that you have read, understood, and agree to these Terms of Service.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  backChevron: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '800', letterSpacing: -0.5 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SIZES.padding, paddingTop: 20 },
  
  introCard: {
    padding: 20,
    borderRadius: SIZES.radiusLg,
    borderWidth: 2,
    marginBottom: 24,
  },
  introTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    marginBottom: 8,
  },
  introText: {
    fontSize: SIZES.base,
    lineHeight: 22,
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sectionCard: {
    padding: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    flex: 1,
  },
  sectionText: {
    fontSize: SIZES.sm,
    lineHeight: 20,
    paddingLeft: 44,
  },

  footer: {
    padding: 20,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginTop: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.sm,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Icon Styles
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  // Document Icon
  iconDoc: {
    width: 16,
    height: 20,
    borderWidth: 2,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDocLine: {
    width: 8,
    height: 2,
    marginVertical: 1,
    borderRadius: 1,
  },

  // User Icon
  iconUserHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  iconUserBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  // Check Icon
  iconCheckmark: {
    width: 12,
    height: 18,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    transform: [{ rotate: '45deg' }],
    marginTop: -4,
  },

  // Star Icon
  iconStarContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStarPoint: {
    width: 3,
    height: 12,
    position: 'absolute',
  },

  // Lock Icon
  iconLockBody: {
    width: 14,
    height: 10,
    borderRadius: 2,
    marginTop: 6,
  },
  iconLockShackle: {
    width: 10,
    height: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    position: 'absolute',
    top: 6,
  },

  // Warning Icon
  iconTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  iconExclamation: {
    width: 2,
    height: 8,
    borderRadius: 1,
    position: 'absolute',
    top: 8,
  },

  // Ban Icon
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlash: {
    width: 2,
    height: 20,
    transform: [{ rotate: '45deg' }],
  },

  // Refresh Icon
  iconArrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderTopColor: 'transparent',
  },
  iconArrowHead: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    position: 'absolute',
    top: -1,
    right: 2,
    transform: [{ rotate: '45deg' }],
  },

  // Mail Icon
  iconEnvelope: {
    width: 20,
    height: 14,
    borderWidth: 2,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconEnvelopeFlap: {
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '-45deg' }],
    marginTop: -6,
  },

  // Scale Icon
  iconScaleBase: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    bottom: 6,
  },
  iconScalePole: {
    width: 2,
    height: 14,
    borderRadius: 1,
    position: 'absolute',
    bottom: 6,
  },
  iconScaleBeam: {
    width: 18,
    height: 2,
    borderRadius: 1,
    position: 'absolute',
    top: 8,
  },

  // Footer Icon
  footerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  footerCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCheck: {
    width: 8,
    height: 14,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    transform: [{ rotate: '45deg' }],
    marginTop: -3,
    marginLeft: 2,
  },
});
