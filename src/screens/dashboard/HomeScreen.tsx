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
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { TaskItem } from '../tasks/TasksListScreen';

/**
 * Propriedades e callbacks do painel principal (Dashboard) da moradia.
 */
interface HomeScreenProps {
    /** Callback para cadastrar nova despesa */
    onNewExpensePress?: () => void;
    /** Callback para navegar para a aba de despesas */
    onExpensesTabPress?: () => void;
    /** Callback para navegar para a aba de tarefas */
    onTasksTabPress?: () => void;
    /** Callback para criar nova tarefa doméstica */
    onNewTaskPress?: () => void;
    /** Callback ao clicar em uma tarefa do quadro rápido */
    onTaskPress?: (taskTitle: string) => void;
    /** Callback para abrir central de notificações */
    onNotificationsPress?: () => void;
    /** Callback para abrir o ranking da moradia */
    onRankingPress?: () => void;
    /** Callback para acerto rápido de contas */
    onSettleUpPress?: () => void;
    /** Callback para visualização dos relatórios mensais */
    onReportPress?: () => void;
    /** Callback para gestão de membros e convites */
    onManageMembersPress?: () => void;
    /** Lista de tarefas sincronizadas com o backend */
    tasks?: TaskItem[];
    /** Nome da moradia conectada */
    houseName?: string;
    /** Saldo líquido na moradia */
    balanceAmount?: string;
    /** Status do saldo (ex: Tudo em dia, Você tem a receber) */
    balanceStatus?: string;
    /** Texto informativo de devedor */
    debtorText?: string;
    /** Valor devido por outro morador */
    debtorAmount?: string;
    /** Nome do morador líder no ranking */
    leaderName?: string;
    /** Pontuação de XP do líder */
    leaderXp?: number;
    /** Nível de gamificação do morador */
    userLevel?: number;
}

