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
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface PendingRequestScreenProps {
  houseName?: string;
  onBackPress?: () => void;
  onRefreshPress?: () => void;
  onCancelPress?: () => void;
}

export const PendingRequestScreen: React.FC<PendingRequestScreenProps> = ({
  houseName = 'República do Sexteto Sinistro',
  onBackPress,
  onRefreshPress,
  onCancelPress,
}) => {
  return (
    <View style={styles.wrapper}>
      <Svg height="260" width="260" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="pendingTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#pendingTopGlow)" />
      </Svg>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
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
            style={styles.navButton}
            activeOpacity={0.8}
            onPress={onRefreshPress}
          >
            <Feather name="rotate-cw" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <View style={styles.clockIllustrationContainer}>
            <View style={styles.clockPulseRing} />
            <View style={styles.clockCircle}>
              <Feather name="clock" size={42} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Solicitação enviada!</Text>
          <Text style={styles.subtitle}>
            Seu pedido de entrada foi registrado com sucesso e está aguardando a
            validação do administrador.
          </Text>

          <View style={styles.houseCard}>
            <View style={styles.houseCardTop}>
              <View style={styles.houseIconBox}>
                <Feather name="home" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.houseCardLabel}>Imóvel Solicitado</Text>
                <Text style={styles.houseCardName}>{houseName}</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status do Ingresso:</Text>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusPillText}>Aguardando aprovação</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Feather
              name="info"
              size={17}
              color={Colors.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Você receberá uma notificação assim que o administrador da casa aceitar sua entrada.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={onCancelPress}
          >
            <Feather name="x-circle" size={16} color={Colors.textSecondary} />
            <Text style={styles.cancelButtonText}>Cancelar solicitação</Text>
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
    marginBottom: 10,
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
  centerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  clockIllustrationContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  clockPulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(204, 146, 194, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(204, 146, 194, 0.4)',
  },
  clockCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 22,
  },
  houseCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.22)',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 16,
  },
  houseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  houseIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  houseCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(132, 130, 143, 0.15)',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(132, 130, 143, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FAF8FC',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.2)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 4,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  cancelButton: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
