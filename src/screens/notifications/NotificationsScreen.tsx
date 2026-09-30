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
 * Modelo de dados que representa um alerta ou notificação enviada ao morador.
 */
export interface NotificationItem {
  /** Identificador único da notificação */
  id: string;
  /** Tipo temático da notificação */
  type: 'Validação' | 'Cutucada' | 'Vencimento' | 'Concluída';
  /** Categoria para filtragem rápida */
  categoryFilter: 'Validações' | 'Finanças' | 'Cutucadas';
  /** Indica se a notificação já foi visualizada pelo morador */
  isRead: boolean;
  /** Tempo transcorrido desde o disparo (ex.: 'Há 15 min') */
  timeAgo: string;
  /** Título do alerta */
  title: string;
  /** Descrição detalhada do evento ocorrido */
  description: string;
  /** Rótulo da ação interativa no card (ex.: 'Validar agora') */
  actionText?: string;
  /** Estilo de destaque do botão de ação */
  actionType?: 'primary' | 'secondary';
  /** Metadados adicionais de contexto */
  extraMeta?: string;
  /** Sinaliza se a notificação envolve ganho ou gasto de moedas */
  hasCoinIcon?: boolean;
}

/**
 * Propriedades e callbacks da central de notificações do morador.
 */
interface NotificationsScreenProps {
  /** Callback para voltar à tela anterior */
  onBackPress?: () => void;
  /** Callback disparado ao clicar no botão de ação de um item */
  onNotificationAction?: (notification: NotificationItem) => void;
  /** Callback para limpar as notificações já lidas */
  onClearReadPress?: () => void;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'Validação',
    categoryFilter: 'Validações',
    isRead: false,
    timeAgo: 'Há 15 min',
    title: 'Doutor Octopus concluiu uma tarefa',
    description: '"Limpar geladeira" foi finalizada com foto anexada para revisão.',
    actionText: 'Validar agora',
    actionType: 'primary',
    extraMeta: '+80 XP em jogo',
  },
  {
    id: '2',
    type: 'Cutucada',
    categoryFilter: 'Cutucadas',
    isRead: false,
    timeAgo: 'Há 1 hora',
    title: 'Lagarto te cutucou',
    description: '"Norman, não esquece que hoje é dia de descer o lixo!"',
    actionText: 'Ver minha tarefa',
    actionType: 'secondary',
  },
  {
    id: '3',
    type: 'Vencimento',
    categoryFilter: 'Finanças',
    isRead: false,
    timeAgo: 'Ontem',
    title: 'Conta de energia em 3 dias',
    description: 'Fatura da Enel de R$ 340,00 dividida entre 4. Sua cota é de R$ 85,00.',
    actionText: 'Ver detalhes',
    actionType: 'primary',
  },
  {
    id: '4',
    type: 'Concluída',
    categoryFilter: 'Validações',
    isRead: true,
    timeAgo: '2 dias atrás',
    title: 'Faxina da sala aprovada',
    description: 'Validada por Doutor Octopus. +120 XP e +35 moedas creditadas.',
    hasCoinIcon: true,
  },
];

type FilterCategory = 'Todas' | 'Validações' | 'Finanças' | 'Cutucadas';

/**
 * Tela da central de notificações e avisos da república (Tela 26).
 * Exibe convites para validação de tarefas, alertas financeiros de vencimento, cutucadas de moradores e avisos de gamificação.
 *
 * @param props Callbacks de navegação de retorno, execução de ações da notificação e limpeza de lidas.
 */
