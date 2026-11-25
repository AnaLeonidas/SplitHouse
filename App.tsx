import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  BackHandler,
  AppState,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as SplashScreenNative from 'expo-splash-screen';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Feather } from '@expo/vector-icons';
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './src/screens/auth/ResetPasswordScreen';
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
import { supabase } from './src/services/supabase';
import { MinhaMoradia, MembroMoradia, RegraMoradiaDB, RegraInput, ExpenseDetailsData } from './src/types/database';
import { HouseRule } from './src/screens/profile/HouseRulesScreen';
import { calculateLevelAndTitle } from './src/utils/gamification';
import { showAlert } from './src/utils/alert';

WebBrowser.maybeCompleteAuthSession();
SplashScreenNative.preventAutoHideAsync().catch(() => {});
if (Platform.OS === 'web') {
  (Alert as any).alert = showAlert;
}
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: '218838549404-7v52lhu60s63f629b4ovr6endbjvnhn8.apps.googleusercontent.com',
  });
}

/** Cores aplicadas em ciclo aos ícones das regras da casa na visualização do estatuto. */
const RULE_COLORS: Pick<HouseRule, 'iconBgColor' | 'iconColor'>[] = [
  { iconBgColor: 'rgba(94, 43, 151, 0.1)', iconColor: '#5E2B97' },
  { iconBgColor: 'rgba(204, 146, 194, 0.25)', iconColor: '#5E2B97' },
  { iconBgColor: '#F3F4F6', iconColor: '#2D2D2A' },
];

/**
 * Gera as iniciais (até 2 letras) de um nome para uso em avatares.
 *
 * @param name Nome completo do morador (opcional).
 * @returns Iniciais em maiúsculas ou '??' caso o nome não esteja definido.
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
 * Permite navegação declarativa entre os 33 fluxos da aplicação.
 */
type Screen =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'reset_password'
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
 * Gerenciador principal de navegação e estado global do SplitHouse.
 * Controla roteamento declarativo entre as 33 telas, deep links, barra inferior com 5 abas
 * e navegação por gestos de arraste lateral (swipe).
 */
