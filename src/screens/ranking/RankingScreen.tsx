import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import { Colors } from '../../constants/theme';

/**
 * Modelo de dados que descreve a pontuação e posição de um morador na tabela de classificação.
 */
export interface ResidentRankingItem {
  /** Identificador único do morador */
  id: string;
  /** UUID do usuário no auth.users (necessário para notificações e cutucadas) */
  userId?: string;
  /** Posição na tabela de classificação */
  rank: number;
  /** Nome de exibição do morador */
  name: string;
  /** Iniciais para renderização do avatar */
  initials: string;
  /** Indica se é o perfil do usuário logado */
  isCurrentUser?: boolean;
  /** Quantidade total de tarefas cumpridas no ciclo */
  tasksCompleted: number;
  /** Moedas acumuladas para resgate na loja */
  coins: number;
  /** Total de pontos de experiência (XP) acumulados */
  xp: number;
  /** Nível atingido na moradia */
  level: number;
  /** Quantidade de tarefas pendentes ou próximas de vencer */
  pendingTasksCount?: number;
  /** Sinaliza se o botão de cutucada amigável deve ser destacado */
  highlightNudge?: boolean;
}

/**
 * Propriedades e callbacks da tela de ranking e gamificação.
 */
interface RankingScreenProps {
  /** Nome da república */
  houseName?: string;
  /** Identificação do ciclo corrente de pontuação */
  cycleName?: string;
  /** Dias restantes para o fechamento do ciclo */
  daysRemaining?: number;
  /** Lista opcional de moradores ordenada por classificação */
  rankingList?: ResidentRankingItem[];
  /** Callback para notificar/cutucar morador com pendências */
  onNudgePress?: (residentName: string, residentId?: string) => void;
  /** Callback para navegar até a loja de recompensas da república */
  onStorePress?: () => void;
}



/**
 * Tela de ranking de moradores, gamificação e pódio da república (Tela 24).
 * Apresenta o líder do ciclo, posições, pontuações de XP, moedas e recurso de cutucada para tarefas pendentes.
 *
 * @param props Dados do ciclo, lista de moradores e callbacks de cutucada e loja.
 */
