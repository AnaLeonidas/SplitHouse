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
import { Colors } from '../../constants/theme';

interface TasksListScreenProps {
  houseName?: string;
  tasks?: TaskItem[];
  onNewTaskPress?: () => void;
  onValidatePress?: (taskId: string) => void;
  onTaskPress?: (taskId: string) => void;
}

type FilterTab = 'my_tasks' | 'house' | 'validate';

export interface TaskItem {
  id: string;
  title: string;
  type: 'Rotativa' | 'Fixa' | 'Emergencial';
  location: string;
  deadline: string;
  xp: number;
  points?: number;
  assignee: string;
  status: 'Pendente' | 'Concluída' | 'Aguardando validação';
  icon: keyof typeof Feather.glyphMap;
  iconBg: string;
  iconColor: string;
  requiresValidation?: boolean;
  executorInfo?: string;
}

export const mockTasks: TaskItem[] = [
  {
    id: '1',
    title: 'Lavar louça do almoço',
    type: 'Rotativa',
    location: 'Cozinha',
    deadline: 'hoje às 14:00',
    xp: 30,
    points: 10,
    assignee: 'Você',
    status: 'Pendente',
    icon: 'home',
    iconBg: 'rgba(94, 43, 151, 0.1)',
    iconColor: Colors.primary,
  },
  {
    id: '2',
    title: 'Tirar lixo reciclável',
    type: 'Fixa',
    location: 'Área externa',
    deadline: 'hoje às 19:00',
    xp: 15,
    points: 5,
    assignee: 'Você',
    status: 'Pendente',
    icon: 'trash-2',
    iconBg: 'rgba(204, 146, 194, 0.25)',
    iconColor: Colors.primary,
  },
  {
    id: '3',
    title: 'Aspirar tapete da sala',
    type: 'Fixa',
    location: 'Sala de estar',
    deadline: 'hoje às 12:00',
    xp: 25,
    assignee: 'Doutor Octopus',
    status: 'Aguardando validação',
    icon: 'check-circle',
    iconBg: 'rgba(94, 43, 151, 0.12)',
    iconColor: Colors.primary,
    requiresValidation: true,
    executorInfo: 'Executada por Doutor Octopus com foto',
  },
  {
    id: '4',
    title: 'Limpar a geladeira',
    type: 'Rotativa',
    location: 'Cozinha',
    deadline: 'Amanhã às 10:00',
    xp: 40,
    points: 15,
    assignee: 'Lagarto',
    status: 'Pendente',
    icon: 'archive',
    iconBg: 'rgba(132, 130, 143, 0.12)',
    iconColor: Colors.textSecondary,
  },
  {
    id: '5',
    title: 'Comprar materiais de limpeza',
    type: 'Emergencial',
    location: 'Mercado',
    deadline: 'Em 2 dias',
    xp: 35,
    points: 10,
    assignee: 'Homem-Areia',
    status: 'Pendente',
    icon: 'shopping-bag',
    iconBg: 'rgba(204, 146, 194, 0.2)',
    iconColor: Colors.primary,
  },
];

