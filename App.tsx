import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  PanResponder,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { HouseSelectionScreen } from './src/screens/house/HouseSelectionScreen';
import { CreateHouseScreen } from './src/screens/house/CreateHouseScreen';
import { SetupRulesScreen } from './src/screens/house/SetupRulesScreen';
import { InviteQrScreen } from './src/screens/house/InviteQrScreen';
import { JoinHouseScreen } from './src/screens/house/JoinHouseScreen';
import { PendingRequestScreen } from './src/screens/house/PendingRequestScreen';
import { ManageMembersScreen } from './src/screens/house/ManageMembersScreen';
import { HomeScreen } from './src/screens/dashboard/HomeScreen';
import { ExpensesListScreen } from './src/screens/finance/ExpensesListScreen';
import { NewExpenseScreen } from './src/screens/finance/NewExpenseScreen';
import { ExpenseDetailsScreen } from './src/screens/finance/ExpenseDetailsScreen';
import { SettleUpScreen } from './src/screens/finance/SettleUpScreen';
import { ConfirmPaymentScreen } from './src/screens/finance/ConfirmPaymentScreen';
import { ReportScreen } from './src/screens/finance/ReportScreen';
import { TasksListScreen, TaskItem } from './src/screens/tasks/TasksListScreen';
import { NewTaskScreen } from './src/screens/tasks/NewTaskScreen';
import { TaskDetailsScreen } from './src/screens/tasks/TaskDetailsScreen';
import { ValidateTaskScreen } from './src/screens/tasks/ValidateTaskScreen';
import { RankingScreen, ResidentRankingItem } from './src/screens/ranking/RankingScreen';
import { StoreScreen, StoreItem } from './src/screens/store/StoreScreen';
import { NotificationsScreen, NotificationItem } from './src/screens/notifications/NotificationsScreen';
import { ProfileScreen } from './src/screens/profile/ProfileScreen';
import { ProposeRewardScreen } from './src/screens/store/ProposeRewardScreen';
import { EditProfileScreen } from './src/screens/profile/EditProfileScreen';
import { HouseRulesScreen } from './src/screens/profile/HouseRulesScreen';
import { EditHouseRulesScreen } from './src/screens/profile/EditHouseRulesScreen';
import { LeaveHouseScreen } from './src/screens/profile/LeaveHouseScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { tasksService } from './src/services/tasksService';
import { houseService, CreateHouseInput } from './src/services/houseService';
import { profileService } from './src/services/profileService';
import { storeService } from './src/services/storeService';
import { rankingService } from './src/services/rankingService';
import { notificationsService } from './src/services/notificationsService';
import { financeService } from './src/services/financeService';
import { pickImageWithPrompt, uploadImage } from './src/services/storageService';
import { MinhaMoradia, MembroMoradia, RegraMoradiaDB, RegraInput, ExpenseDetailsData } from './src/types/database';
import { HouseRule } from './src/screens/profile/HouseRulesScreen';

/** Cores aplicadas em ciclo aos ícones das regras da casa na visualização do estatuto. */
const RULE_COLORS: Pick<HouseRule, 'iconBgColor' | 'iconColor'>[] = [
  { iconBgColor: 'rgba(94, 43, 151, 0.1)', iconColor: '#5E2B97' },
  { iconBgColor: 'rgba(204, 146, 194, 0.25)', iconColor: '#5E2B97' },
  { iconBgColor: '#F3F4F6', iconColor: '#2D2D2A' },
];

/**
 * Gera as iniciais (até 2 letras) de um nome para uso em avatares.
 */
function getInitials(name?: string | null): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * União de todos os identificadores de rotas e telas do SplitHouse.
 * Permite navegação declarativa entre os 32 fluxos da aplicação.
 */
type Screen =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'house_selection'
  | 'create_house'
  | 'setup_rules'
  | 'invite_qr'
  | 'join_house'
  | 'pending_request'
  | 'manage_members'
  | 'home'
  | 'expenses_list'
  | 'tasks_list'
  | 'ranking'
  | 'profile'
  | 'store'
  | 'propose_reward'
  | 'notifications'
  | 'new_task'
  | 'task_details'
  | 'task_validation'
  | 'new_expense'
  | 'expense_details'
  | 'settle_up'
  | 'payment_validation'
  | 'report'
  | 'edit_profile'
  | 'house_rules'
  | 'edit_house_rules'
  | 'leave_house';

/**
 * Componente raiz do aplicativo SplitHouse.
 * Responsável por gerenciar o estado global de navegação, barra inferior com 5 abas,
 * controle por gestos de arraste lateral (swipe) e renderização condicional das 32 telas.
 */