/**
 * Tela do painel principal e visão geral da moradia (Tela 13).
 * Centraliza resumo financeiro pessoal, próximas tarefas a vencer, destaques da convivência e atalhos rápidos.
 *
 * @param props Callbacks de navegação para os diferentes módulos integrados do SplitHouse.
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({
    onNewExpensePress,
    onExpensesTabPress,
    onTasksTabPress,
    onNewTaskPress,
    onTaskPress,
    onNotificationsPress,
    onRankingPress,
    onSettleUpPress,
    onReportPress,
    onManageMembersPress,
    tasks,
    houseName = 'Sua moradia',
    balanceAmount = '0,00',
    balanceStatus = 'Tudo em dia',
    debtorText,
    debtorAmount,
    leaderName,
    leaderXp = 0,
    userLevel = 1,
}) => {
    const { profile } = useAuth();
    const userName = profile?.nome_completo || 'Morador';
    const initials = profile?.nome_completo
        ? profile.nome_completo
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : 'SH';

    const todayTasks = tasks && tasks.length > 0
        ? tasks.filter((t) => t.status !== 'Concluída').slice(0, 3)
        : null;
    return (
        <View style={styles.wrapper}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View>
                            <View style={styles.nameRow}>
                                <Text style={styles.userName}>{userName}</Text>
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelText}>Nv. {userLevel}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.houseRow}
                                activeOpacity={0.7}
                                onPress={onManageMembersPress}
                            >
                                <Feather name="home" size={12} color={Colors.primary} />
                                <Text style={styles.houseName}>{houseName}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={onReportPress}>
                            <Feather name="bar-chart-2" size={20} color={Colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={onNotificationsPress}>
                            <Feather name="bell" size={20} color={Colors.text} />
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceTitle}>SEU SALDO NA CASA</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>{balanceStatus}</Text>
                        </View>
                    </View>
                    <Text style={styles.balanceAmount}>
                        <Text style={styles.currencySymbol}>R$ </Text>
                        {balanceAmount}
                    </Text>
                    <View style={styles.balanceFooter}>
                        <View style={styles.debtorInfo}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.debtorText}>
                                {debtorText || 'Nenhum acerto pendente no momento'}
                            </Text>
                        </View>
                        {debtorAmount && <Text style={styles.debtorAmount}>{debtorAmount}</Text>}
                    </View>
                </View>

                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={onNewExpensePress}
                    >
                        <View style={styles.actionIconWrapper}>
                            <Feather name="dollar-sign" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.actionText}>Nova despesa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={onNewTaskPress}
                    >
                        <View style={styles.actionIconWrapper}>
                            <Feather name="plus" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.actionText}>Nova tarefa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={onSettleUpPress}
                    >
                        <View style={styles.actionIconWrapper}>
                            <Feather name="credit-card" size={20} color={Colors.text} />
                        </View>
                        <Text style={styles.actionText}>Acertar contas</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Suas tarefas para hoje</Text>
                    <TouchableOpacity onPress={onTasksTabPress}>
                        <Text style={styles.seeAllText}>Ver todas</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tasksList}>
                    {todayTasks && todayTasks.length > 0 ? (
                        todayTasks.map((task) => (
                            <TouchableOpacity
                                key={task.id}
                                style={styles.taskCard}
                                activeOpacity={0.8}
                                onPress={() => onTaskPress && onTaskPress(task.title)}
                            >
                                <View style={styles.checkbox} />
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle}>{task.title}</Text>
                                    <Text style={styles.taskSubtitle}>
                                        {task.location} • Prazo: {task.deadline}
                                    </Text>
                                </View>
                                <View style={styles.xpBadge}>
                                    <Text style={styles.xpText}>+{task.xp} XP</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyHomeTasksCard}>
                            <Feather name="check-circle" size={22} color={Colors.primary} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.emptyHomeTasksTitle}>Tudo em ordem!</Text>
                                <Text style={styles.emptyHomeTasksSubtitle}>
                                    Nenhuma tarefa pendente para hoje.
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.emptyHomeAddBtn}
                                activeOpacity={0.7}
                                onPress={onNewTaskPress}
                            >
                                <Feather name="plus" size={16} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.rankingCard}
                    activeOpacity={0.8}
                    onPress={onRankingPress}
                >
                    <View style={styles.rankingIconWrapper}>
                        <Feather name="award" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.rankingInfo}>
                        <Text style={styles.rankingSubtitle}>CLASSIFICAÇÃO SEMANAL</Text>
                        <Text style={styles.rankingTitle}>
                            {leaderName ? `1º Lugar: ${leaderName} (${leaderXp} XP)` : 'Classificação da casa'}
                        </Text>
                    </View>
                    <Text style={styles.seeRankingText}>Ver ranking{"\n"}→</Text>
                </TouchableOpacity>
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
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 48,
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    levelBadge: {
        backgroundColor: 'rgba(94, 43, 151, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    levelText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    houseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    houseName: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    balanceCard: {
        backgroundColor: '#4A2377',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    balanceTitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    statusBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '500',
    },
    balanceAmount: {
        color: Colors.white,
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    balanceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        padding: 12,
        borderRadius: 16,
    },
    debtorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bulletPoint: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#CC92C2',
    },
    debtorText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
    debtorAmount: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 28,
    },
    actionCard: {
        width: '31%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(94, 43, 151, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    seeAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    tasksList: {
        gap: 12,
        marginBottom: 24,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.15)',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.primary,
        marginRight: 12,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    taskSubtitle: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    xpBadge: {
        backgroundColor: 'rgba(94, 43, 151, 0.08)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    xpText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    rankingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(94, 43, 151, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(94, 43, 151, 0.15)',
        borderRadius: 16,
        padding: 16,
    },
    rankingIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(94, 43, 151, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    rankingInfo: {
        flex: 1,
    },
    rankingSubtitle: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginBottom: 2,
    },
    rankingTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.text,
    },
    seeRankingText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
        textAlign: 'center',
    },
    emptyHomeTasksCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.15)',
        marginBottom: 8,
    },
    emptyHomeTasksTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 2,
    },
    emptyHomeTasksSubtitle: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    emptyHomeAddBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(94, 43, 151, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});