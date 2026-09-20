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
import Svg, { Defs, RadialGradient, Stop, Rect, Path } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface HouseSelectionScreenProps {
  userName?: string;
  userInitials?: string;
  onCreateHousePress?: () => void;
  onJoinHousePress?: () => void;
  onLogoutPress?: () => void;
}

export const HouseSelectionScreen: React.FC<HouseSelectionScreenProps> = ({
  userName = 'Norman Osborn',
  userInitials = 'NO',
  onCreateHousePress,
  onJoinHousePress,
  onLogoutPress,
}) => {
  return (
    <View style={styles.wrapper}>
      <Svg height="260" width="260" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="houseTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#houseTopGlow)" />
      </Svg>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View>
              <Text style={styles.greetingPrefix}>Olá, {userName}</Text>
              <Text style={styles.greetingTitle}>Seja bem-vindo</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={onLogoutPress}
          >
            <Feather name="log-out" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Onde você mora atualmente?</Text>
            <Text style={styles.subtitle}>
              Para começar a dividir tarefas e despesas, você precisa estar vinculado a uma residência.
            </Text>
          </View>

          <View style={styles.cardsContainer}>
            <View style={styles.primaryCard}>
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Administrador</Text>
              </View>

              <View style={styles.cardHeader}>
                <View style={styles.primaryIconBox}>
                  <Svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={Colors.white}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <Path d="M12 11v6" />
                    <Path d="M9 14h6" />
                  </Svg>
                </View>

                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Criar uma nova casa</Text>
                  <Text style={styles.cardDescription}>
                    Cadastre sua república ou apartamento e convide os demais moradores.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryActionButton}
                activeOpacity={0.85}
                onPress={onCreateHousePress}
              >
                <Text style={styles.primaryActionText}>Começar do zero</Text>
                <Feather name="arrow-right" size={14} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.secondaryCard}>
              <View style={styles.secondaryBadge}>
                <Text style={styles.secondaryBadgeText}>Novo morador</Text>
              </View>

              <View style={styles.cardHeader}>
                <View style={styles.secondaryIconBox}>
                  <Svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={Colors.primary}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <Rect x={3} y={3} width={7} height={7} />
                    <Rect x={14} y={3} width={7} height={7} />
                    <Rect x={14} y={14} width={7} height={7} />
                    <Rect x={3} y={14} width={7} height={7} />
                  </Svg>
                </View>

                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Entrar em uma casa</Text>
                  <Text style={styles.cardDescription}>
                    Escaneie o QR Code ou insira o código de convite enviado pelo seu colega.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.secondaryActionButton}
                activeOpacity={0.85}
                onPress={onJoinHousePress}
              >
                <Text style={styles.secondaryActionText}>Escanear QR Code ou código</Text>
                <Feather name="chevron-right" size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.ruleNotice}>
            <Feather
              name="info"
              size={15}
              color={Colors.primary}
              style={styles.ruleIcon}
            />
            <Text style={styles.ruleText}>
              <Text style={styles.ruleTextBold}>Regra da comunidade:</Text> Cada usuário só pode estar vinculado a uma casa ativa por vez.
            </Text>
          </View>
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
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 20 : 32,
    paddingBottom: Platform.OS === 'android' ? 44 : 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(94, 43, 151, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  greetingPrefix: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  greetingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  logoutButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  header: {
    marginBottom: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardsContainer: {
    gap: 20,
  },
  primaryCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 24,
    padding: 18,
    position: 'relative',
    marginTop: 6,
  },
  primaryBadge: {
    position: 'absolute',
    top: -11,
    right: 20,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#FCFCFC',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  primaryBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  secondaryCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.3)',
    borderRadius: 24,
    padding: 18,
    position: 'relative',
    marginTop: 6,
  },
  secondaryBadge: {
    position: 'absolute',
    top: -11,
    right: 20,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: '#FCFCFC',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  secondaryBadgeText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    paddingTop: 4,
  },
  primaryIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(204, 146, 194, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  primaryActionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.3)',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryActionText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  ruleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 43, 151, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 20,
    gap: 8,
  },
  ruleIcon: {
    marginTop: 1,
  },
  ruleText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  ruleTextBold: {
    fontWeight: '700',
    color: Colors.text,
  },
});