export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBackPress,
  onNotificationAction,
  onClearReadPress,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todas');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const countFor = (cat: FilterCategory) => {
    if (cat === 'Todas') return notifications.length;
    return notifications.filter((n) => n.categoryFilter === cat).length;
  };

  const filteredNotifications =
    activeFilter === 'Todas'
      ? notifications
      : notifications.filter((n) => n.categoryFilter === activeFilter);

  const handleClearRead = () => {
    const hasRead = notifications.some((n) => n.isRead);
    if (!hasRead) {
      Alert.alert('Sem notificações lidas', 'Todas as notificações ainda não foram lidas.');
      return;
    }
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    if (onClearReadPress) {
      onClearReadPress();
    }
  };

  const handleAction = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    if (onNotificationAction) {
      onNotificationAction(item);
    } else {
      Alert.alert(item.title, item.description);
    }
  };

  const renderIcon = (type: NotificationItem['type']) => {
    if (type === 'Validação') {
      return (
        <View style={styles.iconBoxPurple}>
          <Feather name="camera" size={20} color={Colors.primary} />
        </View>
      );
    }
    if (type === 'Cutucada') {
      return (
        <View style={styles.iconBoxPurpleLight}>
          <Feather name="zap" size={20} color={Colors.primary} />
        </View>
      );
    }
    if (type === 'Vencimento') {
      return (
        <View style={styles.iconBoxRed}>
          <Feather name="dollar-sign" size={20} color={Colors.danger} />
        </View>
      );
    }
    return (
      <View style={styles.iconBoxGray}>
        <Feather name="check" size={20} color={Colors.textSecondary} />
      </View>
    );
  };

  const renderBadge = (type: NotificationItem['type']) => {
    if (type === 'Validação') {
      return (
        <View style={styles.badgePurple}>
          <Text style={styles.badgePurpleText}>Validação</Text>
        </View>
      );
    }
    if (type === 'Cutucada') {
      return (
        <View style={styles.badgeLilac}>
          <Text style={styles.badgeLilacText}>Cutucada</Text>
        </View>
      );
    }
    if (type === 'Vencimento') {
      return (
        <View style={styles.badgeRed}>
          <Text style={styles.badgeRedText}>Vencimento</Text>
        </View>
      );
    }
    return (
      <View style={styles.badgeGray}>
        <Text style={styles.badgeGrayText}>Concluída</Text>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <Svg height="320" width="320" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="notificationsTopGlow" cx="60%" cy="30%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="320" height="320" fill="url(#notificationsTopGlow)" />
      </Svg>

      <View style={styles.header}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={onBackPress}
          >
            <Feather name="chevron-left" size={20} color={Colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notificações</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} pendentes de leitura` : 'Tudo em dia'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClearRead}
        >
          <Text style={styles.clearReadText}>Limpar lidas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {(['Todas', 'Validações', 'Finanças', 'Cutucadas'] as const).map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextActive,
                  ]}
                >
                  {filter} ({countFor(filter)})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.listContainer}>
          {filteredNotifications.map((item) => {
            const isUnread = !item.isRead;
            const isValidationUnread = isUnread && item.type === 'Validação';

            return (
              <View
                key={item.id}
                style={[
                  styles.notificationCard,
                  isValidationUnread && styles.notificationCardValidation,
                  !isUnread && styles.notificationCardRead,
                ]}
              >
                <View style={styles.cardMainRow}>
                  {renderIcon(item.type)}

                  <View style={styles.cardContentCol}>
                    <View style={styles.cardTopMetaRow}>
                      {renderBadge(item.type)}
                      <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
                    </View>

                    <Text style={styles.notificationTitle}>{item.title}</Text>

                    {item.hasCoinIcon ? (
                      <View style={styles.descriptionWithCoinRow}>
                        <Text style={styles.notificationDescription}>
                          Validada por Doutor Octopus. +120 XP e{' '}
                        </Text>
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
                        <Text style={styles.notificationDescription}>
                          {' '}+35 moedas creditadas.
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.notificationDescription}>
                        {item.description}
                      </Text>
                    )}

                    {item.actionText && (
                      <View style={styles.actionFooterRow}>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            item.actionType === 'secondary'
                              ? styles.actionButtonSecondary
                              : styles.actionButtonPrimary,
                          ]}
                          activeOpacity={0.85}
                          onPress={() => handleAction(item)}
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              item.actionType === 'secondary'
                                ? styles.actionButtonTextSecondary
                                : styles.actionButtonTextPrimary,
                            ]}
                          >
                            {item.actionText}
                          </Text>
                        </TouchableOpacity>

                        {item.extraMeta && (
                          <Text style={styles.extraMetaText}>{item.extraMeta}</Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
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
    paddingBottom: 8,
    zIndex: 10,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  clearReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.30)',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FCFCFC',
    fontWeight: '700',
  },
  listContainer: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.22)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  notificationCardValidation: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  notificationCardRead: {
    borderColor: 'rgba(132, 130, 143, 0.15)',
    opacity: 0.75,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBoxPurple: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxPurpleLight: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(204, 146, 194, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxRed: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxGray: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContentCol: {
    flex: 1,
  },
  cardTopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgePurple: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
  },
  badgePurpleText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  badgeLilac: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: 'rgba(204, 146, 194, 0.20)',
  },
  badgeLilacText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.text,
  },
  badgeRed: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: '#FEF2F2',
  },
  badgeRedText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.danger,
  },
  badgeGray: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: '#F4F4F5',
  },
  badgeGrayText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  timeAgoText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  notificationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  notificationDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  descriptionWithCoinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  actionFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.30)',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionButtonTextPrimary: {
    color: Colors.white,
  },
  actionButtonTextSecondary: {
    color: Colors.text,
  },
  extraMetaText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
