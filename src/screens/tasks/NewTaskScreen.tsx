import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import { Colors } from '../../constants/theme';

/**
 * Dados coletados pelo formulário de criação de nova tarefa.
 */
export interface TaskFormData {
  /** Título descritivo da atividade */
  title: string;
  /** Cômodo ou ambiente de execução */
  location: string;
  /** Tipo de atribuição: Fixa, Rotativa ou Emergencial */
  type: 'Fixa' | 'Rotativa' | 'Emergencial';
  /** Nome do morador selecionado para a responsabilidade */
  assignee: string;
  /** Iniciais do morador para exibição em avatar */
  assigneeInitials: string;
  /** Prazo limite de conclusão */
  deadline: string;
  /** Quantidade de experiência (XP) atribuída à tarefa */
  xp: number;
  /** Quantidade de moedas distribuídas */
  points: number;
}

/**
 * Propriedades e callbacks da tela de criação de tarefa.
 */
interface NewTaskScreenProps {
  /** Callback para voltar ao quadro de tarefas */
  onBackPress?: () => void;
  /** Callback de submissão dos dados da nova tarefa */
  onSubmitPress?: (taskData: TaskFormData) => void;
}

/**
 * Opção de membro da república para atribuição de responsabilidades.
 */
interface MemberOption {
  /** Identificador do membro */
  id: string;
  /** Nome de exibição */
  name: string;
  /** Iniciais do avatar */
  initials: string;
}

const MEMBERS: MemberOption[] = [
  { id: '1', name: 'Norman Osborn (Você)', initials: 'NO' },
  { id: '2', name: 'Doutor Octopus', initials: 'DO' },
  { id: '3', name: 'Lagarto', initials: 'LG' },
  { id: '4', name: 'Homem-Areia', initials: 'HA' },
];

const DEADLINE_OPTIONS = [
  'Hoje, 14:00',
  'Hoje, 18:00',
  'Hoje, 22:00',
  'Amanhã, 10:00',
  'Amanhã, 18:00',
  'Em 2 dias',
];

const ROOM_SUGGESTIONS = [
  'Cozinha',
  'Banheiro',
  'Sala de estar',
  'Área externa',
  'Quarto',
];

/**
 * Tela de criação e atribuição de novas tarefas domésticas (Tela 21).
 * Permite selecionar o responsável, tipo de rotatividade, cômodo da casa, prazo e recompensas em XP e moedas.
 *
 * @param props Handlers para retorno e submissão da tarefa criada.
 */
