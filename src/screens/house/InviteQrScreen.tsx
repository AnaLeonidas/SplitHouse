import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
  Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect, Path } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface InviteQrScreenProps {
  houseName?: string;
  houseCode?: string;
  onBackPress?: () => void;
  onSharePress?: () => void;
  onContinuePress?: () => void;
}

export const InviteQrScreen: React.FC<InviteQrScreenProps> = ({
  houseName = 'República do Sexteto Sinistro',
  houseCode = 'SPLIT-8924',
  onBackPress,
  onSharePress,
  onContinuePress,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (onSharePress) {
      onSharePress();
      return;
    }
    try {
      await Share.share({
        message: `Entre na minha república no SplitHouse usando o código: ${houseCode}`,
      });
    } catch {}
  };

  return (
    <View style={styles.wrapper}>
      <Svg height="260" width="260" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="inviteTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#inviteTopGlow)" />
      </Svg>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={onBackPress}
          >
            <Feather name="chevron-left" size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Etapa 2 de 2</Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Casa criada com sucesso!</Text>
          <Text style={styles.subtitle}>
            Compartilhe o código ou mostre o QR Code para os seus colegas entrarem na casa.
          </Text>
        </View>

        <View style={styles.qrCard}>
          <View style={styles.houseTag}>
            <View style={styles.houseIconContainer}>
              <Feather name="home" size={15} color={Colors.primary} />
            </View>
            <Text style={styles.houseNameText}>{houseName}</Text>
          </View>

          <View style={styles.qrContainer}>
            <Svg width="160" height="160" viewBox="0 0 160 160">
              <Rect x="10" y="10" width="40" height="40" rx="6" fill="#2D2D2A" />
              <Rect x="18" y="18" width="24" height="24" rx="3" fill="#FCFCFC" />
              <Rect x="24" y="24" width="12" height="12" rx="2" fill="#5E2B97" />

              <Rect x="110" y="10" width="40" height="40" rx="6" fill="#2D2D2A" />
              <Rect x="118" y="18" width="24" height="24" rx="3" fill="#FCFCFC" />
              <Rect x="124" y="24" width="12" height="12" rx="2" fill="#5E2B97" />

              <Rect x="10" y="110" width="40" height="40" rx="6" fill="#2D2D2A" />
              <Rect x="18" y="118" width="24" height="24" rx="3" fill="#FCFCFC" />
              <Rect x="24" y="124" width="12" height="12" rx="2" fill="#5E2B97" />

              <Rect x="60" y="15" width="10" height="10" rx="2" fill="#2D2D2A" />
              <Rect x="75" y="15" width="10" height="20" rx="2" fill="#2D2D2A" />
              <Rect x="90" y="25" width="10" height="10" rx="2" fill="#2D2D2A" />

              <Rect x="15" y="60" width="20" height="10" rx="2" fill="#2D2D2A" />
              <Rect x="25" y="75" width="10" height="20" rx="2" fill="#2D2D2A" />
              <Rect x="15" y="90" width="10" height="10" rx="2" fill="#2D2D2A" />

              <Rect x="115" y="60" width="10" height="15" rx="2" fill="#2D2D2A" />
              <Rect x="135" y="70" width="15" height="10" rx="2" fill="#2D2D2A" />
              <Rect x="125" y="90" width="10" height="15" rx="2" fill="#2D2D2A" />

              <Rect x="60" y="120" width="15" height="10" rx="2" fill="#2D2D2A" />
              <Rect x="85" y="130" width="10" height="15" rx="2" fill="#2D2D2A" />
              <Rect x="105" y="120" width="20" height="10" rx="2" fill="#2D2D2A" />
              <Rect x="135" y="135" width="15" height="15" rx="2" fill="#2D2D2A" />

              <Rect x="60" y="60" width="40" height="40" rx="10" fill="#5E2B97" />
              <Path
                d="M68 76 L80 69 L92 76 V87 A2 2 0 0 1 90 89 H70 A2 2 0 0 1 68 87 Z"
                fill="none"
                stroke="#FCFCFC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.qrHelperText}>
            Aponte a câmera pelo aplicativo para entrar
          </Text>
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>Ou compartilhe este código</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{houseCode}</Text>
            <TouchableOpacity
              style={[styles.copyButton, copied && styles.copyButtonActive]}
              activeOpacity={0.8}
              onPress={handleCopy}
            >
              <Feather
                name={copied ? 'check' : 'copy'}
                size={14}
                color={copied ? Colors.primary : Colors.text}
              />
              <Text
                style={[
                  styles.copyButtonText,
                  copied && styles.copyButtonTextActive,
                ]}
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.ruleNotice}>
          * Os novos moradores precisarão da sua aprovação como administrador para visualizar as contas e tarefas.
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.shareButton}
            activeOpacity={0.85}
            onPress={handleShare}
          >
            <Feather name="share-2" size={16} color={Colors.primary} />
            <Text style={styles.shareButtonText}>Compartilhar link ou código</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            activeOpacity={0.85}
            onPress={onContinuePress}
          >
            <Text style={styles.continueButtonText}>Acessar painel da casa</Text>
            <Feather name="arrow-right" size={18} color={Colors.white} />
          </TouchableOpacity>
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
  backButton: {
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
  stepBadge: {
    backgroundColor: 'rgba(132, 130, 143, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
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
    paddingHorizontal: 8,
  },
  qrCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.22)',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  houseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  houseIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  qrContainer: {
    padding: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrHelperText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  codeSection: {
    width: '100%',
    marginBottom: 12,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8FC',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  codeText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  copyButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(94, 43, 151, 0.08)',
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  copyButtonTextActive: {
    color: Colors.primary,
  },
  ruleNotice: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  actionsContainer: {
    gap: 10,
  },
  shareButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  continueButton: {
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
  continueButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.white,
  },
});