function MainApp() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [myHouse, setMyHouse] = useState<MinhaMoradia | null>(null);
  const [members, setMembers] = useState<MembroMoradia[]>([]);
  const [houseRules, setHouseRules] = useState<RegraMoradiaDB[]>([]);
  const [houseDraft, setHouseDraft] = useState<CreateHouseInput | null>(null);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [rankingList, setRankingList] = useState<ResidentRankingItem[]>([]);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [expensesList, setExpensesList] = useState<any[]>([]);
  const [selectedExpenseDetails, setSelectedExpenseDetails] = useState<ExpenseDetailsData | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [taskValidation, setTaskValidation] = useState<{
    photoUrl: string | null;
    executorId: string | null;
    sentAt: string | null;
  } | null>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [settleUpData, setSettleUpData] = useState<{ netBalance: string; isPositive: boolean; debts: any[] }>({
    netBalance: 'R$ 0,00',
    isPositive: true,
    debts: [],
  });
  const [reportData, setReportData] = useState<{ totalAmount: string; averagePerResident: string; history: any[] }>({
    totalAmount: '0,00',
    averagePerResident: '0,00',
    history: [],
  });

  const isApprovedMember = myHouse?.status === 'aprovado';
  const isAdmin = isApprovedMember && myHouse?.papel === 'admin';

  /**
   * Consulta a moradia do usuário logado e atualiza o estado local.
   */
  const loadMyHouse = async (): Promise<MinhaMoradia | null> => {
    try {
      const house = await houseService.getMyHouse();
      setMyHouse(house);
      return house;
    } catch {
      return null;
    }
  };

  /**
   * Direciona o usuário após autenticação: casa aprovada -> home, solicitação -> pendente,
   * sem vínculo -> seleção de moradia.
   */
  const routeAfterAuth = async () => {
    const house = await loadMyHouse();
    if (house?.status === 'aprovado') {
      setCurrentScreen('home');
    } else if (house?.status === 'pendente') {
      setCurrentScreen('pending_request');
    } else {
      setCurrentScreen('house_selection');
    }
  };

  const loadMembers = async (moradiaId: string) => {
    try {
      setMembers(await houseService.listMembers(moradiaId));
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao carregar moradores.');
    }
  };

  const loadRules = async (moradiaId: string) => {
    try {
      setHouseRules(await houseService.fetchRules(moradiaId));
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao carregar regras.');
    }
  };

  const loadRanking = async (moradiaId: string) => {
    try {
      const items = await rankingService.fetchRanking(moradiaId, user?.id);
      if (items && items.length > 0) {
        setRankingList(items);
      }
    } catch (err) {
      console.warn('App: Erro ao carregar ranking:', err);
    }
  };

  const loadStore = async (moradiaId: string) => {
    try {
      const items = await storeService.fetchStoreItems(moradiaId);
      setStoreItems(items);
    } catch (err) {
      console.warn('App: Erro ao carregar loja:', err);
    }
  };

  const loadFinanceOverview = async (moradiaId: string) => {
    if (!user) return;
    try {
      const settle = await financeService.fetchSettleUpData(moradiaId, user.id);
      setSettleUpData(settle);
      const rep = await financeService.fetchFinancialReport(moradiaId);
      setReportData(rep);
      setPendingPayments(await financeService.fetchPendingPayments(moradiaId, user.id));
    } catch (err) {
      console.warn('App: Erro ao carregar balanço financeiro:', err);
    }
  };

  const loadExpenses = async (moradiaId: string) => {
    try {
      const exp = await financeService.fetchExpenses(moradiaId);
      setExpensesList(exp || []);
    } catch (err) {
      console.warn('App: Erro ao carregar despesas:', err);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const notes = await notificationsService.fetchNotifications(user.id, myHouse?.moradia_id);
      setNotificationsList(notes);
    } catch (err) {
      console.warn('App: Erro ao carregar notificações:', err);
    }
  };

  /** Notifica os demais moradores aprovados da moradia (cada um recebe a sua notificação). */
  const notifyHouse = (
    payload: Omit<Parameters<typeof notificationsService.notifyUsers>[1], 'moradiaId' | 'senderId'>,
    onlyUserIds?: string[]
  ) => {
    if (!myHouse?.moradia_id || !user) return;
    const targets =
      onlyUserIds ?? members.filter((m) => m.status === 'aprovado').map((m) => m.usuario_id);
    notificationsService.notifyUsers(targets, {
      ...payload,
      moradiaId: myHouse.moradia_id,
      senderId: user.id,
    });
  };

  // Atualiza notificações, tarefas e despesas periodicamente (ações de outros moradores)
  useEffect(() => {
    if (!user || myHouse?.status !== 'aprovado') return;
    const refresh = () => {
      loadNotifications();
      reloadTasks();
      loadExpenses(myHouse.moradia_id);
    };
    loadNotifications();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, [user?.id, myHouse?.moradia_id, myHouse?.status]);

  /** Recarrega tarefas da moradia. */
  const reloadTasks = async () => {
    const fetched = await tasksService.fetchTasks(
      myHouse?.status === 'aprovado' ? myHouse.moradia_id : undefined,
      user?.id
    );
    setTasks(fetched || []);
  };

  /** Abre a tarefa na tela adequada conforme o estado dela. */
  const openTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setSelectedTaskId(taskId);
    if (task.status === 'Aguardando validação') {
      if (task.assignee === 'Você') {
        Alert.alert('Aguardando validação', 'Sua tarefa foi enviada. Outro morador precisa aprová-la.');
        return;
      }
      setTaskValidation(null);
      setCurrentScreen('task_validation');
      setTaskValidation(await tasksService.getPendingValidation(taskId));
    } else if (task.status === 'Concluída') {
      Alert.alert('Tarefa concluída', 'Esta tarefa já foi validada e concluída.');
    } else {
      setCurrentScreen('task_details');
    }
  };

  useEffect(() => {
    if (
      !loading &&
      !user &&
      currentScreen !== 'splash' &&
      currentScreen !== 'welcome' &&
      currentScreen !== 'login' &&
      currentScreen !== 'register' &&
      currentScreen !== 'forgot_password'
    ) {
      setCurrentScreen('welcome');
    }
  }, [user, loading, currentScreen]);

  useEffect(() => {
    if (!user) {
      setMyHouse(null);
      setMembers([]);
      setHouseRules([]);
      setTasks([]);
      setRankingList([]);
      setStoreItems([]);
      setNotificationsList([]);
      setExpensesList([]);
      setSelectedExpenseDetails(null);
      setSelectedExpenseId(null);
      setSettleUpData({ netBalance: 'R$ 0,00', isPositive: true, debts: [] });
      setReportData({ totalAmount: '0,00', averagePerResident: '0,00', history: [] });
      return;
    }
    loadMyHouse();
  }, [user]);

  useEffect(() => {
    if (!myHouse?.moradia_id || myHouse.status !== 'aprovado') {
      setMembers([]);
      setHouseRules([]);
      setRankingList([]);
      setStoreItems([]);
      return;
    }
    loadMembers(myHouse.moradia_id);
    loadRules(myHouse.moradia_id);
    loadRanking(myHouse.moradia_id);
    loadStore(myHouse.moradia_id);
    loadNotifications();
    loadExpenses(myHouse.moradia_id);
    loadFinanceOverview(myHouse.moradia_id);
  }, [myHouse?.moradia_id, myHouse?.status]);

  useEffect(() => {
    async function loadTasks() {
      const fetched = await tasksService.fetchTasks(
        myHouse?.status === 'aprovado' ? myHouse.moradia_id : undefined,
        user?.id
      );
      setTasks(fetched || []);
      if (myHouse?.moradia_id && myHouse.status === 'aprovado') {
        loadRanking(myHouse.moradia_id);
      }
    }
    loadTasks();
  }, [user, myHouse?.moradia_id, myHouse?.status]);

  const approvedMembers = members.filter((m) => m.status === 'aprovado');
  const pendingMembers = members.filter((m) => m.status === 'pendente');

  const effectiveRankingList: ResidentRankingItem[] =
    rankingList.length > 0
      ? rankingList
      : [...approvedMembers]
          .sort((a, b) => b.xp - a.xp)
          .map((m, index) => ({
            id: m.id,
            userId: m.usuario_id,
            rank: index + 1,
            name: m.nome || 'Morador',
            initials: getInitials(m.nome),
            isCurrentUser: m.usuario_id === user?.id,
            tasksCompleted: tasks.filter(
              (t) => (t.assigneeId === m.usuario_id || t.assignee.includes(m.nome || '')) && t.status === 'Concluída'
            ).length,
            coins: m.moedas || 0,
            xp: m.xp || 0,
            level: m.nivel || 1,
            pendingTasksCount: tasks.filter(
              (t) => (t.assigneeId === m.usuario_id || t.assignee.includes(m.nome || '')) && t.status === 'Pendente'
            ).length,
          }));

  const currentMember = approvedMembers.find((m) => m.usuario_id === user?.id);
  const houseLeader = effectiveRankingList[0];

  const newTaskMembersList = approvedMembers.map((m) => ({
    id: m.usuario_id,
    name:
      m.usuario_id === user?.id
        ? `${m.nome || 'Você'} (Você)`
        : m.nome || 'Morador',
    initials: getInitials(m.nome),
  }));

  const leaveCandidates = approvedMembers
    .filter((m) => m.usuario_id !== user?.id)
    .map((m) => ({
      id: m.id,
      name: m.nome || 'Morador',
      initials: getInitials(m.nome),
      levelInfo: `Nível ${m.nivel} • ${m.xp} XP`,
      avatarBg: '#2D2D2A',
      avatarTextColor: '#FFFFFF',
    }));

  const profileUserData = {
    name: profile?.nome_completo || 'Morador',
    role: myHouse?.papel === 'admin' ? 'Admin' : 'Morador',
    email: user?.email || profile?.email || '',
    republicName: myHouse?.nome || 'Minha Moradia',
    level: currentMember?.nivel || 1,
    levelTitle: currentMember?.titulo_nivel || 'Morador Iniciante',
    xp: currentMember?.xp || 0,
    nextLevelXp: (currentMember?.nivel || 1) * 100,
    balance: 0,
    coins: currentMember?.moedas || 0,
    completedTasks: tasks.filter(
      (t) =>
        t.status === 'Concluída' &&
        (t.assignee === 'Você' || t.assignee.includes(profile?.nome_completo || ''))
    ).length,
    onTimePercentage: 100,
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const isMainTabScreen =
    currentScreen === 'home' ||
    currentScreen === 'expenses_list' ||
    currentScreen === 'tasks_list' ||
    currentScreen === 'ranking' ||
    currentScreen === 'profile';

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 35 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          if (currentScreen === 'home') {
            setCurrentScreen('expenses_list');
          } else if (currentScreen === 'expenses_list') {
            setCurrentScreen('tasks_list');
          } else if (currentScreen === 'tasks_list') {
            setCurrentScreen('ranking');
          } else if (currentScreen === 'ranking') {
            setCurrentScreen('profile');
          }
        } else if (gestureState.dx > 50) {
          if (currentScreen === 'profile') {
            setCurrentScreen('ranking');
          } else if (currentScreen === 'ranking') {
            setCurrentScreen('tasks_list');
          } else if (currentScreen === 'tasks_list') {
            setCurrentScreen('expenses_list');
          } else if (currentScreen === 'expenses_list') {
            setCurrentScreen('home');
          }
        }
      },
    })
  ).current;

  /** Aprova ou recusa a tarefa em validação (nunca a própria) e avisa o executor. */
  const handleTaskValidation = async (approved: boolean, justification?: string) => {
    if (!selectedTaskId || !selectedTask || !user) return;
    if (selectedTask.assigneeId === user.id) {
      Alert.alert('Não permitido', 'Você não pode validar a sua própria tarefa.');
      return;
    }
    try {
      const ok = await tasksService.validateTask(selectedTaskId, user.id, approved, justification);
      if (!ok) throw new Error('Não foi possível registrar a validação.');
      if (selectedTask.assigneeId) {
        notifyHouse(
          {
            tipo: 'Concluída',
            categoryFilter: 'Validações',
            titulo: approved ? `${selectedTask.title} aprovada` : `${selectedTask.title} recusada`,
            descricao: approved
              ? `Validada por ${profileUserData.name}. +${selectedTask.xp} XP e +${selectedTask.points ?? 0} moedas creditadas.`
              : `Recusada por ${profileUserData.name}: ${justification || 'sem justificativa'}. Refaça a tarefa e envie outra foto.`,
            hasCoinIcon: approved,
          },
          [selectedTask.assigneeId]
        );
      }
      await reloadTasks();
      if (myHouse?.moradia_id) {
        loadMembers(myHouse.moradia_id);
        loadRanking(myHouse.moradia_id);
      }
      setTaskValidation(null);
      setCurrentScreen('tasks_list');
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
    }
  };

  /** Confirma ou rejeita um pagamento de acerto informado por outro morador. */
  const handlePaymentDecision = async (approved: boolean) => {
    if (!selectedPaymentId || !myHouse) return;
    const payment = pendingPayments.find((p) => p.id === selectedPaymentId);
    try {
      await financeService.confirmPayment(selectedPaymentId, approved);
      if (payment) {
        notifyHouse(
          {
            tipo: 'Vencimento',
            categoryFilter: 'Finanças',
            titulo: approved ? 'Pagamento confirmado' : 'Pagamento não confirmado',
            descricao: approved
              ? `${profileUserData.name} confirmou o recebimento de ${payment.amount}.`
              : `${profileUserData.name} informou que não recebeu o pagamento de ${payment.amount}.`,
            actionText: 'Ver acertos',
          },
          [payment.payerId]
        );
      }
      setSelectedPaymentId(null);
      await loadExpenses(myHouse.moradia_id);
      await loadFinanceOverview(myHouse.moradia_id);
      setCurrentScreen('settle_up');
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
    }
  };

  return (
    <>
      <StatusBar style={currentScreen === 'splash' ? 'light' : 'dark'} />

      {currentScreen === 'splash' && (
        <SplashScreen
          onFinish={() => {
            if (user) {
              routeAfterAuth();
            } else {
              setCurrentScreen('welcome');
            }
          }}
        />
      )}

      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onLoginPress={() => setCurrentScreen('login')}
          onRegisterPress={() => setCurrentScreen('register')}
        />
      )}

      {currentScreen === 'login' && (
        <LoginScreen
          onBackPress={() => setCurrentScreen('welcome')}
          onLoginSubmit={() => routeAfterAuth()}
          onForgotPasswordPress={() => setCurrentScreen('forgot_password')}
          onRegisterPress={() => setCurrentScreen('register')}
          onGooglePress={() => routeAfterAuth()}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onBackPress={() => setCurrentScreen('welcome')}
          onRegisterSubmit={(name, email, password) => setCurrentScreen('house_selection')}
          onLoginPress={() => setCurrentScreen('login')}
          onTermsPress={() => { }}
          onPrivacyPress={() => { }}
        />
      )}

      {currentScreen === 'forgot_password' && (
        <ForgotPasswordScreen
          onBackPress={() => setCurrentScreen('login')}
          onSubmit={(email) => { }}
          onLoginPress={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'house_selection' && (
        <HouseSelectionScreen
          userName={profile?.nome_completo || user?.email?.split('@')[0] || 'Morador'}
          userInitials={
            profile?.nome_completo
              ? profile.nome_completo
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
              : 'SH'
          }
          onCreateHousePress={() => setCurrentScreen('create_house')}
          onJoinHousePress={() => setCurrentScreen('join_house')}
          onLogoutPress={async () => {
            await signOut();
            setCurrentScreen('welcome');
          }}
        />
      )}

      {currentScreen === 'create_house' && (
        <CreateHouseScreen
          onBackPress={() => setCurrentScreen('house_selection')}
          onSubmit={(data) => {
            if (!data.name.trim() || !data.address.trim()) {
              Alert.alert('Atenção', 'Informe o nome e o endereço da moradia.');
              return;
            }
            setHouseDraft(data);
            setCurrentScreen('setup_rules');
          }}
        />
      )}

      {currentScreen === 'setup_rules' && (
        <SetupRulesScreen
          houseName={houseDraft?.name || 'sua moradia'}
          onBackPress={() => setCurrentScreen('create_house')}
          onSubmit={async (rules) => {
            if (!houseDraft) {
              setCurrentScreen('create_house');
              return;
            }
            const payload: RegraInput[] = rules
              .filter((r) => r.title.trim())
              .map((r) => ({ titulo: r.title.trim(), descricao: r.value.trim() }));
            try {
              await houseService.createHouse(houseDraft, payload);
              await loadMyHouse();
              setHouseDraft(null);
              setCurrentScreen('invite_qr');
            } catch (err) {
              Alert.alert(
                'Erro ao cadastrar moradia',
                err instanceof Error ? err.message : 'Tente novamente.'
              );
            }
          }}
        />
      )}

      {currentScreen === 'invite_qr' && (
        <InviteQrScreen
          houseName={myHouse?.nome}
          houseCode={myHouse?.codigo_convite}
          onBackPress={() => setCurrentScreen(isApprovedMember ? 'manage_members' : 'setup_rules')}
          onContinuePress={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'join_house' && (
        <JoinHouseScreen
          onBackPress={() => setCurrentScreen('house_selection')}
          onSubmitCode={async (code) => {
            if (!code.trim()) {
              Alert.alert('Atenção', 'Informe o código de convite.');
              return;
            }
            try {
              await houseService.joinByCode(code);
              await loadMyHouse();
              setCurrentScreen('pending_request');
            } catch (err) {
              Alert.alert(
                'Não foi possível entrar',
                err instanceof Error ? err.message : 'Tente novamente.'
              );
            }
          }}
        />
      )}

      {currentScreen === 'pending_request' && (
        <PendingRequestScreen
          houseName={myHouse?.nome}
          onBackPress={() => setCurrentScreen('join_house')}
          onRefreshPress={async () => {
            const house = await loadMyHouse();
            if (house?.status === 'aprovado') {
              setCurrentScreen('home');
            } else if (!house) {
              Alert.alert('Solicitação recusada', 'O administrador não aprovou sua entrada.');
              setCurrentScreen('house_selection');
            }
          }}
          onCancelPress={async () => {
            try {
              if (myHouse) await houseService.leaveHouse(myHouse.moradia_id);
              setMyHouse(null);
              setCurrentScreen('house_selection');
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
        />
      )}

      {currentScreen === 'manage_members' && (
        <ManageMembersScreen
          houseName={myHouse?.nome}
          canManage={isAdmin}
          activeMembers={members
            .filter((m) => m.status === 'aprovado')
            .map((m) => ({
              id: m.id,
              name: m.nome || 'Morador',
              email: m.email || undefined,
              initials: getInitials(m.nome),
              isAdmin: m.papel === 'admin',
              isCurrentUser: m.usuario_id === user?.id,
            }))}
          pendingMembers={members
            .filter((m) => m.status === 'pendente')
            .map((m) => ({
              id: m.id,
              name: m.nome || 'Morador',
              email: m.email || '',
              initials: getInitials(m.nome),
            }))}
          onBackPress={() => setCurrentScreen('home')}
          onViewQrPress={() => setCurrentScreen('invite_qr')}
          onApprove={async (memberId) => {
            try {
              await houseService.respondRequest(memberId, true);
              if (myHouse) await loadMembers(myHouse.moradia_id);
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
          onReject={async (memberId) => {
            try {
              await houseService.respondRequest(memberId, false);
              if (myHouse) await loadMembers(myHouse.moradia_id);
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
          onRemoveMember={async (memberId) => {
            try {
              await houseService.removeMember(memberId);
              if (myHouse) await loadMembers(myHouse.moradia_id);
              Alert.alert('Sucesso', 'Morador removido da moradia.');
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
          onPromoteAdmin={async (memberId) => {
            try {
              await houseService.promoteToAdmin(memberId);
              if (myHouse) await loadMembers(myHouse.moradia_id);
              Alert.alert('Sucesso', 'Morador promovido a administrador.');
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
        />
      )}

      {isMainTabScreen && (
        <View style={styles.tabContentContainer} {...panResponder.panHandlers}>
          {currentScreen === 'home' && (
            <HomeScreen
              tasks={tasks}
              houseName={myHouse?.nome || 'Sua moradia'}
              balanceAmount={settleUpData.netBalance.replace('R$ ', '').replace(' (Devedor)', '')}
              balanceStatus={settleUpData.isPositive ? (settleUpData.netBalance === 'R$ 0,00' ? 'Tudo em dia' : 'A receber') : 'A pagar'}
              leaderName={houseLeader?.name || (profile?.nome_completo || 'Você')}
              leaderXp={houseLeader?.xp || currentMember?.xp || 0}
              userLevel={currentMember?.nivel || 1}
              onExpensesTabPress={() => setCurrentScreen('expenses_list')}
              onTasksTabPress={() => setCurrentScreen('tasks_list')}
              onNewExpensePress={() => setCurrentScreen('new_expense')}
              onNewTaskPress={() => setCurrentScreen('new_task')}
              onTaskPress={(title) => {
                const found = tasks.find((t) => t.title === title);
                if (found) openTask(found.id);
              }}
              onNotificationsPress={() => setCurrentScreen('notifications')}
              onRankingPress={() => setCurrentScreen('ranking')}
              onSettleUpPress={() => { if (myHouse?.moradia_id) loadFinanceOverview(myHouse.moradia_id); setCurrentScreen('settle_up'); }}
              onReportPress={() => { if (myHouse?.moradia_id) loadFinanceOverview(myHouse.moradia_id); setCurrentScreen('report'); }}
              onManageMembersPress={() => setCurrentScreen('manage_members')}
            />
          )}

          {currentScreen === 'expenses_list' && (
            <ExpensesListScreen
              houseName={myHouse?.nome || 'Sua moradia'}
              expenses={expensesList}
              onAddPress={() => setCurrentScreen('new_expense')}
              onExpenseDetailsPress={async (expense) => {
                if (!expense?.id) return;
                setSelectedExpenseId(expense.id);
                setSelectedExpenseDetails(null);
                setCurrentScreen('expense_details');
                setSelectedExpenseDetails(await financeService.getExpenseDetails(expense.id));
              }}
            />
          )}

          {currentScreen === 'tasks_list' && (
            <TasksListScreen
              tasks={tasks}
              onNewTaskPress={() => setCurrentScreen('new_task')}
              onValidatePress={(taskId) => {
                if (taskId) openTask(taskId);
              }}
              onTaskPress={(taskId) => openTask(taskId)}
            />
          )}

          {currentScreen === 'ranking' && (
            <RankingScreen
              houseName={myHouse?.nome || 'Sua moradia'}
              cycleName={myHouse?.nome_ciclo_atual || 'Ciclo Atual'}
              rankingList={effectiveRankingList}
              onStorePress={() => {
                if (myHouse?.moradia_id) loadStore(myHouse.moradia_id);
                setCurrentScreen('store');
              }}
              onNudgePress={async (residentName, residentId) => {
                try {
                  let targetUserId = residentId;
                  const memberObj = members.find(
                    (m) =>
                      m.usuario_id === residentId ||
                      m.id === residentId ||
                      m.nome === residentName
                  );
                  if (memberObj) {
                    targetUserId = memberObj.usuario_id;
                  }
                  if (!targetUserId || !myHouse || !user) {
                    Alert.alert('Atenção', 'Morador não encontrado para enviar cutucada.');
                    return;
                  }
                  await rankingService.sendNudge({
                    targetUserId,
                    targetName: residentName,
                    senderUserId: user.id,
                    senderName: profileUserData?.name || 'Colega de moradia',
                    moradiaId: myHouse.moradia_id,
                  });
                  Alert.alert(
                    'Cutucada Enviada!',
                    `${residentName} foi notificado(a) sobre suas tarefas pendentes.`
                  );
                } catch (err) {
                  Alert.alert('Erro ao cutucar', err instanceof Error ? err.message : 'Não foi possível registrar a cutucada.');
                }
              }}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              user={profileUserData}
              onEditProfilePress={() => setCurrentScreen('edit_profile')}
              onNotificationsPress={() => setCurrentScreen('notifications')}
              onManageMembersPress={() => setCurrentScreen('manage_members')}
              onHouseRulesPress={() => {
                if (myHouse?.status === 'aprovado') loadRules(myHouse.moradia_id);
                setCurrentScreen('house_rules');
              }}
              onLeaveHousePress={() => setCurrentScreen('leave_house')}
              onStorePress={() => setCurrentScreen('store')}
              onTasksPress={() => setCurrentScreen('tasks_list')}
              onLogoutPress={async () => {
                await signOut();
                setCurrentScreen('welcome');
              }}
            />
          )}
        </View>
      )}

      {currentScreen === 'new_task' && (
        <NewTaskScreen
          membersList={newTaskMembersList}
          onBackPress={() => setCurrentScreen('tasks_list')}
          onSubmitPress={async (taskData) => {
            try {
              const created = await tasksService.createTask(taskData, user?.id, myHouse?.moradia_id);
              setTasks((prev) => [created, ...prev]);
              setCurrentScreen('tasks_list');
            } catch (err: any) {
              Alert.alert('Erro ao cadastrar tarefa', err?.message || 'Falha ao salvar no banco.');
            }
          }}
        />
      )}

      {currentScreen === 'task_details' && (
        <TaskDetailsScreen
          task={
            selectedTask
              ? {
                id: selectedTask.id,
                title: selectedTask.title,
                type: selectedTask.type,
                location: selectedTask.location,
                deadline: selectedTask.deadline,
                assignee:
                  selectedTask.assignee === 'Você'
                    ? (profile?.nome_completo ? `${profile.nome_completo} (Você)` : 'Você')
                    : selectedTask.assignee,
                xp: selectedTask.xp,
                points: selectedTask.points,
              }
              : undefined
          }
          onBackPress={() => setCurrentScreen('tasks_list')}
          canSubmit={!!selectedTask && selectedTask.assigneeId === user?.id}
          onSubmitValidation={async (photoUri) => {
            if (!selectedTaskId || !user || !myHouse) return;
            try {
              await tasksService.submitTaskValidation(selectedTaskId, photoUri, user.id);
              notifyHouse({
                tipo: 'Validação',
                categoryFilter: 'Validações',
                titulo: `${profileUserData.name} concluiu uma tarefa`,
                descricao: `"${selectedTask?.title}" foi finalizada com foto anexada para revisão.`,
                actionText: 'Validar agora',
                extraMeta: `+${selectedTask?.xp ?? 0} XP em jogo`,
              });
              await reloadTasks();
              Alert.alert('Enviada!', 'Tarefa enviada para validação dos moradores.');
              setCurrentScreen('tasks_list');
            } catch (err) {
              Alert.alert('Erro ao enviar', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
        />
      )}

      {currentScreen === 'task_validation' && (
        <ValidateTaskScreen
          task={
            selectedTask
              ? {
                id: selectedTask.id,
                title: selectedTask.title,
                executorName: selectedTask.assignee,
                executedAt: taskValidation?.sentAt
                  ? new Date(taskValidation.sentAt).toLocaleString('pt-BR')
                  : '',
                photoUrl: taskValidation?.photoUrl,
                photoTimestamp: taskValidation?.sentAt
                  ? new Date(taskValidation.sentAt).toLocaleString('pt-BR')
                  : '',
                xp: selectedTask.xp,
                points: selectedTask.points,
              }
              : undefined
          }
          onBackPress={() => setCurrentScreen('tasks_list')}
          onApprovePress={() => handleTaskValidation(true)}
          onRejectPress={(justification) => handleTaskValidation(false, justification)}
        />
      )}

      {currentScreen === 'new_expense' && (
        <NewExpenseScreen
          membersList={approvedMembers.map((m) => ({
            id: m.usuario_id,
            name: m.usuario_id === user?.id ? `${m.nome || 'Você'} (Você)` : (m.nome || 'Morador'),
          }))}
          onBackPress={() => setCurrentScreen('expenses_list')}
          onSubmitPress={async (data) => {
            if (!user || !myHouse) {
              Alert.alert('Atenção', 'Você precisa estar em uma moradia para cadastrar despesas.');
              return;
            }
            try {
              let comprovanteUrl: string | null = null;
              if (data.receiptUri) comprovanteUrl = await uploadImage(data.receiptUri, 'despesas');

              const splits = data.splits && data.splits.length > 0
                ? data.splits
                : approvedMembers.map((m) => ({
                    userId: m.usuario_id,
                    amount: parseFloat((data.amount / approvedMembers.length).toFixed(2)),
                  }));

              const targetMemberIds = splits.map((s) => s.userId);

              await financeService.createExpense(
                {
                  moradiaId: myHouse.moradia_id,
                  titulo: data.title,
                  categoria: data.category,
                  valorTotal: data.amount,
                  dataVencimento: data.dueDate,
                  tipoDivisao: data.divisionType,
                  pagadorId: data.payerId,
                  comprovanteUrl,
                },
                targetMemberIds,
                splits
              );

              const fmt = (v: number) =>
                v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              notifyHouse(
                {
                  tipo: 'Vencimento',
                  categoryFilter: 'Finanças',
                  titulo: `Nova despesa: ${data.title}`,
                  descricao: `${profileUserData.name} registrou uma despesa de R$ ${fmt(data.amount)} (${data.divisionType === 'igualitaria' ? 'Divisão igualitária' : data.divisionType === 'porcentagem' ? 'Divisão por porcentagem' : 'Divisão por valor fixo'}).`,
                  actionText: 'Ver despesas',
                },
                targetMemberIds
              );

              await loadExpenses(myHouse.moradia_id);
              await loadFinanceOverview(myHouse.moradia_id);
              setCurrentScreen('expenses_list');
              Alert.alert('Despesa cadastrada', 'A despesa foi dividida com sucesso.');
            } catch (err) {
              Alert.alert('Erro ao cadastrar despesa', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
        />
      )}

      {currentScreen === 'expense_details' && (
        <ExpenseDetailsScreen
          expense={
            selectedExpenseDetails
              ? {
                title: selectedExpenseDetails.title,
                amount: selectedExpenseDetails.amount,
                dueDate: selectedExpenseDetails.dueDate,
                category: selectedExpenseDetails.categoria,
                payerName: selectedExpenseDetails.payerName,
                receiptName: selectedExpenseDetails.receiptName,
              }
              : undefined
          }
          members={selectedExpenseDetails?.members.map((m) => ({
            id: m.id,
            name: m.name,
            initials: m.initials,
            role: m.role,
            isPaid: m.isPaid,
          }))}
          onBackPress={() => setCurrentScreen('expenses_list')}
          onReceiptPress={() => {
            if (selectedExpenseDetails?.receiptUrl) Linking.openURL(selectedExpenseDetails.receiptUrl);
          }}
          onNudgePress={() => {
            if (!selectedExpenseDetails) return;
            const pendingIds = selectedExpenseDetails.members
              .filter((m) => !m.isPaid && m.userId !== user?.id)
              .map((m) => m.userId);
            if (pendingIds.length === 0) {
              Alert.alert('Tudo certo', 'Não há moradores com pagamento pendente nesta despesa.');
              return;
            }
            notifyHouse(
              {
                tipo: 'Vencimento',
                categoryFilter: 'Finanças',
                titulo: 'Lembrete de despesa',
                descricao: `${profileUserData.name} lembrou você da despesa "${selectedExpenseDetails.title}".`,
                actionText: 'Ver despesas',
              },
              pendingIds
            );
            Alert.alert('Moradores notificados!', 'Os moradores pendentes receberam o lembrete.');
          }}
        />
      )}

      {currentScreen === 'settle_up' && (
        <SettleUpScreen
          debts={settleUpData.debts}
          netBalance={settleUpData.netBalance}
          isPositive={settleUpData.isPositive}
          pendingPayments={pendingPayments}
          onBackPress={() => setCurrentScreen('home')}
          onValidatePayment={(paymentId) => {
            setSelectedPaymentId(paymentId);
            setCurrentScreen('payment_validation');
          }}
          onNudgePress={(debt) => {
            if (!(debt.rawAmount > 0)) {
              Alert.alert('Atenção', 'Esta pendência é sua. Informe o pagamento quando acertar.');
              return;
            }
            notifyHouse(
              {
                tipo: 'Vencimento',
                categoryFilter: 'Finanças',
                titulo: 'Lembrete de pagamento',
                descricao: `${profileUserData.name} lembrou você de acertar ${debt.debtAmount}.`,
                actionText: 'Ver acertos',
              },
              [debt.debtorId]
            );
            Alert.alert('Lembrete enviado', `${debt.debtorName} foi notificado(a).`);
          }}
          onPayPress={() => {
            if (!user || !myHouse) return;
            const owed = settleUpData.debts.filter((d) => d.rawAmount < 0);
            if (owed.length === 0) {
              Alert.alert('Nada a pagar', 'Você não possui dívidas pendentes com os moradores.');
              return;
            }
            const pay = async (debt: any) => {
              const uri = await pickImageWithPrompt('Comprovante do pagamento');
              if (!uri) {
                Alert.alert('Comprovante necessário', 'Anexe o comprovante para informar o pagamento.');
                return;
              }
              try {
                const url = await uploadImage(uri, 'pagamentos');
                await financeService.informPayment({
                  moradiaId: myHouse.moradia_id,
                  devedorId: user.id,
                  credorId: debt.debtorId,
                  valor: Math.abs(debt.rawAmount),
                  comprovanteUrl: url,
                });
                notifyHouse(
                  {
                    tipo: 'Vencimento',
                    categoryFilter: 'Finanças',
                    titulo: 'Pagamento informado',
                    descricao: `${profileUserData.name} informou um pagamento de ${debt.debtAmount}. Confirme o recebimento.`,
                    actionText: 'Validar pagamento',
                  },
                  [debt.debtorId]
                );
                Alert.alert('Pagamento informado', `${debt.debtorName} precisa confirmar o recebimento.`);
              } catch (err) {
                Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
              }
            };
            if (owed.length === 1) {
              pay(owed[0]);
            } else {
              Alert.alert('Quem você pagou?', 'Selecione o morador.', [
                ...owed.slice(0, 3).map((d) => ({
                  text: `${d.debtorName} (${d.debtAmount})`,
                  onPress: () => pay(d),
                })),
                { text: 'Cancelar', style: 'cancel' as const },
              ]);
            }
          }}
        />
      )}

      {currentScreen === 'payment_validation' && (
        <ConfirmPaymentScreen
          paymentData={pendingPayments.find((p) => p.id === selectedPaymentId)}
          onBackPress={() => setCurrentScreen('settle_up')}
          onConfirmPress={() => handlePaymentDecision(true)}
          onRejectPress={() => handlePaymentDecision(false)}
        />
      )}

      {currentScreen === 'report' && (
        <ReportScreen
          totalAmount={reportData.totalAmount}
          averagePerResident={reportData.averagePerResident}
          history={reportData.history}
          onBackPress={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'store' && (
        <StoreScreen
          houseName={myHouse?.nome}
          initialCoins={currentMember?.moedas || 0}
          items={storeItems}
          onBackPress={() => {
            if (myHouse?.moradia_id) loadRanking(myHouse.moradia_id);
            setCurrentScreen('ranking');
          }}
          onProposePress={() => setCurrentScreen('propose_reward')}
          onRedeemPress={async (item) => {
            if (!user || !myHouse) return;
            await storeService.redeemReward({
              rewardId: item.id,
              userId: user.id,
              moradiaId: myHouse.moradia_id,
              cost: item.cost,
              rewardTitle: item.title,
            });
            if (myHouse.moradia_id) {
              await loadMembers(myHouse.moradia_id);
              await loadRanking(myHouse.moradia_id);
              await loadStore(myHouse.moradia_id);
            }
          }}
          onProposeSubmit={async (newItem) => {
            if (!user || !myHouse) return;
            await storeService.proposeReward(
              {
                title: newItem.title,
                category: newItem.category,
                cost: newItem.cost,
                description: newItem.description,
                limit: newItem.availability,
              },
              user.id,
              myHouse.moradia_id,
              profileUserData?.name
            );
            await loadStore(myHouse.moradia_id);
          }}
        />
      )}

      {currentScreen === 'propose_reward' && (
        <ProposeRewardScreen
          onBackPress={() => setCurrentScreen('store')}
          onSubmitSuccess={() => {
            if (myHouse?.moradia_id) loadStore(myHouse.moradia_id);
            setCurrentScreen('store');
          }}
          onSubmit={async (rewardData) => {
            if (!user || !myHouse) return;
            await storeService.proposeReward(
              {
                title: rewardData.title,
                category: rewardData.category,
                cost: rewardData.cost,
                description: rewardData.description,
                limit: rewardData.limit,
              },
              user.id,
              myHouse.moradia_id,
              profileUserData?.name
            );
            await loadStore(myHouse.moradia_id);
          }}
        />
      )}

      {currentScreen === 'edit_profile' && (
        <EditProfileScreen
          onBackPress={() => setCurrentScreen('profile')}
          onSave={async (data) => {
            const result = await profileService.updateProfile(data);
            await refreshProfile();
            if (myHouse?.status === 'aprovado') await loadMembers(myHouse.moradia_id);
            return result;
          }}
          onSaveSuccess={() => setCurrentScreen('profile')}
        />
      )}

      {currentScreen === 'house_rules' && (
        <HouseRulesScreen
          republicName={myHouse?.nome}
          updatedDate={(() => {
            const latest = houseRules
              .map((r) => r.atualizado_em)
              .filter(Boolean)
              .sort()
              .pop();
            return latest ? new Date(latest).toLocaleDateString('pt-BR') : undefined;
          })()}
          rules={houseRules.map((r, i): HouseRule => ({
            id: r.id,
            number: r.numero_ordem,
            title: r.titulo,
            highlight: r.destaque || '',
            description: r.descricao,
            iconName: (r.nome_icone as HouseRule['iconName']) || 'file-text',
            ...RULE_COLORS[i % RULE_COLORS.length],
          }))}
          onBackPress={() => setCurrentScreen('profile')}
          canEdit={isAdmin}
          onEditPress={() => {
            if (!isAdmin) {
              Alert.alert('Acesso negado', 'Apenas administradores podem editar as regras.');
              return;
            }
            setCurrentScreen('edit_house_rules');
          }}
        />
      )}

      {currentScreen === 'edit_house_rules' && (
        <EditHouseRulesScreen
          key={houseRules.map((r) => r.id).join(',')}
          republicName={myHouse?.nome}
          initialRules={houseRules.map((r) => ({
            titulo: r.titulo,
            destaque: r.destaque || '',
            descricao: r.descricao,
          }))}
          onBackPress={() => setCurrentScreen('house_rules')}
          onSave={async (rules) => {
            if (!myHouse) throw new Error('Moradia não encontrada.');
            await houseService.saveRules(myHouse.moradia_id, rules);
            await loadRules(myHouse.moradia_id);
          }}
          onSaveSuccess={() => setCurrentScreen('house_rules')}
        />
      )}

      {currentScreen === 'leave_house' && (
        <LeaveHouseScreen
          republicName={myHouse?.nome}
          candidates={leaveCandidates}
          balance={0}
          onBackPress={() => setCurrentScreen('profile')}
          onCancelPress={() => setCurrentScreen('profile')}
          onConfirmSuccess={async () => {
            try {
              if (myHouse) await houseService.leaveHouse(myHouse.moradia_id);
              setMyHouse(null);
              setMembers([]);
              setHouseRules([]);
              setCurrentScreen('house_selection');
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
        />
      )}

      {currentScreen === 'notifications' && (
        <NotificationsScreen
          onBackPress={() => setCurrentScreen('home')}
          notifications={notificationsList}
          onClearReadPress={async () => {
            if (user) {
              await notificationsService.clearReadNotifications(user.id);
              loadNotifications();
            }
          }}
          onNotificationAction={async (notification) => {
            await notificationsService.markAsRead(notification.id);
            loadNotifications();
            if (notification.categoryFilter === 'Validações') {
              await reloadTasks();
              const pending = (await tasksService.fetchTasks(myHouse?.moradia_id, user?.id)).find(
                (t) => t.status === 'Aguardando validação' && t.assignee !== 'Você'
              );
              if (pending) {
                setSelectedTaskId(pending.id);
                setTaskValidation(null);
                setCurrentScreen('task_validation');
                setTaskValidation(await tasksService.getPendingValidation(pending.id));
              } else {
                setCurrentScreen('tasks_list');
              }
            } else if (notification.categoryFilter === 'Finanças') {
              if (myHouse?.moradia_id) {
                loadExpenses(myHouse.moradia_id);
                loadFinanceOverview(myHouse.moradia_id);
              }
              setCurrentScreen(
                notification.actionText === 'Validar pagamento' || notification.actionText === 'Ver acertos'
                  ? 'settle_up'
                  : 'expenses_list'
              );
            } else {
              setCurrentScreen('tasks_list');
            }
          }}
        />
      )}

      {isMainTabScreen && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => setCurrentScreen('home')}
          >
            <Feather
              name="home"
              size={24}
              color={currentScreen === 'home' ? '#5E2B97' : '#84828F'}
            />
            <Text
              style={[
                styles.navTabText,
                currentScreen === 'home' && styles.navTabTextActive,
              ]}
            >
              Início
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => setCurrentScreen('expenses_list')}
          >
            <Feather
              name="dollar-sign"
              size={24}
              color={currentScreen === 'expenses_list' ? '#5E2B97' : '#84828F'}
            />
            <Text
              style={[
                styles.navTabText,
                currentScreen === 'expenses_list' && styles.navTabTextActive,
              ]}
            >
              Despesas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => setCurrentScreen('tasks_list')}
          >
            <Feather
              name="check-square"
              size={24}
              color={currentScreen === 'tasks_list' ? '#5E2B97' : '#84828F'}
            />
            <Text
              style={[
                styles.navTabText,
                currentScreen === 'tasks_list' && styles.navTabTextActive,
              ]}
            >
              Tarefas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => setCurrentScreen('ranking')}
          >
            <Feather
              name="award"
              size={24}
              color={currentScreen === 'ranking' ? '#5E2B97' : '#84828F'}
            />
            <Text
              style={[
                styles.navTabText,
                currentScreen === 'ranking' && styles.navTabTextActive,
              ]}
            >
              Ranking
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => setCurrentScreen('profile')}
          >
            <Feather
              name="user"
              size={24}
              color={currentScreen === 'profile' ? '#5E2B97' : '#84828F'}
            />
            <Text
              style={[
                styles.navTabText,
                currentScreen === 'profile' && styles.navTabTextActive,
              ]}
            >
              Perfil
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

/**
 * Componente raiz do aplicativo SplitHouse.
 * Envolve a aplicação com o AuthProvider para controle global de autenticação e sessão.
 */
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  tabContentContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FCFCFC',
    borderTopWidth: 1,
    borderTopColor: 'rgba(132, 130, 143, 0.2)',
    paddingBottom: Platform.OS === 'android' ? 44 : 24,
    paddingTop: 10,
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navTab: {
    alignItems: 'center',
    width: 64,
    paddingVertical: 2,
  },
  navTabText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
    color: '#84828F',
  },
  navTabTextActive: {
    fontWeight: 'bold',
    color: '#5E2B97',
  },
});