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

interface HomeScreenProps {
    onNewExpensePress?: () => void;
    onExpensesTabPress?: () => void;
    onSettleUpPress?: () => void;
    onReportPress?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    onNewExpensePress,
    onExpensesTabPress,
    onSettleUpPress,
    onReportPress,
}) => {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>NO</Text>
                        </View>
                        <View>
                            <View style={styles.nameRow}>
                                <Text style={styles.userName}>Norman Osborn</Text>
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelText}>Nv. 4</Text>
                                </View>
                            </View>
                            <View style={styles.houseRow}>
                                <Feather name="home" size={12} color={Colors.primary} />
                                <Text style={styles.houseName}>República do Sexteto Sinistro</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={onReportPress}>
                            <Feather name="bar-chart-2" size={20} color={Colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Feather name="bell" size={20} color={Colors.text} />
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceTitle}>SEU SALDO NA CASA</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>Você tem a receber</Text>
                        </View>
                    </View>
                    <Text style={styles.balanceAmount}>
                        <Text style={styles.currencySymbol}>R$ </Text>
                        85,50
                    </Text>
                    <View style={styles.balanceFooter}>
                        <View style={styles.debtorInfo}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.debtorText}>Doutor Octopus te deve:</Text>
                        </View>
                        <Text style={styles.debtorAmount}>R$ 85,50</Text>
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

                    <TouchableOpacity style={styles.actionCard}>
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
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>Ver todas</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tasksList}>
                    <TouchableOpacity style={styles.taskCard}>
                        <View style={styles.checkbox} />
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskTitle}>Lavar louça do almoço</Text>
                            <Text style={styles.taskSubtitle}>Cozinha • Prazo: hoje às 14:00</Text>
                        </View>
                        <View style={styles.xpBadge}>
                            <Text style={styles.xpText}>+30 XP</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.taskCard}>
                        <View style={styles.checkbox} />
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskTitle}>Tirar lixo reciclável</Text>
                            <Text style={styles.taskSubtitle}>Área externa • Prazo: hoje às 19:00</Text>
                        </View>
                        <View style={styles.xpBadge}>
                            <Text style={styles.xpText}>+15 XP</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.rankingCard}>
                    <View style={styles.rankingIconWrapper}>
                        <Feather name="award" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.rankingInfo}>
                        <Text style={styles.rankingSubtitle}>CLASSIFICAÇÃO SEMANAL</Text>
                        <Text style={styles.rankingTitle}>1º Lugar: Norman Osborn (340 XP)</Text>
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
        paddingBottom: 100,
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
    }
});