function MainApp() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [splashDone, setSplashDone] = useState(false);
  const [inviteSource, setInviteSource] = useState<'setup' | 'members'>('setup');
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
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');
  const openTaskRequestRef = useRef(0);
  const openExpenseRequestRef = useRef(0);
  const activeUidRef = useRef<string | null>(user?.id ?? null);
  const storeSourceRef = useRef<Screen>('ranking');
  const membersSourceRef = useRef<Screen>('home');
  const notificationsSourceRef = useRef<Screen>('home');
  const taskReturnRef = useRef<Screen>('tasks_list');
  const expenseReturnRef = useRef<Screen>('expenses_list');

  useEffect(() => {
    activeUidRef.current = user?.id ?? null;
  }, [user?.id]);

  const isApprovedMember = myHouse?.status === 'aprovado';
  const isAdmin = isApprovedMember && myHouse?.papel === 'admin';
  const isApprovedMemberRef = useRef(isApprovedMember);
  const inviteSourceRef = useRef(inviteSource);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    isApprovedMemberRef.current = isApprovedMember;
  }, [isApprovedMember]);

  useEffect(() => {
    inviteSourceRef.current = inviteSource;
  }, [inviteSource]);

  useEffect(() => {
    SplashScreenNative.hideAsync().catch(() => {});
  }, []);

  /**
   * Consulta a moradia do usuário logado e atualiza o estado local.
   */
  const loadMyHouse = useCallback(async (): Promise<MinhaMoradia | null> => {
    const uid = activeUidRef.current;
    if (!uid) return null;
    const house = await houseService.getMyHouse();
    if (activeUidRef.current !== uid) return null;
    setMyHouse(house);
    return house;
  }, []);

  /**
   * Direciona o usuário após autenticação: casa aprovada -> home, solicitação -> pendente,
   * sem vínculo -> seleção de moradia.
   */
  const routeAfterAuth = useCallback(async () => {
    try {
      const house = await loadMyHouse();
      if (!activeUidRef.current) return;
      if (house?.status === 'aprovado') {
        setCurrentScreen('home');
      } else if (house?.status === 'pendente') {
        setCurrentScreen('pending_request');
      } else {
        setCurrentScreen('house_selection');
      }
    } catch (err) {
      showAlert(
        'Erro de conexão',
        err instanceof Error ? err.message : 'Não foi possível carregar os dados da sua conta. Tente novamente.',
        currentScreenRef.current === 'splash'
          ? [
              { text: 'Tentar novamente', onPress: () => routeAfterAuth() },
              {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                  await signOut().catch(() => {});
                  setCurrentScreen('welcome');
                },
              },
            ]
          : [{ text: 'OK' }]
      );
    }
  }, [loadMyHouse, signOut]);

  const loadRanking = useCallback(async (moradiaId: string) => {
    const uid = activeUidRef.current;
    if (!uid) return;
    try {
      const items = await rankingService.fetchRanking(moradiaId, uid);
      if (activeUidRef.current !== uid) return;
      setRankingList(items || []);
    } catch (err) {
      console.warn('App: Erro ao carregar ranking:', err);
    }
  }, []);

  const loadMembers = useCallback(async (moradiaId: string, withRanking = false) => {
    const uid = activeUidRef.current;
    if (!uid) return;
    try {
      const data = await houseService.listMembers(moradiaId);
      if (activeUidRef.current !== uid) return;
      setMembers(data);
      if (withRanking) {
        loadRanking(moradiaId);
      }
    } catch (err) {
      if (activeUidRef.current === uid) {
        showAlert('Erro', err instanceof Error ? err.message : 'Falha ao carregar moradores.');
      }
    }
  }, [loadRanking]);

  const loadRules = useCallback(async (moradiaId: string) => {
    const uid = activeUidRef.current;
    if (!uid) return;
    try {
      const rules = await houseService.fetchRules(moradiaId);
      if (activeUidRef.current !== uid) return;
      setHouseRules(rules);
    } catch (err) {
      if (activeUidRef.current === uid) {
        showAlert('Erro', err instanceof Error ? err.message : 'Falha ao carregar regras.');
      }
    }
  }, []);

  const loadStore = useCallback(async (moradiaId: string) => {
    const uid = activeUidRef.current;
    if (!uid) return;
    try {
      const items = await storeService.fetchStoreItems(moradiaId);
      if (activeUidRef.current !== uid) return;
      setStoreItems(items);
    } catch (err) {
      console.warn('App: Erro ao carregar loja:', err);
    }
  }, []);

  const loadFinanceOverview = useCallback(async (moradiaId: string) => {
    const uid = activeUidRef.current;
    if (!uid) return;
    try {
      const settle = await financeService.fetchSettleUpData(moradiaId, uid);
      if (activeUidRef.current !== uid) return;
      setSettleUpData(settle);
      const rep = await financeService.fetchFinancialReport(moradiaId);
      if (activeUidRef.current !== uid) return;
      setReportData(rep);
      const pending = await financeService.fetchPendingPayments(moradiaId, uid);
      if (activeUidRef.current !== uid) return;
      setPendingPayments(pending);
    } catch (err) {
      console.warn('App: Erro ao carregar balanço financeiro:', err);
    }
  }, []);

  const loadExpenses = useCallback(async (moradiaId: string) => {
    const uid = activeUidRef.current;
    if (!uid) return;
    try {
      const exp = await financeService.fetchExpenses(moradiaId);
      if (activeUidRef.current !== uid) return;
      setExpensesList(exp || []);
    } catch (err) {
      console.warn('App: Erro ao carregar despesas:', err);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    const uid = activeUidRef.current;
    if (!uid) return;
    try {
      const notes = await notificationsService.fetchNotifications(uid, myHouse?.moradia_id);
      if (activeUidRef.current !== uid) return;
      setNotificationsList(notes);
    } catch (err) {
      console.warn('App: Erro ao carregar notificações:', err);
    }
  }, [myHouse?.moradia_id]);

  /** Recarrega tarefas da moradia. */
  const reloadTasks = useCallback(async () => {
    const uid = activeUidRef.current;
    if (!uid) return;
    try {
      const fetched = await tasksService.fetchTasks(
        myHouse?.status === 'aprovado' ? myHouse.moradia_id : undefined,
        uid
      );
      if (activeUidRef.current !== uid) return;
      setTasks(fetched || []);
    } catch (err) {
      console.warn('App: Erro ao recarregar tarefas:', err);
    }
  }, [myHouse?.status, myHouse?.moradia_id]);

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

  // Atualiza notificações, tarefas e despesas periodicamente apenas com o app em primeiro plano
  useEffect(() => {
    if (!user || myHouse?.status !== 'aprovado') return;
    const houseId = myHouse.moradia_id;

    const refreshAll = () => {
      if (appStateRef.current !== 'active') return;
      loadNotifications();
      reloadTasks();
      loadExpenses(houseId);
    };

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
      if (nextState === 'active') {
        refreshAll();
      }
    });

    loadNotifications();
    const timer = setInterval(refreshAll, 15000);
    return () => {
      clearInterval(timer);
      appStateSub.remove();
    };
  }, [user?.id, myHouse?.moradia_id, myHouse?.status, loadNotifications, reloadTasks, loadExpenses]);

  const handleDeepLink = useCallback(async (url?: string | null) => {
    if (!url) return;
    try {
      const queryPart = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
      const hashPart = url.includes('#') ? url.split('#')[1] : '';
      const queryParams = new URLSearchParams(queryPart);
      const hashParams = new URLSearchParams(hashPart);
      const getParam = (key: string) => hashParams.get(key) || queryParams.get(key);

      const errorParam = getParam('error');
      const errorDesc = getParam('error_description');
      const code = getParam('code');
      const accessToken = getParam('access_token');
      const refreshToken = getParam('refresh_token');
      const typeParam = getParam('type');

      if (errorParam || errorDesc) {
        showAlert('Autenticação', errorDesc || 'O link de verificação é inválido ou expirou.');
        return;
      }

      let establishedSession = false;
      if (code && Platform.OS !== 'web') {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data?.session) {
          activeUidRef.current = data.session.user.id;
          establishedSession = true;
        }
      } else if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error && data?.session) {
          activeUidRef.current = data.session.user.id;
          establishedSession = true;
        }
      } else if (Platform.OS === 'web' && code) {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          activeUidRef.current = data.session.user.id;
          establishedSession = true;
        }
      }

      if (url.includes('reset-password') || typeParam === 'recovery') {
        if (!establishedSession && (code || accessToken)) {
          showAlert('Link expirado', 'O link de recuperação expirou ou já foi utilizado. Solicite um novo.');
          setCurrentScreen('forgot_password');
          return;
        }
        setCurrentScreen('reset_password');
      } else if (
        url.includes('confirm-email') ||
        typeParam === 'signup' ||
        typeParam === 'email'
      ) {
        if ((code || accessToken) && !establishedSession) {
          showAlert('Link expirado', 'O link de ativação é inválido ou já foi utilizado.');
          setCurrentScreen('login');
          return;
        }
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        activeUidRef.current = null;
        showAlert(
          'E-mail ativado!',
          'Sua conta foi confirmada com sucesso. Faça login para continuar.'
        );
        setCurrentScreen('login');
      } else if (establishedSession) {
        await routeAfterAuth();
      }
    } catch (err) {
      console.warn('App: Erro ao processar deep link:', err);
    }
  }, [routeAfterAuth]);

  // Escuta links profundos do app (OAuth, confirmação de e-mail e recuperação de senha)
  useEffect(() => {
    Linking.getInitialURL()
      .then((initialUrl) => {
        if (initialUrl) handleDeepLink(initialUrl);
      })
      .catch((err) => console.warn('App: Erro em getInitialURL:', err));
    const sub = Linking.addEventListener('url', (event) => handleDeepLink(event.url));
    return () => sub.remove();
  }, [handleDeepLink]);

  // Escuta evento de recuperação de senha disparado nativamente pelo Supabase Auth
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentScreen('reset_password');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  /** Abre a tarefa na tela adequada conforme o estado dela. */
  const openTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setSelectedTaskId(taskId);
    if (task.status === 'Aguardando validação') {
      if (task.assignee === 'Você' || (!!user?.id && task.assigneeId === user.id)) {
        Alert.alert('Aguardando validação', 'Sua tarefa foi enviada. Outro morador precisa aprová-la.');
        return;
      }
      const reqId = ++openTaskRequestRef.current;
      setTaskValidation(null);
      setCurrentScreen('task_validation');
      try {
        const validationData = await tasksService.getPendingValidation(taskId);
        if (openTaskRequestRef.current === reqId) {
          setTaskValidation(validationData);
        }
      } catch (err) {
        console.warn('App: Erro ao carregar validação da tarefa:', err);
      }
    } else if (task.status === 'Concluída') {
      Alert.alert('Tarefa concluída', 'Esta tarefa já foi validada e concluída.');
    } else {
      setCurrentScreen('task_details');
    }
  };

  // Transição após Splash respeita o carregamento da sessão no AuthContext
  useEffect(() => {
    if (currentScreen !== 'splash' || !splashDone || loading) return;
    if (user) {
      routeAfterAuth();
    } else {
      setCurrentScreen('welcome');
    }
  }, [currentScreen, splashDone, loading, user, routeAfterAuth]);

  useEffect(() => {
    if (
      !loading &&
      !user &&
      currentScreen !== 'splash' &&
      currentScreen !== 'welcome' &&
      currentScreen !== 'login' &&
      currentScreen !== 'register' &&
      currentScreen !== 'forgot_password' &&
      currentScreen !== 'reset_password'
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
      setPendingPayments([]);
      setSelectedPaymentId(null);
      setSelectedTaskId(null);
      setTaskValidation(null);
      setSettleUpData({ netBalance: 'R$ 0,00', isPositive: true, debts: [] });
      setReportData({ totalAmount: '0,00', averagePerResident: '0,00', history: [] });
      return;
    }
    loadMyHouse().catch((err) => console.warn('App: Erro ao carregar moradia do usuário:', err));
  }, [user, loadMyHouse]);

  useEffect(() => {
    if (!myHouse?.moradia_id || myHouse.status !== 'aprovado') {
      setMembers([]);
      setHouseRules([]);
      setRankingList([]);
      setStoreItems([]);
      return;
    }
    const houseId = myHouse.moradia_id;
    loadMembers(houseId, true);
    loadRules(houseId);
    loadStore(houseId);
    loadNotifications();
    loadExpenses(houseId);
    loadFinanceOverview(houseId);
  }, [
    myHouse?.moradia_id,
    myHouse?.status,
    loadMembers,
    loadRules,
    loadStore,
    loadNotifications,
    loadExpenses,
    loadFinanceOverview,
  ]);

  useEffect(() => {
    let cancelled = false;
    async function loadTasks() {
      try {
        const fetched = await tasksService.fetchTasks(
          myHouse?.status === 'aprovado' ? myHouse.moradia_id : undefined,
          user?.id
        );
        if (!cancelled) {
          setTasks(fetched || []);
        }
        if (!cancelled && myHouse?.moradia_id && myHouse.status === 'aprovado') {
          loadRanking(myHouse.moradia_id);
        }
      } catch (err) {
        console.warn('App: Erro ao carregar tarefas:', err);
      }
    }
    loadTasks();
    return () => {
      cancelled = true;
    };
  }, [user?.id, myHouse?.moradia_id, myHouse?.status, loadRanking]);

  useEffect(() => {
    if (!myHouse?.moradia_id || myHouse.status !== 'aprovado') return;
    const houseId = myHouse.moradia_id;
    if (currentScreen === 'ranking') {
      loadMembers(houseId, true);
    } else if (currentScreen === 'tasks_list' || currentScreen === 'home') {
      loadMembers(houseId, false);
      reloadTasks();
      loadRanking(houseId);
      if (currentScreen === 'home') loadFinanceOverview(houseId);
    } else if (currentScreen === 'expenses_list') {
      loadExpenses(houseId);
    } else if (currentScreen === 'store') {
      loadMembers(houseId, false);
      loadStore(houseId);
    } else if (currentScreen === 'notifications') {
      loadNotifications();
    }
  }, [
    currentScreen,
    myHouse?.moradia_id,
    myHouse?.status,
    user?.id,
    loadMembers,
    reloadTasks,
    loadRanking,
    loadFinanceOverview,
    loadExpenses,
    loadStore,
    loadNotifications,
  ]);

  const approvedMembers = useMemo(() => members.filter((m) => m.status === 'aprovado'), [members]);
  const pendingMembers = useMemo(() => members.filter((m) => m.status === 'pendente'), [members]);

  const newExpenseMembersList = useMemo(
    () =>
      approvedMembers.map((m) => ({
        id: m.usuario_id,
        name: m.usuario_id === user?.id ? `${m.nome || 'Você'} (Você)` : (m.nome || 'Morador'),
      })),
    [approvedMembers, user?.id]
  );

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
              (t) =>
                (t.assigneeId === m.usuario_id || (!!m.nome && t.assignee === m.nome)) &&
                t.status === 'Concluída'
            ).length,
            coins: m.moedas || 0,
            xp: m.xp || 0,
            level: Math.max(m.nivel || 1, calculateLevelAndTitle(m.xp || 0).level),
            pendingTasksCount: tasks.filter(
              (t) =>
                (t.assigneeId === m.usuario_id || (!!m.nome && t.assignee === m.nome)) &&
                t.status === 'Pendente'
            ).length,
          }));

  const currentMember = approvedMembers.find((m) => m.usuario_id === user?.id);
  const houseLeader = effectiveRankingList[0];

  const newTaskMembersList = useMemo(
    () =>
      approvedMembers.map((m) => ({
        id: m.usuario_id,
        name:
          m.usuario_id === user?.id
            ? `${m.nome || 'Você'} (Você)`
            : m.nome || 'Morador',
        initials: getInitials(m.nome),
      })),
    [approvedMembers, user?.id]
  );

  const leaveCandidates = useMemo(
    () =>
      approvedMembers
        .filter((m) => m.usuario_id !== user?.id)
        .map((m) => ({
          id: m.id,
          name: m.nome || 'Morador',
          initials: getInitials(m.nome),
          levelInfo: `Nível ${m.nivel} • ${m.xp} XP`,
          avatarBg: '#2D2D2A',
          avatarTextColor: '#FFFFFF',
        })),
    [approvedMembers, user?.id]
  );

  const memberLevelDetails = calculateLevelAndTitle(currentMember?.xp || 0);
  const numericNetBalance = (settleUpData?.debts || []).reduce(
    (sum, d) => sum + (d.rawAmount || 0),
    0
  );

  const unreadNotificationsCount = notificationsList.filter((n) => !n.isRead).length;

  const profileUserData = {
    name: profile?.nome_completo || 'Morador',
    role: myHouse?.papel === 'admin' ? 'Admin' : 'Morador',
    email: user?.email || profile?.email || '',
    republicName: myHouse?.nome || 'Minha Moradia',
    level: currentMember?.nivel || memberLevelDetails.level,
    levelTitle: currentMember?.titulo_nivel || memberLevelDetails.title,
    xp: currentMember?.xp || 0,
    nextLevelXp: memberLevelDetails.nextLevelXp,
    balance: numericNetBalance,
    coins: currentMember?.moedas || 0,
    completedTasks: tasks.filter(
      (t) =>
        t.status === 'Concluída' &&
        (t.assignee === 'Você' ||
          (!!user?.id && t.assigneeId === user.id) ||
          (!!profile?.nome_completo && t.assignee === profile.nome_completo))
    ).length,
    onTimePercentage: 100,
    unreadNotificationsCount,
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const isMainTabScreen =
    currentScreen === 'home' ||
    currentScreen === 'expenses_list' ||
    currentScreen === 'tasks_list' ||
    currentScreen === 'ranking' ||
    currentScreen === 'profile';

  const currentScreenRef = useRef(currentScreen);
  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  // Suporte nativo ao botão Voltar do Android para navegar para a tela anterior sem fechar o app
  useEffect(() => {
    const onHardwareBack = () => {
      const screen = currentScreenRef.current;
      switch (screen) {
        case 'login':
          setCurrentScreen('welcome');
          return true;
        case 'register':
          if (user && !user.user_metadata?.cadastro_concluido && user.user_metadata?.google_signup_incomplete) {
            signOut().catch(() => {});
          }
          setCurrentScreen('welcome');
          return true;
        case 'forgot_password':
          setCurrentScreen('login');
          return true;
        case 'reset_password':
          signOut().catch(() => {});
          setCurrentScreen('forgot_password');
          return true;
        case 'create_house':
        case 'join_house':
          setCurrentScreen('house_selection');
          return true;
        case 'setup_rules':
          setCurrentScreen('create_house');
          return true;
        case 'pending_request':
          setCurrentScreen('house_selection');
          return true;
        case 'invite_qr':
          setCurrentScreen(inviteSourceRef.current === 'members' ? 'manage_members' : 'home');
          return true;
        case 'manage_members':
          setCurrentScreen(membersSourceRef.current);
          return true;
        case 'notifications':
          setCurrentScreen(notificationsSourceRef.current);
          return true;
        case 'settle_up':
        case 'report':
          setCurrentScreen('home');
          return true;
        case 'store':
          if (storeSourceRef.current === 'ranking' && myHouse?.moradia_id) {
            loadRanking(myHouse.moradia_id);
          }
          setCurrentScreen(storeSourceRef.current);
          return true;
        case 'propose_reward':
          setCurrentScreen('store');
          return true;
        case 'new_expense':
          setCurrentScreen(expenseReturnRef.current);
          return true;
        case 'expense_details':
          setCurrentScreen('expenses_list');
          return true;
        case 'new_task':
        case 'task_details':
        case 'task_validation':
          setCurrentScreen(taskReturnRef.current);
          return true;
        case 'payment_validation':
          setCurrentScreen('settle_up');
          return true;
        case 'edit_profile':
        case 'house_rules':
        case 'leave_house':
          setCurrentScreen('profile');
          return true;
        case 'edit_house_rules':
          setCurrentScreen('house_rules');
          return true;
        case 'expenses_list':
        case 'tasks_list':
        case 'ranking':
        case 'profile':
          setCurrentScreen('home');
          return true;
        default:
          return false;
      }
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => subscription.remove();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (currentScreenRef.current === 'expenses_list' && gestureState.y0 < 240) {
          return false;
        }
        return (
          Math.abs(gestureState.dx) > 45 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        const active = currentScreenRef.current;
        if (gestureState.dx < -50) {
          if (active === 'home') {
            setCurrentScreen('expenses_list');
          } else if (active === 'expenses_list') {
            setCurrentScreen('tasks_list');
          } else if (active === 'tasks_list') {
            setCurrentScreen('ranking');
          } else if (active === 'ranking') {
            setCurrentScreen('profile');
          }
        } else if (gestureState.dx > 50) {
          if (active === 'profile') {
            setCurrentScreen('ranking');
          } else if (active === 'ranking') {
            setCurrentScreen('tasks_list');
          } else if (active === 'tasks_list') {
            setCurrentScreen('expenses_list');
          } else if (active === 'expenses_list') {
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
        loadMembers(myHouse.moradia_id, true);
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
          onFinish={() => setSplashDone(true)}
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
          onGooglePress={async () => {
            try {
              if (Platform.OS !== 'web') {
                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
                const response = await GoogleSignin.signIn();
                const idToken = response?.data?.idToken;
                if (!idToken) {
                  Alert.alert('Login com Google', 'Não foi possível obter o token de autenticação do Google.');
                  return;
                }
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: 'google',
                  token: idToken,
                });
                if (error) {
                  Alert.alert('Login com Google', error.message || 'Não foi possível autenticar com o Google.');
                  return;
                }
                const createdMs = data?.user?.created_at ? new Date(data.user.created_at).getTime() : 0;
                const lastSignInMs = data?.user?.last_sign_in_at ? new Date(data.user.last_sign_in_at).getTime() : createdMs;
                const isNewlyCreated = createdMs > 0 && Math.abs(lastSignInMs - createdMs) < 10000;
                const isIncomplete =
                  (isNewlyCreated && !data?.user?.user_metadata?.cadastro_concluido) ||
                  data?.user?.user_metadata?.google_signup_incomplete === true;
                if (isIncomplete) {
                  await supabase.auth.signOut().catch(() => {});
                  await GoogleSignin.signOut().catch(() => {});
                  showAlert(
                    'Conta não encontrada',
                    'Este e-mail Google ainda não possui cadastro no SplitHouse. Volte para a tela de Criar Conta para finalizar seu cadastro.'
                  );
                  return;
                }
                activeUidRef.current = data?.user?.id ?? null;
                await routeAfterAuth();
                return;
              }

              const redirectTo =
                typeof window !== 'undefined' ? window.location.origin : 'splithouse://auth-callback';
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo },
              });
              if (error) {
                showAlert('Login com Google', error.message || 'Não foi possível autenticar com o Google.');
              }
            } catch (err: any) {
              if (err?.code === statusCodes.SIGN_IN_CANCELLED || err?.code === statusCodes.IN_PROGRESS) {
                return;
              }
              showAlert('Login com Google', err?.message || 'Configuração OAuth do Google indisponível no momento.');
            }
          }}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onBackPress={async () => {
            if (user && !user.user_metadata?.cadastro_concluido && user.user_metadata?.google_signup_incomplete) {
              await signOut().catch(() => {});
            }
            setCurrentScreen('welcome');
          }}
          onRegisterSubmit={() => routeAfterAuth()}
          onLoginPress={async () => {
            if (user && !user.user_metadata?.cadastro_concluido && user.user_metadata?.google_signup_incomplete) {
              await signOut().catch(() => {});
            }
            setCurrentScreen('login');
          }}
          onGooglePress={async () => {
            try {
              if (Platform.OS === 'web') {
                showAlert('Cadastro com Google', 'O cadastro rápido com Google está disponível no aplicativo Android.');
                return null;
              }
              await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
              const response = await GoogleSignin.signIn();
              const idToken = response?.data?.idToken;
              if (!idToken) {
                showAlert('Cadastro com Google', 'Não foi possível obter os dados da sua conta Google.');
                return null;
              }
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
              });
              if (error || !data?.user) {
                showAlert('Cadastro com Google', error?.message || 'Não foi possível conectar com o Google.');
                return null;
              }
              const createdMs = data.user.created_at ? new Date(data.user.created_at).getTime() : 0;
              const lastSignInMs = data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at).getTime() : createdMs;
              const isNewlyCreated = createdMs > 0 && Math.abs(lastSignInMs - createdMs) < 10000;
              if (data.user.user_metadata?.cadastro_concluido || (!isNewlyCreated && !data.user.user_metadata?.google_signup_incomplete)) {
                activeUidRef.current = data.user.id;
                showAlert('Conta já cadastrada', 'Este e-mail Google já possui uma conta ativa no SplitHouse. Redirecionando para sua conta...');
                await routeAfterAuth();
                return null;
              }
              await supabase.auth.updateUser({
                data: { google_signup_incomplete: true },
              }).catch(() => {});
              return {
                name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
                email: data.user.email || '',
              };
            } catch (err: any) {
              if (err?.code === statusCodes.SIGN_IN_CANCELLED || err?.code === statusCodes.IN_PROGRESS) {
                return null;
              }
              showAlert('Cadastro com Google', err?.message || 'Não foi possível conectar com o Google.');
              return null;
            }
          }}
          onTermsPress={() =>
            Alert.alert(
              'Termos de Uso',
              'Ao utilizar o SplitHouse, você concorda em registrar despesas, tarefas e comprovantes de forma verídica com os moradores da sua república.'
            )
          }
          onPrivacyPress={() =>
            Alert.alert(
              'Política de Privacidade',
              'Seus dados cadastrais, saldo e fotos comprobatórias são compartilhados apenas com os membros aprovados da sua moradia.'
            )
          }
        />
      )}

      {currentScreen === 'forgot_password' && (
        <ForgotPasswordScreen
          onBackPress={() => setCurrentScreen('login')}
          onSubmit={(email) => setRecoveryEmail(email)}
          onEnterCodePress={(email) => {
            setRecoveryEmail(email);
            setCurrentScreen('reset_password');
          }}
          onLoginPress={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'reset_password' && (
        <ResetPasswordScreen
          initialEmail={recoveryEmail}
          onBackPress={async () => {
            await signOut().catch(() => {});
            setCurrentScreen('forgot_password');
          }}
          onSuccess={async () => {
            await signOut().catch(() => {});
            setCurrentScreen('login');
          }}
          onLoginPress={async () => {
            await signOut().catch(() => {});
            setCurrentScreen('login');
          }}
        />
      )}

      {currentScreen === 'house_selection' && (
        <HouseSelectionScreen
          userName={profile?.nome_completo || user?.email?.split('@')[0] || 'Morador'}
          userInitials={
            profile?.nome_completo
              ? profile.nome_completo
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
              : 'SH'
          }
          onCreateHousePress={() => setCurrentScreen('create_house')}
          onJoinHousePress={() => setCurrentScreen('join_house')}
          onLogoutPress={async () => {
            try {
              await signOut();
            } finally {
              setHouseDraft(null);
              setRecoveryEmail('');
              setInviteSource('setup');
              setCurrentScreen('welcome');
            }
          }}
        />
      )}

      {currentScreen === 'create_house' && (
        <CreateHouseScreen
          initialData={houseDraft}
          onBackPress={() => setCurrentScreen('house_selection')}
          onSubmit={(data) => {
            if (!data.name.trim() || !data.address.trim()) {
              showAlert('Atenção', 'Informe o nome e o endereço da moradia.');
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
            try {
              const payload: RegraInput[] = rules
                .filter((r) => r.title.trim())
                .map((r) => ({ titulo: r.title.trim(), descricao: r.value.trim() }));
              await houseService.createHouse(houseDraft, payload);
              await loadMyHouse();
              setHouseDraft(null);
              setInviteSource('setup');
              setCurrentScreen('invite_qr');
            } catch (err) {
              showAlert(
                'Erro ao criar moradia',
                err instanceof Error ? err.message : 'Não foi possível criar a moradia. Tente novamente.'
              );
            }
          }}
        />
      )}

      {currentScreen === 'invite_qr' && (
        <InviteQrScreen
          houseName={myHouse?.nome}
          houseCode={myHouse?.codigo_convite}
          onBackPress={() => setCurrentScreen(inviteSource === 'members' ? 'manage_members' : 'home')}
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
          onBackPress={() => setCurrentScreen('house_selection')}
          onRefreshPress={async () => {
            try {
              const house = await loadMyHouse();
              if (house?.status === 'aprovado') {
                setCurrentScreen('home');
              } else if (!house) {
                Alert.alert('Solicitação recusada', 'O administrador não aprovou sua entrada.');
                setCurrentScreen('house_selection');
              } else {
                Alert.alert('Ainda pendente', 'Sua solicitação ainda aguarda aprovação do administrador.');
              }
            } catch (err) {
              Alert.alert(
                'Erro ao verificar',
                err instanceof Error ? err.message : 'Não foi possível consultar o status agora.'
              );
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
          onBackPress={() => setCurrentScreen(membersSourceRef.current)}
          onViewQrPress={() => {
            setInviteSource('members');
            setCurrentScreen('invite_qr');
          }}
          onApprove={async (memberId) => {
            try {
              await houseService.respondRequest(memberId, true);
              if (myHouse) {
                await loadMembers(myHouse.moradia_id, true);
              }
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
          onReject={async (memberId) => {
            try {
              await houseService.respondRequest(memberId, false);
              if (myHouse) {
                await loadMembers(myHouse.moradia_id, true);
              }
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
          onRemoveMember={async (memberId) => {
            try {
              await houseService.removeMember(memberId);
              if (myHouse) await loadMembers(myHouse.moradia_id, true);
              Alert.alert('Sucesso', 'Morador removido da moradia.');
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
          onPromoteAdmin={async (memberId) => {
            try {
              await houseService.promoteToAdmin(memberId);
              if (myHouse) await loadMembers(myHouse.moradia_id, false);
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
              debtorText={
                settleUpData.debts[0]
                  ? `${settleUpData.debts[0].debtorName} (${settleUpData.debts[0].debtorStatus.toLowerCase()})`
                  : undefined
              }
              debtorAmount={settleUpData.debts[0]?.debtAmount}
              leaderName={houseLeader?.name || (profile?.nome_completo || 'Você')}
              leaderXp={houseLeader?.xp || currentMember?.xp || 0}
              userLevel={profileUserData.level}
              pendingMembersCount={isAdmin ? pendingMembers.length : 0}
              unreadNotificationsCount={unreadNotificationsCount}
              onExpensesTabPress={() => setCurrentScreen('expenses_list')}
              onTasksTabPress={() => setCurrentScreen('tasks_list')}
              onNewExpensePress={() => {
                expenseReturnRef.current = 'home';
                setCurrentScreen('new_expense');
              }}
              onNewTaskPress={() => {
                taskReturnRef.current = 'home';
                setCurrentScreen('new_task');
              }}
              onTaskPress={(taskId) => {
                taskReturnRef.current = 'home';
                openTask(taskId);
              }}
              onNotificationsPress={() => {
                notificationsSourceRef.current = 'home';
                setCurrentScreen('notifications');
              }}
              onRankingPress={() => setCurrentScreen('ranking')}
              onSettleUpPress={() => { if (myHouse?.moradia_id) loadFinanceOverview(myHouse.moradia_id); setCurrentScreen('settle_up'); }}
              onReportPress={() => { if (myHouse?.moradia_id) loadFinanceOverview(myHouse.moradia_id); setCurrentScreen('report'); }}
              onManageMembersPress={() => {
                membersSourceRef.current = 'home';
                setCurrentScreen('manage_members');
              }}
            />
          )}

          {currentScreen === 'expenses_list' && (
            <ExpensesListScreen
              houseName={myHouse?.nome || 'Sua moradia'}
              expenses={expensesList}
              onAddPress={() => {
                expenseReturnRef.current = 'expenses_list';
                setCurrentScreen('new_expense');
              }}
              onExpenseDetailsPress={async (expense) => {
                if (!expense?.id) return;
                const reqId = ++openExpenseRequestRef.current;
                setSelectedExpenseDetails(null);
                setCurrentScreen('expense_details');
                try {
                  const details = await financeService.getExpenseDetails(expense.id);
                  if (openExpenseRequestRef.current === reqId) {
                    setSelectedExpenseDetails(details);
                  }
                } catch (err) {
                  Alert.alert(
                    'Erro ao abrir despesa',
                    err instanceof Error ? err.message : 'Não foi possível carregar os detalhes.'
                  );
                }
              }}
            />
          )}

          {currentScreen === 'tasks_list' && (
            <TasksListScreen
              houseName={myHouse?.nome || 'Sua moradia'}
              tasks={tasks}
              onNewTaskPress={() => {
                taskReturnRef.current = 'tasks_list';
                setCurrentScreen('new_task');
              }}
              onValidatePress={(taskId) => {
                taskReturnRef.current = 'tasks_list';
                if (taskId) openTask(taskId);
              }}
              onTaskPress={(taskId) => {
                taskReturnRef.current = 'tasks_list';
                openTask(taskId);
              }}
            />
          )}

          {currentScreen === 'ranking' && (
            <RankingScreen
              houseName={myHouse?.nome || 'Sua moradia'}
              cycleName={myHouse?.nome_ciclo_atual || 'Ciclo Atual'}
              rankingList={effectiveRankingList}
              onStorePress={() => {
                storeSourceRef.current = 'ranking';
                if (myHouse?.moradia_id) loadStore(myHouse.moradia_id);
                setCurrentScreen('store');
              }}
              onNudgePress={async (residentName, residentId) => {
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
                  throw new Error('Morador não encontrado.');
                }
                try {
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
                  throw err;
                }
              }}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              user={profileUserData}
              onEditProfilePress={() => setCurrentScreen('edit_profile')}
              onNotificationsPress={() => {
                notificationsSourceRef.current = 'profile';
                setCurrentScreen('notifications');
              }}
              onManageMembersPress={() => {
                membersSourceRef.current = 'profile';
                setCurrentScreen('manage_members');
              }}
              onHouseRulesPress={() => {
                if (myHouse?.status === 'aprovado') loadRules(myHouse.moradia_id);
                setCurrentScreen('house_rules');
              }}
              onLeaveHousePress={() => setCurrentScreen('leave_house')}
              onStorePress={() => {
                storeSourceRef.current = 'profile';
                if (myHouse?.moradia_id) loadStore(myHouse.moradia_id);
                setCurrentScreen('store');
              }}
              onTasksPress={() => setCurrentScreen('tasks_list')}
              onLogoutPress={async () => {
                try {
                  await signOut();
                } finally {
                  setHouseDraft(null);
                  setRecoveryEmail('');
                  setInviteSource('setup');
                  setCurrentScreen('welcome');
                }
              }}
            />
          )}
        </View>
      )}

      {currentScreen === 'new_task' && (
        <NewTaskScreen
          membersList={newTaskMembersList}
          onBackPress={() => setCurrentScreen(taskReturnRef.current)}
          onSubmitPress={async (taskData) => {
            try {
              const created = await tasksService.createTask(taskData, user?.id, myHouse?.moradia_id);
              setTasks((prev) => [created, ...prev]);
              setCurrentScreen(taskReturnRef.current);
            } catch (err: any) {
              showAlert('Erro ao cadastrar tarefa', err?.message || 'Falha ao salvar no banco.');
              throw err;
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
          onBackPress={() => setCurrentScreen(taskReturnRef.current)}
          onOptionsPress={() => {
            if (!selectedTask) return;
            showAlert(
              selectedTask.title,
              `Tipo: ${selectedTask.type}\nCômodo: ${selectedTask.location}\nPrazo: ${selectedTask.deadline}\nRecompensa: +${selectedTask.xp} XP / ${selectedTask.points ?? 0} moedas`
            );
          }}
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
                extraMeta: JSON.stringify({
                  taskId: selectedTaskId,
                  display: `+${selectedTask?.xp ?? 0} XP em jogo`,
                }),
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
                executedAt: (() => {
                  if (!taskValidation?.sentAt) return '';
                  const d = new Date(taskValidation.sentAt);
                  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR');
                })(),
                photoUrl: taskValidation?.photoUrl,
                photoTimestamp: (() => {
                  if (!taskValidation?.sentAt) return '';
                  const d = new Date(taskValidation.sentAt);
                  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR');
                })(),
                xp: selectedTask.xp,
                points: selectedTask.points,
              }
              : undefined
          }
          onBackPress={() => setCurrentScreen(taskReturnRef.current)}
          onApprovePress={() => handleTaskValidation(true)}
          onRejectPress={(justification) => handleTaskValidation(false, justification)}
        />
      )}

      {currentScreen === 'new_expense' && (
        <NewExpenseScreen
          membersList={newExpenseMembersList}
          onBackPress={() => setCurrentScreen(expenseReturnRef.current)}
          onSubmitPress={async (data) => {
            if (!user || !myHouse) {
              Alert.alert('Atenção', 'Você precisa estar em uma moradia para cadastrar despesas.');
              return;
            }
            try {
              let comprovanteUrl: string | null = null;
              if (data.receiptUri) comprovanteUrl = await uploadImage(data.receiptUri, 'despesas');

              let splits = data.splits;
              if (!splits || splits.length === 0) {
                const count = approvedMembers.length || 1;
                const equalShare = Math.floor((data.amount / count) * 100) / 100;
                const remainder = parseFloat((data.amount - equalShare * count).toFixed(2));
                splits = approvedMembers.map((m, index) => ({
                  userId: m.usuario_id,
                  amount: index === 0 ? parseFloat((equalShare + remainder).toFixed(2)) : equalShare,
                }));
              }

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
            if (selectedExpenseDetails?.receiptUrl) {
              Linking.openURL(selectedExpenseDetails.receiptUrl).catch(() => {
                Alert.alert('Comprovante indisponível', 'Não foi possível abrir o link do comprovante.');
              });
            }
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
          onBackPress={() => setCurrentScreen(membersSourceRef.current)}
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
          onPayDebt={async (debt) => {
            if (!user || !myHouse) return;
            const creditorId = debt.debtorId || debt.id;
            const rawVal = Math.abs(debt.rawAmount || 0);
            if (!creditorId || rawVal <= 0) return;

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
                credorId: creditorId,
                valor: rawVal,
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
                [creditorId]
              );
              await loadFinanceOverview(myHouse.moradia_id);
              Alert.alert('Pagamento informado', `${debt.debtorName} precisa confirmar o recebimento.`);
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
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
          onBackPress={() => setCurrentScreen(membersSourceRef.current)}
        />
      )}
      {currentScreen === 'store' && (
        <StoreScreen
          houseName={myHouse?.nome}
          initialCoins={currentMember?.moedas || 0}
          items={storeItems}
          onBackPress={() => {
            if (storeSourceRef.current === 'ranking' && myHouse?.moradia_id) loadRanking(myHouse.moradia_id);
            setCurrentScreen(storeSourceRef.current);
          }}
          onProposePress={() => setCurrentScreen('propose_reward')}
          onRedeemPress={async (item) => {
            if (!user || !myHouse) {
              throw new Error('Sessão ou moradia indisponível no momento.');
            }
            await storeService.redeemReward({
              rewardId: item.id,
              userId: user.id,
              moradiaId: myHouse.moradia_id,
              cost: item.cost,
              rewardTitle: item.title,
            });
            if (myHouse.moradia_id) {
              await loadMembers(myHouse.moradia_id, true);
              await loadStore(myHouse.moradia_id);
            }
          }}
          onProposeSubmit={async (newItem) => {
            if (!user || !myHouse) {
              throw new Error('Sessão ou moradia indisponível no momento.');
            }
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
            if (!user || !myHouse) {
              throw new Error('Sessão ou moradia indisponível no momento.');
            }
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
            if (myHouse?.status === 'aprovado') await loadMembers(myHouse.moradia_id, false);
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
            if (!latest) return undefined;
            const parsed = new Date(latest);
            return Number.isNaN(parsed.getTime()) ? undefined : parsed.toLocaleDateString('pt-BR');
          })()}
          rules={houseRules.map((r, i): HouseRule => {
            const safeIcon =
              r.nome_icone && r.nome_icone in Feather.glyphMap
                ? (r.nome_icone as HouseRule['iconName'])
                : 'file-text';
            return {
              id: r.id,
              number: r.numero_ordem,
              title: r.titulo,
              highlight: r.destaque || '',
              description: r.descricao,
              iconName: safeIcon,
              ...RULE_COLORS[i % RULE_COLORS.length],
            };
          })}
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
          isAdmin={isAdmin}
          candidates={leaveCandidates}
          balance={numericNetBalance}
          onBackPress={() => setCurrentScreen('profile')}
          onCancelPress={() => setCurrentScreen('profile')}
          onConfirmSuccess={async (selectedCandidateId, password) => {
            try {
              if (numericNetBalance < -0.01) {
                Alert.alert('Saldo pendente', 'Quite suas dívidas em aberto antes de sair da moradia.');
                return;
              }
              if (!password || !password.trim()) {
                Alert.alert('Senha obrigatória', 'Informe sua senha para confirmar a saída.');
                return;
              }
              if (user?.email) {
                const { error: passError } = await supabase.auth.signInWithPassword({
                  email: user.email,
                  password,
                });
                if (passError) {
                  Alert.alert('Senha incorreta', 'A senha informada não confere com sua conta.');
                  return;
                }
              }
              if (myHouse) {
                await houseService.leaveHouse(myHouse.moradia_id, selectedCandidateId);
              }
              setMyHouse(null);
              setMembers([]);
              setHouseRules([]);
              setTasks([]);
              setRankingList([]);
              setStoreItems([]);
              setNotificationsList([]);
              setExpensesList([]);
              setSelectedExpenseDetails(null);
              setPendingPayments([]);
              setSelectedPaymentId(null);
              setSelectedTaskId(null);
              setTaskValidation(null);
              setSettleUpData({ netBalance: 'R$ 0,00', isPositive: true, debts: [] });
              setReportData({ totalAmount: '0,00', averagePerResident: '0,00', history: [] });
              setCurrentScreen('house_selection');
            } catch (err) {
              showAlert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
            }
          }}
        />
      )}

      {currentScreen === 'notifications' && (
        <NotificationsScreen
          onBackPress={() => setCurrentScreen(notificationsSourceRef.current)}
          notifications={notificationsList}
          onClearReadPress={async () => {
            if (user) {
              await notificationsService.clearReadNotifications(user.id);
              await loadNotifications();
            }
          }}
          onNotificationAction={async (notification) => {
            try {
              await notificationsService.markAsRead(notification.id);
              loadNotifications();

              if (notification.actionText === 'Ver na loja') {
                storeSourceRef.current = 'notifications';
                if (myHouse?.moradia_id) await loadStore(myHouse.moradia_id);
                setCurrentScreen('store');
                return;
              }

              if (notification.categoryFilter === 'Validações') {
                await reloadTasks();
                let targetTaskId: string | undefined;
                if (notification.extraMeta) {
                  try {
                    if (notification.extraMeta.startsWith('{')) {
                      const parsed = JSON.parse(notification.extraMeta);
                      targetTaskId = parsed.taskId;
                    }
                  } catch {
                    // ignorar erro de parsing se extraMeta for texto plano
                  }
                }
                const allTasks = await tasksService.fetchTasks(myHouse?.moradia_id, user?.id);
                const matchedTarget = targetTaskId ? allTasks.find((t) => t.id === targetTaskId) : undefined;
                const isOwnTask = (t: TaskItem) =>
                  t.assignee === 'Você' || (!!user?.id && t.assigneeId === user.id);

                if (matchedTarget) {
                  taskReturnRef.current = 'notifications';
                  if (matchedTarget.status === 'Aguardando validação' && !isOwnTask(matchedTarget)) {
                    const reqId = ++openTaskRequestRef.current;
                    setSelectedTaskId(matchedTarget.id);
                    setTaskValidation(null);
                    setCurrentScreen('task_validation');
                    const valData = await tasksService.getPendingValidation(matchedTarget.id);
                    if (openTaskRequestRef.current === reqId) {
                      setTaskValidation(valData);
                    }
                  } else {
                    openTask(matchedTarget.id);
                  }
                  return;
                }

                const pendingOther = allTasks.find(
                  (t) => t.status === 'Aguardando validação' && !isOwnTask(t)
                );

                if (pendingOther) {
                  taskReturnRef.current = 'notifications';
                  const reqId = ++openTaskRequestRef.current;
                  setSelectedTaskId(pendingOther.id);
                  setTaskValidation(null);
                  setCurrentScreen('task_validation');
                  const valData = await tasksService.getPendingValidation(pendingOther.id);
                  if (openTaskRequestRef.current === reqId) {
                    setTaskValidation(valData);
                  }
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
            } catch (err) {
              showAlert('Erro', err instanceof Error ? err.message : 'Não foi possível abrir a notificação.');
            }
          }}
        />
      )}

      {isMainTabScreen && (
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom + 8, Platform.OS === 'ios' ? 32 : 20) }]}>
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
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
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
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
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