import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  PanResponder,
  StyleSheet,
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
import { TasksListScreen, TaskItem, mockTasks } from './src/screens/tasks/TasksListScreen';
import { NewTaskScreen } from './src/screens/tasks/NewTaskScreen';
import { TaskDetailsScreen } from './src/screens/tasks/TaskDetailsScreen';
import { ValidateTaskScreen } from './src/screens/tasks/ValidateTaskScreen';
import { RankingScreen } from './src/screens/ranking/RankingScreen';
import { StoreScreen } from './src/screens/store/StoreScreen';
import { NotificationsScreen } from './src/screens/notifications/NotificationsScreen';

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
  | 'store'
  | 'notifications'
  | 'new_task'
  | 'task_details'
  | 'task_validation'
  | 'new_expense'
  | 'expense_details'
  | 'settle_up'
  | 'payment_validation'
  | 'report';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const isMainTabScreen =
    currentScreen === 'home' ||
    currentScreen === 'expenses_list' ||
    currentScreen === 'tasks_list' ||
    currentScreen === 'ranking';

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
          }
        } else if (gestureState.dx > 50) {
          if (currentScreen === 'ranking') {
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

  return (
    <>
      <StatusBar style={currentScreen === 'splash' ? 'light' : 'dark'} />

      {currentScreen === 'splash' && (
        <SplashScreen onFinish={() => setCurrentScreen('welcome')} />
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
          onLoginSubmit={(email, password) => setCurrentScreen('house_selection')}
          onForgotPasswordPress={() => setCurrentScreen('forgot_password')}
          onRegisterPress={() => setCurrentScreen('register')}
          onGooglePress={() => setCurrentScreen('house_selection')}
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
          userName="Norman Osborn"
          userInitials="NO"
          onCreateHousePress={() => setCurrentScreen('create_house')}
          onJoinHousePress={() => setCurrentScreen('join_house')}
          onLogoutPress={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'create_house' && (
        <CreateHouseScreen
          onBackPress={() => setCurrentScreen('house_selection')}
          onSubmit={(data) => setCurrentScreen('setup_rules')}
        />
      )}

      {currentScreen === 'setup_rules' && (
        <SetupRulesScreen
          houseName="República do Sexteto Sinistro"
          onBackPress={() => setCurrentScreen('create_house')}
          onSubmit={(rules) => setCurrentScreen('invite_qr')}
        />
      )}

      {currentScreen === 'invite_qr' && (
        <InviteQrScreen
          houseName="República do Sexteto Sinistro"
          houseCode="SPLIT-8924"
          onBackPress={() => setCurrentScreen('setup_rules')}
          onContinuePress={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'join_house' && (
        <JoinHouseScreen
          onBackPress={() => setCurrentScreen('house_selection')}
          onSubmitCode={(code) => setCurrentScreen('pending_request')}
        />
      )}

      {currentScreen === 'pending_request' && (
        <PendingRequestScreen
          houseName="República do Sexteto Sinistro"
          onBackPress={() => setCurrentScreen('join_house')}
          onCancelPress={() => setCurrentScreen('house_selection')}
        />
      )}

      {currentScreen === 'manage_members' && (
        <ManageMembersScreen
          houseName="República do Sexteto Sinistro"
          onBackPress={() => setCurrentScreen('home')}
          onViewQrPress={() => setCurrentScreen('invite_qr')}
        />
      )}

      {isMainTabScreen && (
        <View style={styles.tabContentContainer} {...panResponder.panHandlers}>
          {currentScreen === 'home' && (
            <HomeScreen
              onExpensesTabPress={() => setCurrentScreen('expenses_list')}
              onTasksTabPress={() => setCurrentScreen('tasks_list')}
              onNewExpensePress={() => setCurrentScreen('new_expense')}
              onNewTaskPress={() => setCurrentScreen('new_task')}
              onTaskPress={(title) => {
                const found = tasks.find((t) => t.title === title) || tasks[0];
                if (found) {
                  setSelectedTaskId(found.id);
                  if (found.requiresValidation) {
                    setCurrentScreen('task_validation');
                  } else {
                    setCurrentScreen('task_details');
                  }
                }
              }}
              onNotificationsPress={() => setCurrentScreen('notifications')}
              onRankingPress={() => setCurrentScreen('ranking')}
              onSettleUpPress={() => setCurrentScreen('settle_up')}
              onReportPress={() => setCurrentScreen('report')}
              onManageMembersPress={() => setCurrentScreen('manage_members')}
            />
          )}

          {currentScreen === 'expenses_list' && (
            <ExpensesListScreen
              onAddPress={() => setCurrentScreen('new_expense')}
              onExpenseDetailsPress={() => setCurrentScreen('expense_details')}
            />
          )}

          {currentScreen === 'tasks_list' && (
            <TasksListScreen
              tasks={tasks}
              onNewTaskPress={() => setCurrentScreen('new_task')}
              onValidatePress={(taskId) => {
                const targetId = taskId || tasks.find((t) => t.requiresValidation)?.id;
                if (targetId) {
                  setSelectedTaskId(targetId);
                  setCurrentScreen('task_validation');
                }
              }}
              onTaskPress={(taskId) => {
                setSelectedTaskId(taskId);
                setCurrentScreen('task_details');
              }}
            />
          )}

          {currentScreen === 'ranking' && (
            <RankingScreen
              onStorePress={() => setCurrentScreen('store')}
            />
          )}
        </View>
      )}

      {currentScreen === 'new_task' && (
        <NewTaskScreen
          onBackPress={() => setCurrentScreen('tasks_list')}
          onSubmitPress={(taskData) => {
            const newTask: TaskItem = {
              id: String(Date.now()),
              title: taskData.title,
              type: taskData.type,
              location: taskData.location,
              deadline: taskData.deadline,
              xp: taskData.xp,
              points: taskData.points,
              assignee: taskData.assignee.includes('Norman') ? 'Você' : taskData.assignee,
              status: 'Pendente',
              icon:
                taskData.type === 'Emergencial'
                  ? 'alert-triangle'
                  : 'check-circle',
              iconBg:
                taskData.type === 'Rotativa'
                  ? 'rgba(94, 43, 151, 0.1)'
                  : taskData.type === 'Emergencial'
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(204, 146, 194, 0.25)',
              iconColor:
                taskData.type === 'Emergencial' ? '#EF4444' : '#5E2B97',
            };
            setTasks((prev) => [newTask, ...prev]);
            setCurrentScreen('tasks_list');
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
                      ? 'Norman Osborn (Você)'
                      : selectedTask.assignee,
                  xp: selectedTask.xp,
                  points: selectedTask.points,
                }
              : undefined
          }
          onBackPress={() => setCurrentScreen('tasks_list')}
          onSubmitValidation={() => {
            if (selectedTaskId) {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === selectedTaskId
                    ? {
                        ...t,
                        status: 'Aguardando validação',
                        requiresValidation: true,
                        executorInfo: `Executada por ${t.assignee} com foto`,
                      }
                    : t
                )
              );
            }
            setCurrentScreen('tasks_list');
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
                  executorName:
                    selectedTask.assignee === 'Você'
                      ? 'Norman Osborn'
                      : selectedTask.assignee,
                  executedAt: selectedTask.deadline,
                  xp: selectedTask.xp,
                  points: selectedTask.points,
                }
              : undefined
          }
          onBackPress={() => setCurrentScreen('tasks_list')}
          onApprovePress={() => {
            if (selectedTaskId) {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === selectedTaskId
                    ? {
                        ...t,
                        status: 'Concluída',
                        requiresValidation: false,
                      }
                    : t
                )
              );
            }
            setCurrentScreen('tasks_list');
          }}
          onRejectPress={() => {
            if (selectedTaskId) {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === selectedTaskId
                    ? {
                        ...t,
                        status: 'Pendente',
                        requiresValidation: false,
                      }
                    : t
                )
              );
            }
            setCurrentScreen('tasks_list');
          }}
        />
      )}
      
      {currentScreen === 'new_expense' && (
        <NewExpenseScreen
          onBackPress={() => setCurrentScreen('expenses_list')}
          onSubmitPress={() => setCurrentScreen('expenses_list')}
        />
      )}

      {currentScreen === 'expense_details' && (
        <ExpenseDetailsScreen
          onBackPress={() => setCurrentScreen('expenses_list')}
          onNudgePress={() => alert('Moradores notificados!')}
        />
      )}

      {currentScreen === 'settle_up' && (
        <SettleUpScreen
          onBackPress={() => setCurrentScreen('home')}
          onPayPress={() => setCurrentScreen('payment_validation')}
        />
      )}

      {currentScreen === 'payment_validation' && (
        <ConfirmPaymentScreen
          onBackPress={() => setCurrentScreen('settle_up')}
          onConfirmPress={() => setCurrentScreen('home')}
          onRejectPress={() => setCurrentScreen('settle_up')}
        />
      )}

      {currentScreen === 'report' && (
        <ReportScreen
          onBackPress={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'store' && (
        <StoreScreen
          onBackPress={() => setCurrentScreen('ranking')}
        />
      )}

      {currentScreen === 'notifications' && (
        <NotificationsScreen
          onBackPress={() => setCurrentScreen('home')}
          onNotificationAction={(notification) => {
            if (notification.categoryFilter === 'Validações') {
              const valTask = tasks.find((t) => t.requiresValidation) || tasks[0];
              if (valTask) {
                setSelectedTaskId(valTask.id);
                setCurrentScreen('task_validation');
              }
            } else if (notification.categoryFilter === 'Finanças') {
              setCurrentScreen('expense_details');
            } else {
              const myTask = tasks.find((t) => t.assignee === 'Você') || tasks[0];
              if (myTask) {
                setSelectedTaskId(myTask.id);
                setCurrentScreen('task_details');
              }
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
            onPress={() => alert('Perfil do morador em desenvolvimento para a próxima etapa.')}
          >
            <Feather name="user" size={24} color="#84828F" />
            <Text style={styles.navTabText}>Perfil</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
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