export const NewTaskScreen: React.FC<NewTaskScreenProps> = ({
  onBackPress,
  onSubmitPress,
}) => {
  const [title, setTitle] = useState('Lavar louça da janta');
  const [location, setLocation] = useState('Cozinha');
  const [taskType, setTaskType] = useState<'Fixa' | 'Rotativa' | 'Emergencial'>('Rotativa');
  const [selectedMember, setSelectedMember] = useState<MemberOption>({
    id: '1',
    name: 'Norman O.',
    initials: 'NO',
  });
  const [deadline, setDeadline] = useState('Hoje, 22:00');
  const [xp, setXp] = useState(30);
  const [coins, setCoins] = useState(10);

  const [activeModal, setActiveModal] = useState<'none' | 'assignee' | 'deadline' | 'rewards'>('none');
  const [customDeadline, setCustomDeadline] = useState('');

  const handleTypeChange = (type: 'Fixa' | 'Rotativa' | 'Emergencial') => {
    setTaskType(type);
    if (type === 'Rotativa') {
      setXp(30);
      setCoins(10);
    } else if (type === 'Fixa') {
      setXp(15);
      setCoins(5);
    } else if (type === 'Emergencial') {
      setXp(35);
      setCoins(10);
    }
  };

  const getTypeDescription = (type: 'Fixa' | 'Rotativa' | 'Emergencial') => {
    switch (type) {
      case 'Rotativa':
        return 'Tarefas rotativas alternam automaticamente o responsável a cada ciclo.';
      case 'Fixa':
        return 'Tarefas fixas mantêm o mesmo responsável em todas as repetições.';
      case 'Emergencial':
        return 'Tarefas emergenciais têm prioridade máxima e prazo imediato.';
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Por favor, informe o título da tarefa.');
      return;
    }

    const taskData: TaskFormData = {
      title: title.trim(),
      location: location.trim() || 'Geral',
      type: taskType,
      assignee: selectedMember.name.replace(' (Você)', ''),
      assigneeInitials: selectedMember.initials,
      deadline,
      xp,
      points: coins,
    };

    if (onSubmitPress) {
      onSubmitPress(taskData);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      <Svg height="320" width="320" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="newTaskTopGlow" cx="60%" cy="30%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="320" height="320" fill="url(#newTaskTopGlow)" />
      </Svg>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={onBackPress}
        >
          <Feather name="chevron-left" size={22} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Nova Tarefa</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.fieldSection}>
            <Text style={styles.cardLabel}>TÍTULO DA TAREFA</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Ex: Lavar louça da janta"
              placeholderTextColor="rgba(132, 130, 143, 0.45)"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.fieldSection}>
            <Text style={styles.cardLabel}>CÔMODO / LOCAL</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="Ex: Cozinha, Banheiro, Sala"
              placeholderTextColor="rgba(132, 130, 143, 0.45)"
              value={location}
              onChangeText={setLocation}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomSuggestionsContainer}
            >
              {ROOM_SUGGESTIONS.map((room) => {
                const isSelected = location.toLowerCase() === room.toLowerCase();
                return (
                  <TouchableOpacity
                    key={room}
                    style={[
                      styles.roomChip,
                      isSelected && styles.roomChipSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setLocation(room)}
                  >
                    <Text
                      style={[
                        styles.roomChipText,
                        isSelected && styles.roomChipTextSelected,
                      ]}
                    >
                      {room}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>TIPO DE TAREFA</Text>

          <View style={styles.typeButtonsGrid}>
            {(['Fixa', 'Rotativa', 'Emergencial'] as const).map((type) => {
              const isSelected = taskType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    isSelected && styles.typeButtonActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleTypeChange(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      isSelected && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.typeDescriptionText}>
            {getTypeDescription(taskType)}
          </Text>
        </View>

        <View style={styles.twoColsGrid}>
          <TouchableOpacity
            style={[styles.card, styles.colCard]}
            activeOpacity={0.8}
            onPress={() => setActiveModal('assignee')}
          >
            <View style={styles.cardLabelRow}>
              <Text style={styles.cardLabelSmall}>RESPONSÁVEL</Text>
              <Feather name="chevron-down" size={12} color={Colors.textSecondary} />
            </View>

            <View style={styles.assigneeContent}>
              <View style={styles.assigneeAvatar}>
                <Text style={styles.assigneeAvatarText}>
                  {selectedMember.initials}
                </Text>
              </View>
              <Text style={styles.assigneeName} numberOfLines={1}>
                {selectedMember.name.split(' ')[0] + ' ' + (selectedMember.name.split(' ')[1] ? selectedMember.name.split(' ')[1][0] + '.' : '')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.colCard]}
            activeOpacity={0.8}
            onPress={() => setActiveModal('deadline')}
          >
            <View style={styles.cardLabelRow}>
              <Text style={styles.cardLabelSmall}>PRAZO LIMITE</Text>
              <Feather name="chevron-down" size={12} color={Colors.textSecondary} />
            </View>

            <View style={styles.deadlineContent}>
              <Feather name="clock" size={13} color={Colors.text} />
              <Text style={styles.deadlineText} numberOfLines={1}>
                {deadline}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => setActiveModal('rewards')}
        >
          <View style={styles.cardLabelRow}>
            <Text style={styles.cardLabel}>RECOMPENSA AO CONCLUIR</Text>
            <Feather name="edit-2" size={12} color={Colors.textSecondary} />
          </View>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
              <View style={styles.xpBadgeBox}>
                <Text style={styles.xpBadgeText}>XP</Text>
              </View>
              <Text style={styles.rewardText}>+{xp} pontos de XP</Text>
            </View>

            <View style={styles.rewardItem}>
              <View style={styles.coinBadgeBox}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#CC92C2"
                    strokeWidth={2}
                    fill="#CC92C2"
                    fillOpacity={0.35}
                  />
                  <Circle
                    cx="12"
                    cy="12"
                    r="4.5"
                    stroke="#CC92C2"
                    strokeWidth={2}
                  />
                </Svg>
              </View>
              <Text style={styles.rewardText}>+{coins} Moedas</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.88}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Criar tarefa</Text>
          <Feather name="check" size={18} color="#FCFCFC" />
        </TouchableOpacity>

        <View style={styles.homeIndicator} />
      </View>

      <Modal
        visible={activeModal === 'assignee'}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveModal('none')}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Responsável</Text>
              <TouchableOpacity
                onPress={() => setActiveModal('none')}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {MEMBERS.map((member) => {
              const isSelected = selectedMember.id === member.id;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.modalOptionItem,
                    isSelected && styles.modalOptionItemSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedMember(member);
                    setActiveModal('none');
                  }}
                >
                  <View style={styles.modalMemberAvatar}>
                    <Text style={styles.modalMemberAvatarText}>{member.initials}</Text>
                  </View>
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected,
                    ]}
                  >
                    {member.name}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={activeModal === 'deadline'}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveModal('none')}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Definir Prazo Limite</Text>
              <TouchableOpacity
                onPress={() => setActiveModal('none')}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {DEADLINE_OPTIONS.map((item) => {
              const isSelected = deadline === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.modalOptionItem,
                    isSelected && styles.modalOptionItemSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setDeadline(item);
                    setActiveModal('none');
                  }}
                >
                  <Feather
                    name="clock"
                    size={16}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={styles.customDeadlineSection}>
              <TextInput
                style={styles.customDeadlineInput}
                placeholder="Ou digite outro prazo..."
                placeholderTextColor="rgba(132, 130, 143, 0.5)"
                value={customDeadline}
                onChangeText={setCustomDeadline}
              />
              <TouchableOpacity
                style={styles.customDeadlineButton}
                onPress={() => {
                  if (customDeadline.trim()) {
                    setDeadline(customDeadline.trim());
                    setCustomDeadline('');
                    setActiveModal('none');
                  }
                }}
              >
                <Text style={styles.customDeadlineButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={activeModal === 'rewards'}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal('none')}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveModal('none')}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recompensas da Tarefa</Text>
              <TouchableOpacity
                onPress={() => setActiveModal('none')}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.rewardAdjustSection}>
              <Text style={styles.rewardAdjustLabel}>Pontos de Experiência (XP)</Text>
              <View style={styles.adjustCounterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setXp((prev) => Math.max(5, prev - 5))}
                >
                  <Feather name="minus" size={16} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.counterValueText}>+{xp} XP</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setXp((prev) => prev + 5)}
                >
                  <Feather name="plus" size={16} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rewardAdjustSection}>
              <Text style={styles.rewardAdjustLabel}>Moedas da Casa</Text>
              <View style={styles.adjustCounterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setCoins((prev) => Math.max(0, prev - 5))}
                >
                  <Feather name="minus" size={16} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.counterValueText}>+{coins} Moedas</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setCoins((prev) => prev + 5)}
                >
                  <Feather name="plus" size={16} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => setActiveModal('none')}
            >
              <Text style={styles.modalConfirmButtonText}>Confirmar Recompensas</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  backButton: {
    width: 40,
    height: 40,
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.20)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  fieldSection: {
    gap: 4,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  cardLabelSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(132, 130, 143, 0.15)',
    marginVertical: 10,
  },
  locationInput: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  roomSuggestionsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingBottom: 2,
  },
  roomChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(132, 130, 143, 0.08)',
  },
  roomChipSelected: {
    backgroundColor: 'rgba(94, 43, 151, 0.12)',
  },
  roomChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roomChipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  typeButtonsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#FCFCFC',
  },
  typeDescriptionText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 14,
  },
  twoColsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  colCard: {
    flex: 1,
    padding: 12,
  },
  assigneeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  assigneeAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeAvatarText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FCFCFC',
  },
  assigneeName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    flexShrink: 1,
  },
  deadlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    flexShrink: 1,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpBadgeBox: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primary,
  },
  coinBadgeBox: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: 'rgba(204, 146, 194, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 16 : 8,
    paddingTop: 8,
    backgroundColor: '#FCFCFC',
    gap: 8,
  },
  submitButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FCFCFC',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#2D2D2A',
    borderRadius: 100,
    alignSelf: 'center',
    opacity: 0.25,
    marginTop: 4,
    marginBottom: 4,
  },
  /* Modais */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalOptionItemSelected: {
    backgroundColor: 'rgba(94, 43, 151, 0.08)',
  },
  modalMemberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalMemberAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FCFCFC',
  },
  modalOptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  modalOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  customDeadlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(132, 130, 143, 0.15)',
  },
  customDeadlineInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    paddingHorizontal: 12,
    fontSize: 12,
    color: Colors.text,
  },
  customDeadlineButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customDeadlineButtonText: {
    color: '#FCFCFC',
    fontSize: 12,
    fontWeight: '700',
  },
  rewardAdjustSection: {
    marginBottom: 16,
  },
  rewardAdjustLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  adjustCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(132, 130, 143, 0.08)',
    borderRadius: 12,
    padding: 6,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  counterValueText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  modalConfirmButton: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  modalConfirmButtonText: {
    color: '#FCFCFC',
    fontSize: 14,
    fontWeight: '700',
  },
});
