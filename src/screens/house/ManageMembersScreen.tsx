import React, { useState } from 'react';
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

interface PendingMember {
  id: string;
  name: string;
  email: string;
  initials: string;
}

interface ActiveMember {
  id: string;
  name: string;
  email?: string;
  statusText?: string;
  initials: string;
  isAdmin?: boolean;
  isCurrentUser?: boolean;
}

interface ManageMembersScreenProps {
  houseName?: string;
  onBackPress?: () => void;
  onViewQrPress?: () => void;
}

export const ManageMembersScreen: React.FC<ManageMembersScreenProps> = ({
  houseName = 'República do Sexteto Sinistro',
  onBackPress,
  onViewQrPress,
}) => {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([
    {
      id: 'p1',
      name: 'Homem-Areia',
      email: 'flint.marko@email.com',
      initials: 'HA',
    },
  ]);

  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([
    {
      id: 'a1',
      name: 'Norman Osborn',
      email: 'norman@oscorp.com',
      initials: 'NO',
      isAdmin: true,
      isCurrentUser: true,
    },
    {
      id: 'a2',
      name: 'Doutor Octopus',
      statusText: 'Saldo: R$ 0,00 • Em dia',
      initials: 'DO',
    },
    {
      id: 'a3',
      name: 'Lagarto',
      statusText: 'Saldo: R$ 0,00 • Em dia',
      initials: 'LG',
    },
  ]);

  const handleApprove = (member: PendingMember) => {
    setActiveMembers((prev) => [
      ...prev,
      {
        id: member.id,
        name: member.name,
        statusText: 'Saldo: R$ 0,00 • Em dia',
        initials: member.initials,
      },
    ]);
    setPendingMembers((prev) => prev.filter((item) => item.id !== member.id));
  };

  const handleReject = (memberId: string) => {
    setPendingMembers((prev) => prev.filter((item) => item.id !== memberId));
  };

  return (
    <View style={styles.wrapper}>
      <Svg height="260" width="260" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="manageTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#manageTopGlow)" />
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

          <TouchableOpacity
            style={styles.viewQrButton}
            activeOpacity={0.8}
            onPress={onViewQrPress}
          >
            <Feather name="grid" size={15} color={Colors.primary} />
            <Text style={styles.viewQrText}>Ver QR Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Moradores da casa</Text>
          <Text style={styles.subtitle}>
            {houseName} • {activeMembers.length} residentes ativos
          </Text>
        </View>

        {pendingMembers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.pendingDot} />
                <Text style={styles.sectionTitle}>Aguardando aprovação</Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>
                  {pendingMembers.length} {pendingMembers.length === 1 ? 'pendente' : 'pendentes'}
                </Text>
              </View>
            </View>

            {pendingMembers.map((member) => (
              <View key={member.id} style={styles.pendingCard}>
                <View style={styles.memberInfoRow}>
                  <View style={styles.pendingAvatar}>
                    <Text style={styles.pendingAvatarText}>{member.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    activeOpacity={0.8}
                    onPress={() => handleReject(member.id)}
                  >
                    <Feather name="x" size={16} color="#DC2626" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.approveButton}
                    activeOpacity={0.8}
                    onPress={() => handleApprove(member)}
                  >
                    <Feather name="check" size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moradores ativos</Text>

          <View style={styles.activeList}>
            {activeMembers.map((member) => (
              <View
                key={member.id}
                style={[
                  styles.activeCard,
                  member.isAdmin && styles.adminCardBorder,
                ]}
              >
                <View style={styles.memberInfoRow}>
                  <View
                    style={[
                      styles.activeAvatar,
                      member.isAdmin
                        ? styles.adminAvatar
                        : styles.regularAvatar,
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeAvatarText,
                        member.isAdmin && styles.adminAvatarText,
                      ]}
                    >
                      {member.initials}
                    </Text>
                  </View>
                  <View>
                    <View style={styles.nameRow}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {member.isCurrentUser && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>Você</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberEmail}>
                      {member.email || member.statusText}
                    </Text>
                  </View>
                </View>

                {member.isAdmin ? (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.optionsButton}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="more-horizontal"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.ruleNoticeCard}>
          <Feather
            name="info"
            size={16}
            color={Colors.primary}
            style={styles.ruleNoticeIcon}
          />
          <Text style={styles.ruleNoticeText}>
            Moradores com saldo devedor em aberto não podem ser removidos.
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
  viewQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewQrText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.text,
  },
  pendingBadge: {
    backgroundColor: 'rgba(132, 130, 143, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  pendingBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8FC',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
  },
  memberInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(204, 146, 194, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(204, 146, 194, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  memberName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.text,
  },
  memberEmail: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rejectButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeList: {
    gap: 8,
    marginTop: 8,
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  adminCardBorder: {
    borderColor: 'rgba(94, 43, 151, 0.3)',
  },
  activeAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatar: {
    backgroundColor: Colors.primary,
  },
  regularAvatar: {
    backgroundColor: 'rgba(204, 146, 194, 0.25)',
  },
  activeAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  adminAvatarText: {
    color: Colors.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  youBadge: {
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  adminBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  optionsButton: {
    padding: 6,
  },
  ruleNoticeCard: {
    backgroundColor: '#FAF8FC',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  ruleNoticeIcon: {
    marginTop: 1,
  },
  ruleNoticeText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
});

