import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface JoinHouseScreenProps {
  onBackPress?: () => void;
  onSubmitCode?: (code: string) => void;
}

export const JoinHouseScreen: React.FC<JoinHouseScreenProps> = ({
  onBackPress,
  onSubmitCode,
}) => {
  const [code, setCode] = useState('');
  const [flashActive, setFlashActive] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Svg height="260" width="260" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="joinTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#joinTopGlow)" />
      </Svg>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.8}
            onPress={onBackPress}
          >
            <Feather name="chevron-left" size={22} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, flashActive && styles.navButtonActive]}
            activeOpacity={0.8}
            onPress={() => setFlashActive(!flashActive)}
          >
            <Feather
              name="zap"
              size={18}
              color={flashActive ? Colors.primary : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Escanear QR Code</Text>
          <Text style={styles.subtitle}>
            Aponte a câmera para o QR Code fornecido pelo administrador da sua casa.
          </Text>
        </View>

        <View style={styles.cameraBoxContainer}>
          <View style={styles.cameraViewfinder}>
            <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
            <View style={[styles.cornerBracket, styles.bracketTopRight]} />
            <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
            <View style={[styles.cornerBracket, styles.bracketBottomRight]} />

            <View style={styles.scannerCenter}>
              <View style={styles.scannerDot} />
            </View>
          </View>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou digite o código</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <Feather
              name="key"
              size={18}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Ex: SPLIT-8924"
              placeholderTextColor={Colors.textSecondary}
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.helperNotice}>
            A entrada só será efetivada após aprovação do administrador.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.85}
          onPress={() => onSubmitCode && onSubmitCode(code)}
        >
          <Text style={styles.submitButtonText}>Solicitar entrada</Text>
          <Feather name="arrow-right" size={18} color={Colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 28,
    paddingBottom: Platform.OS === 'android' ? 44 : 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  navButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(94, 43, 151, 0.08)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  cameraBoxContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraViewfinder: {
    width: 240,
    height: 220,
    borderRadius: 24,
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.4)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.primary,
  },
  bracketTopLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  bracketTopRight: {
    top: 14,
    right: 14,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  bracketBottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  bracketBottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  scannerCenter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(204, 146, 194, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CC92C2',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(132, 130, 143, 0.2)',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1.2,
    height: '100%',
  },
  helperNotice: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
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
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});