export const RankingScreen: React.FC<RankingScreenProps> = ({
  houseName = 'Sua moradia',
  cycleName = 'Ciclo Atual',
  daysRemaining = 30,
  rankingList = [],
  onNudgePress,
  onStorePress,
}) => {
  const [nudgedMembers, setNudgedMembers] = useState<string[]>([]);

  const leader = rankingList[0];

  const handleNudge = (name: string, id?: string) => {
    if (onNudgePress) {
      onNudgePress(name, id);
    } else {
      Alert.alert(
        'Cutucada Enviada!',
        `${name} foi notificado sobre suas tarefas próximas do vencimento.`
      );
    }
    setNudgedMembers((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

  const formatXp = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' XP';
  };

  return (
    <View style={styles.wrapper}>
      <Svg height="320" width="320" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="rankingTopGlow" cx="60%" cy="30%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="320" height="320" fill="url(#rankingTopGlow)" />
      </Svg>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ranking</Text>
          <Text style={styles.headerSubtitle}>{houseName}</Text>
        </View>

        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={styles.storeBadge}
            activeOpacity={0.8}
            onPress={onStorePress}
          >
            <Feather name="shopping-bag" size={13} color={Colors.primary} />
            <Text style={styles.storeBadgeText}>Loja</Text>
          </TouchableOpacity>

          <View style={styles.cycleBadge}>
            <View style={styles.cycleDot} />
            <Text style={styles.cycleBadgeText}>{cycleName}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rankingList.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Feather name="award" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum morador no ranking</Text>
            <Text style={styles.emptySubtitle}>
              Conclua tarefas domésticas para somar pontos de XP e subir no pódio da casa!
            </Text>
          </View>
        ) : (
          <>
            {leader && (
              <View style={styles.leaderCard}>
                <View style={styles.leaderTopRow}>
                  <Text style={styles.leaderSubtitle}>Líder atual</Text>
                  <View style={styles.daysRemainingBadge}>
                    <Text style={styles.daysRemainingText}>{daysRemaining} dias restantes</Text>
                  </View>
                </View>

                <View style={styles.leaderBottomRow}>
                  <Text style={styles.leaderName}>{leader.name}</Text>
                  <Text style={styles.leaderXp}>{formatXp(leader.xp)}</Text>
                </View>
              </View>
            )}

            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderTitle}>CLASSIFICAÇÃO DOS MORADORES</Text>
              <Text style={styles.listHeaderCriterion}>Critério: XP</Text>
            </View>

            <View style={styles.rankingListContainer}>
              {rankingList.map((item) => {
            const isFirst = item.rank === 1;
            const isNudged = nudgedMembers.includes(item.name);

            return (
              <View
                key={item.id}
                style={[
                  styles.rankingCard,
                  isFirst ? styles.rankingCardFirst : styles.rankingCardDefault,
                ]}
              >
                <View style={styles.leftGroup}>
                  <View style={styles.rankPositionBox}>
                    <Text
                      style={[
                        styles.rankPositionText,
                        isFirst ? styles.rankPositionTextFirst : styles.rankPositionTextDefault,
                      ]}
                    >
                      {item.rank}º
                    </Text>
                    {isFirst && (
                      <Feather
                        name="award"
                        size={12}
                        color={Colors.primary}
                        style={{ marginTop: 2 }}
                      />
                    )}
                  </View>

                  <View
                    style={[
                      styles.avatarBox,
                      isFirst ? styles.avatarBoxFirst : styles.avatarBoxDefault,
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        isFirst ? styles.avatarTextFirst : styles.avatarTextDefault,
                      ]}
                    >
                      {item.initials}
                    </Text>
                  </View>

                  <View style={styles.residentInfo}>
                    <View style={styles.residentNameRow}>
                      <Text style={styles.residentName}>{item.name}</Text>
                      {item.isCurrentUser && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>Você</Text>
                        </View>
                      )}
                      {item.pendingTasksCount !== undefined && item.pendingTasksCount > 0 && (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingBadgeText}>
                            {item.pendingTasksCount} pendentes
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.tasksAndCoinsRow}
                      activeOpacity={item.isCurrentUser && onStorePress ? 0.7 : 1}
                      onPress={item.isCurrentUser ? onStorePress : undefined}
                    >
                      <Text style={styles.residentMetaText}>{item.tasksCompleted} tarefas •</Text>
                      <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                        <Circle
                          cx={12}
                          cy={12}
                          r={9}
                          stroke="#CC92C2"
                          strokeWidth={2.5}
                          fill="#CC92C2"
                          fillOpacity={0.4}
                        />
                        <Circle
                          cx={12}
                          cy={12}
                          r={4.5}
                          stroke="#CC92C2"
                          strokeWidth={2.5}
                        />
                      </Svg>
                      <Text style={styles.residentMetaText}>{item.coins} moedas</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.rightGroup}>
                  <View style={styles.xpAndLevelCol}>
                    <Text
                      style={[
                        styles.xpText,
                        isFirst ? styles.xpTextFirst : styles.xpTextDefault,
                      ]}
                    >
                      {formatXp(item.xp)}
                    </Text>
                    <Text style={styles.levelText}>Nível {item.level}</Text>
                  </View>

                  {!item.isCurrentUser && (
                    <>
                      {item.highlightNudge ? (
                        <TouchableOpacity
                          style={[
                            styles.nudgeButtonHighlight,
                            isNudged && styles.nudgeButtonActive,
                          ]}
                          activeOpacity={0.8}
                          onPress={() => handleNudge(item.name, item.userId || item.id)}
                        >
                          <Feather
                            name={isNudged ? 'check' : 'zap'}
                            size={12}
                            color={isNudged ? Colors.primary : Colors.white}
                          />
                          <Text
                            style={[
                              styles.nudgeButtonHighlightText,
                              isNudged && styles.nudgeButtonActiveText,
                            ]}
                          >
                            {isNudged ? 'Enviado' : 'Cutucar'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.nudgeButtonDefault,
                            isNudged && styles.nudgeButtonDefaultActive,
                          ]}
                          activeOpacity={0.8}
                          onPress={() => handleNudge(item.name, item.userId || item.id)}
                        >
                          <Feather
                            name={isNudged ? 'check' : 'zap'}
                            size={14}
                            color={isNudged ? Colors.success : Colors.primary}
                          />
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>
            );
          })}
            </View>
          </>
        )}
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
    top: -100,
    right: -80,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 14 : 52,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  storeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  cycleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.20)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cycleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  cycleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 14,
  },
  leaderCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  leaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  leaderSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(252, 252, 252, 0.8)',
  },
  daysRemainingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  daysRemainingText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  leaderBottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  leaderName: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.white,
  },
  leaderXp: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(252, 252, 252, 0.85)',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: -2,
  },
  listHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  listHeaderCriterion: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  rankingListContainer: {
    gap: 10,
  },
  rankingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankingCardFirst: {
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  rankingCardDefault: {
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rankPositionBox: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPositionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  rankPositionTextFirst: {
    fontWeight: '900',
    color: Colors.primary,
  },
  rankPositionTextDefault: {
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBoxFirst: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarBoxDefault: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.30)',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
  avatarTextFirst: {
    color: Colors.white,
  },
  avatarTextDefault: {
    color: Colors.text,
  },
  residentInfo: {
    flex: 1,
    gap: 2,
  },
  residentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  residentName: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  pendingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: '#FEF2F2',
  },
  pendingBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.danger,
  },
  tasksAndCoinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  residentMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpAndLevelCol: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 12,
  },
  xpTextFirst: {
    fontWeight: '900',
    color: Colors.primary,
  },
  xpTextDefault: {
    fontWeight: '800',
    color: Colors.text,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  nudgeButtonDefault: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeButtonDefaultActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: Colors.success,
  },
  nudgeButtonHighlight: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  nudgeButtonHighlightText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  nudgeButtonActive: {
    backgroundColor: 'rgba(94, 43, 151, 0.12)',
  },
  nudgeButtonActiveText: {
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(94, 43, 151, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});