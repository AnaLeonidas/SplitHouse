import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';
import { SplitHouseLogo } from '../../components/SplitHouseLogo';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    if (!onFinish) {
      return;
    }

    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <TouchableWithoutFeedback onPress={onFinish}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#6830a6', '#5E2B97', '#421b70', '#341459']}
          locations={[0, 0.45, 0.85, 1]}
          style={StyleSheet.absoluteFill}
        />

        <Svg
          height="100%"
          width="100%"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <RadialGradient
              id="pinkGlow"
              cx="50%"
              cy="50%"
              rx="46%"
              ry="46%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor="#CC92C2" stopOpacity={0.36} />
              <Stop offset="55%" stopColor="#CC92C2" stopOpacity={0.12} />
              <Stop offset="100%" stopColor="#5E2B97" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#pinkGlow)" />
        </Svg>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <SplitHouseLogo size={60} strokeWidth={2.1} />
          </View>

          <Text style={styles.title}>
            Split<Text style={styles.titleHighlight}>House</Text>
          </Text>

          <Text style={styles.tagline}>
            Seu app de divisão de despesas e tarefas!
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 48,
    paddingBottom: Platform.OS === 'android' ? 36 : 24,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  logoContainer: {
    width: 108,
    height: 108,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  titleHighlight: {
    color: Colors.secondary,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(252, 252, 252, 0.8)',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? 20 : 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
    opacity: 0.6,
  },
  dotActive: {
    backgroundColor: Colors.secondary,
    opacity: 1,
  },
});