export const TasksListScreen: React.FC<TasksListScreenProps> = ({
  houseName = 'República do Sexteto Sinistro',
  tasks,
  onNewTaskPress,
  onValidatePress,
  onTaskPress,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('my_tasks');
  const taskList = tasks || mockTasks;

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'my_tasks':
        return taskList.filter(
          (t) => t.assignee === 'Você' || t.requiresValidation
        );
      case 'house':
        return taskList;
      case 'validate':
        return taskList.filter((t) => t.requiresValidation);
      default:
        return taskList;
    }
  };

  const filteredTasks = getFilteredTasks();
  const myTasksCount = taskList.filter((t) => t.assignee === 'Você').length;
  const houseTasksCount = taskList.length;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tarefas</Text>
            <Text style={styles.subtitle}>{houseName}</Text>
          </View>

          <TouchableOpacity
            style={styles.newTaskButton}
            activeOpacity={0.8}
            onPress={onNewTaskPress}
          >
            <Feather name="plus" size={16} color={Colors.white} />
            <Text style={styles.newTaskButtonText}>Nova tarefa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterTabsContainer}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'my_tasks' && styles.filterPillActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('my_tasks')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeTab === 'my_tasks' && styles.filterPillTextActive,
              ]}
            >
              Minhas Tarefas ({myTasksCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'house' && styles.filterPillActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('house')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeTab === 'house' && styles.filterPillTextActive,
              ]}
            >
              Casa ({houseTasksCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              styles.validatePill,
              activeTab === 'validate' && styles.filterPillActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('validate')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeTab === 'validate' && styles.filterPillTextActive,
              ]}
            >
              Validar
            </Text>
            <View
              style={[
                styles.validateDot,
                activeTab === 'validate' && styles.validateDotActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tasksListContainer}>
          {filteredTasks.map((task) => {
            if (task.requiresValidation) {
              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.validationCard}
                  activeOpacity={0.8}
                  onPress={() => onValidatePress && onValidatePress(task.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleGroup}>
                      <View style={styles.validationIconBox}>
                        <Feather
                          name={task.icon}
                          size={20}
                          color={Colors.primary}
                        />
                      </View>
                      <View style={styles.cardInfoCol}>
                        <Text style={styles.cardTitle}>{task.title}</Text>
                        <Text style={styles.cardSubtitle}>
                          {task.executorInfo || 'Aguardando validação de foto'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.validationXpBadge}>
                      <Text style={styles.validationXpText}>+{task.xp} XP</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardFooter}>
                    <Text style={styles.validationFooterStatus}>
                      Aguardando sua validação
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => onValidatePress && onValidatePress(task.id)}
                    >
                      <Text style={styles.validationActionText}>
                        Avaliar foto →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                activeOpacity={0.8}
                onPress={() => onTaskPress && onTaskPress(task.id)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleGroup}>
                    <View
                      style={[
                        styles.taskIconBox,
                        { backgroundColor: task.iconBg },
                      ]}
                    >
                      <Feather
                        name={task.icon}
                        size={20}
                        color={task.iconColor}
                      />
                    </View>

                    <View style={styles.cardInfoCol}>
                      <View style={styles.titleWithTagRow}>
                        <Text style={styles.cardTitle}>{task.title}</Text>
                        <View
                          style={[
                            styles.typeBadge,
                            task.type === 'Rotativa'
                              ? styles.typeBadgeRotativa
                              : task.type === 'Fixa'
                              ? styles.typeBadgeFixa
                              : styles.typeBadgeEmergencial,
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeBadgeText,
                              task.type === 'Rotativa'
                                ? styles.typeBadgeRotativaText
                                : task.type === 'Fixa'
                                ? styles.typeBadgeFixaText
                                : styles.typeBadgeEmergencialText,
                            ]}
                          >
                            {task.type}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.cardSubtitle}>
                        {task.location} • Prazo: {task.deadline}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardXpText}>+{task.xp} XP</Text>
                    {task.points !== undefined && (
                      <>
                        <Text style={styles.rewardBullet}>•</Text>
                        <View style={styles.coinIconOuter}>
                          <View style={styles.coinIconInner} />
                        </View>
                        <Text style={styles.rewardPointsText}>
                          +{task.points}
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                  <Text style={styles.assigneeText}>
                    Responsável:{' '}
                    <Text style={styles.assigneeBold}>{task.assignee}</Text>
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{task.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 52,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  newTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  newTaskButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  validatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validateDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  validateDotActive: {
    backgroundColor: Colors.white,
  },
  tasksListContainer: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  validationCard: {
    backgroundColor: '#FAF8FC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.3)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  taskIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validationIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(94, 43, 151, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfoCol: {
    flex: 1,
  },
  titleWithTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  typeBadgeRotativa: {
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
  },
  typeBadgeRotativaText: {
    color: Colors.primary,
    fontSize: 9.5,
    fontWeight: '700',
  },
  typeBadgeFixa: {
    backgroundColor: 'rgba(132, 130, 143, 0.15)',
  },
  typeBadgeFixaText: {
    color: Colors.text,
    fontSize: 9.5,
    fontWeight: '700',
  },
  typeBadgeEmergencial: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  typeBadgeEmergencialText: {
    color: Colors.danger,
    fontSize: 9.5,
    fontWeight: '700',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 43, 151, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  rewardXpText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  rewardBullet: {
    color: Colors.textSecondary,
    fontSize: 8,
  },
  coinIconOuter: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CC92C2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(204, 146, 194, 0.3)',
  },
  coinIconInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CC92C2',
  },
  rewardPointsText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  validationXpBadge: {
    backgroundColor: 'rgba(204, 146, 194, 0.3)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  validationXpText: {
    color: Colors.text,
    fontSize: 10.5,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(132, 130, 143, 0.14)',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneeText: {
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  assigneeBold: {
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    backgroundColor: 'rgba(132, 130, 143, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
  validationFooterStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  validationActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
