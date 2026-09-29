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
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import { Colors } from '../../constants/theme';

export interface UserProfileData {
  name: string;
  role: string;
  email: string;
  republicName: string;
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number;
  balance: number;
  coins: number;
  completedTasks: number;
  onTimePercentage: number;
}

interface ProfileScreenProps {
  user?: UserProfileData;
  onEditProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onManageMembersPress?: () => void;
  onHouseRulesPress?: () => void;
  onLeaveHousePress?: () => void;
  onStorePress?: () => void;
  onTasksPress?: () => void;
  onLogoutPress?: () => void;
}

const defaultUserData: UserProfileData = {
  name: 'Norman Osborn',
  role: 'Admin',
  email: 'norman.osborn@oscorp.com',
  republicName: 'República do Sexteto Sinistro',
  level: 4,
  levelTitle: 'Morador Mestre',
  xp: 1450,
  nextLevelXp: 2000,
  balance: 95.0,
  coins: 420,
  completedTasks: 18,
  onTimePercentage: 100,
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user = defaultUserData,
  onEditProfilePress,
  onNotificationsPress,
  onManageMembersPress,
  onHouseRulesPress,
  onLeaveHousePress,
  onStorePress,
  onTasksPress,
  onLogoutPress,
}) => {
  const xpPercent = Math.min(
    100,
    Math.round((user.xp / user.nextLevelXp) * 100)
  );
  const xpRemaining = user.nextLevelXp - user.xp;

  return (
    <View style={styles.container}>
      <View style={styles.glowTop}>
        <Svg width="340" height="340" viewBox="0 0 340 340">
          <Defs>
            <RadialGradient
              id="profileGlow"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor="#5E2B97" stopOpacity="0.12" />
              <Stop offset="50%" stopColor="#CC92C2" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#FCFCFC" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="340" height="340" fill="url(#profileGlow)" />
        </Svg>
      </View>

      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Meu perfil</Text>
          <Text style={styles.subtitle}>{user.republicName}</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={onNotificationsPress}
        >
          <Feather name="bell" size={20} color={Colors.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userCard}>
          <View style={styles.userLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NO</Text>
            </View>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>{user.role}</Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.7}
            onPress={onEditProfilePress}
          >
            <Feather name="edit-2" size={13} color={Colors.text} />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardSubtitle}>GAMIFICAÇÃO</Text>
              <Text style={styles.levelTitle}>
                Nível {user.level} • {user.levelTitle}
              </Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>{user.xp} XP</Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${xpPercent}%` }]} />
          </View>

          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>{xpPercent}% completo</Text>
            <Text style={styles.progressText}>
              Faltam {xpRemaining} XP para o Nível {user.level + 1}
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Balanço</Text>
            <Text style={styles.metricValuePositive}>
              {user.balance >= 0 ? `+R$ ${user.balance.toFixed(2).replace('.', ',')}` : `-R$ ${Math.abs(user.balance).toFixed(2).replace('.', ',')}`}
            </Text>
            <Text style={styles.metricSub}>{user.balance >= 0 ? 'Credor' : 'Devedor'}</Text>
          </View>

          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.7}
            onPress={onStorePress}
          >
            <View style={styles.coinsHeader}>
              <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="9" fill="#CC92C2" fillOpacity="0.4" stroke="#CC92C2" strokeWidth="2.5" />
                <Circle cx="12" cy="12" r="4.5" stroke="#CC92C2" strokeWidth="2.5" />
              </Svg>
              <Text style={styles.metricLabel}>Moedas</Text>
            </View>
            <Text style={styles.metricValuePurple}>{user.coins}</Text>
            <Text style={styles.metricSub}>Loja da casa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.7}
            onPress={onTasksPress}
          >
            <Text style={styles.metricLabel}>Tarefas</Text>
            <Text style={styles.metricValueBlack}>{user.completedTasks} feitas</Text>
            <Text style={styles.metricSub}>{user.onTimePercentage}% no prazo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={onManageMembersPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(94, 43, 151, 0.1)' }]}>
                <Feather name="users" size={17} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Gerenciar moradores</Text>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={onHouseRulesPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#F0EFF2' }]}>
                <Feather name="file-text" size={17} color={Colors.text} />
              </View>
              <Text style={styles.menuItemText}>Regras de convivência</Text>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={onLeaveHousePress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="log-out" size={17} color="#DC2626" />
              </View>
              <Text style={[styles.menuItemText, { color: '#DC2626' }]}>
                Desvincular-se da república
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={onLogoutPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#F0EFF2' }]}>
                <Feather name="power" size={17} color={Colors.textSecondary} />
              </View>
              <Text style={[styles.menuItemText, { color: Colors.textSecondary }]}>
                Sair da conta
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 44,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 340,
    height: 340,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D2D2A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#84828F',
    marginTop: 2,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  notificationBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5E2B97',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 110,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#5E2B97',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#5E2B97',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarText: {
    color: '#FCFCFC',
    fontSize: 16,
    fontWeight: '800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D2D2A',
  },
  roleTag: {
    backgroundColor: 'rgba(204, 146, 194, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2D2D2A',
  },
  userEmail: {
    fontSize: 12,
    color: '#84828F',
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D2D2A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#84828F',
    letterSpacing: 0.8,
  },
  levelTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2D2D2A',
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5E2B97',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5E2B97',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressText: {
    fontSize: 10,
    color: '#84828F',
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  coinsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#84828F',
  },
  metricValuePositive: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
    marginTop: 4,
  },
  metricValuePurple: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5E2B97',
    marginTop: 4,
  },
  metricValueBlack: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2D2D2A',
    marginTop: 4,
  },
  metricSub: {
    fontSize: 9,
    color: '#84828F',
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D2D2A',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});
