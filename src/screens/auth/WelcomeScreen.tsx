import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';
import { SplitHouseLogo } from '../../components/SplitHouseLogo';

interface WelcomeScreenProps {
  onLoginPress: () => void;
  onRegisterPress: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoginPress,
  onRegisterPress,
}) => {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#FCFCFC', '#FAF8FC', '#F3EDF8']}
        style={StyleSheet.absoluteFill}
      />

      <Svg height="260" width="260" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="welcomeTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#CC92C2" stopOpacity={0.25} />
            <Stop offset="50%" stopColor="#5E2B97" stopOpacity={0.06} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#welcomeTopGlow)" />
      </Svg>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerContainer}>
          <View style={styles.content}>
            <LinearGradient
              colors={['#5E2B97', '#401c69']}
              style={styles.logoBadge}
            >
              <SplitHouseLogo size={46} strokeWidth={2.1} />
            </LinearGradient>

            <Text style={styles.title}>
              Split<Text style={styles.titleHighlight}>House</Text>
            </Text>

            <Text style={styles.subtitle}>
              O APP QUE DIVIDE, MAS CONQUISTA!
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.iconCirclePrimary}>
                  <Feather name="pie-chart" size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Rateio justo e transparente</Text>
                  <Text style={styles.infoDescription}>
                    Divisão automática de contas sem cobranças desconfortáveis.
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.infoRow}>
                <View style={styles.iconCircleSecondary}>
                  <Feather name="check-square" size={18} color={Colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Muitas tarefas domésticas?</Text>
                  <Text style={styles.infoDescription}>
                    Temos escalas rotativas para distribuir as tarefas de forma justa.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={onLoginPress}
          >
            <Text style={styles.primaryButtonText}>Acessar minha conta</Text>
            <Feather name="arrow-right" size={18} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={onRegisterPress}
          >
            <Text style={styles.secondaryButtonText}>Criar nova conta</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            SplitHouse • O app que divide, mas conquista!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  topGlowSvg: {
    position: 'absolute',
    top: -40,
    right: -40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 8 : 24,
    paddingBottom: Platform.OS === 'android' ? 68 : 48,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  titleHighlight: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  infoCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCirclePrimary: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleSecondary: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(204, 146, 194, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(132, 130, 143, 0.15)',
    marginVertical: 12,
  },
  actions: {
    width: '100%',
    gap: 10,
    paddingTop: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.25)',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
