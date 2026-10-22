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

/**
 * Propriedades e callbacks da tela de listagem de despesas da moradia.
 */
interface ExpensesListScreenProps {
    /** Callback para abertura do formulário de criação de nova despesa */
    onAddPress?: () => void;
    /** Callback para visualização dos detalhes e comprovantes de uma despesa */
    onExpenseDetailsPress?: () => void;
    /** Nome da moradia conectada */
    houseName?: string;
    /** Lista de despesas reais da moradia */
    expenses?: any[];
}

/**
 * Tela de listagem e controle de despesas coletivas (Tela 14).
 * Exibe histórico de contas, filtros por categoria/status (Todos, Pendentes, Pagas, Recorrentes) e atalhos de ação.
 *
 * @param props Callbacks para adicionar despesa e navegar para detalhes.
 */
export const ExpensesListScreen: React.FC<ExpensesListScreenProps> = ({
    onAddPress,
    onExpenseDetailsPress,
    houseName = 'Sua moradia',
    expenses = [],
}) => {
    const [activeTab, setActiveTab] = useState('Todos');
    const tabs = ['Todos', 'Pendentes', 'Pagas', 'Recorrentes'];

    return (
        <View style={styles.wrapper}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Despesas</Text>
                        <Text style={styles.subtitle}>{houseName}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.filterButton}>
                            <Feather name="sliders" size={18} color={Colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={onAddPress}
                        >
                            <Feather name="plus" size={16} color={Colors.white} />
                            <Text style={styles.addButtonText}>Adicionar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsContainer}
                    contentContainerStyle={styles.tabsContent}
                >
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.listContainer}>
                    {expenses.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <View style={styles.emptyIconBox}>
                                <Feather name="dollar-sign" size={32} color={Colors.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>Nenhuma despesa cadastrada</Text>
                            <Text style={styles.emptySubtitle}>
                                Todas as contas da casa estão em dia ou ainda não foram registradas.
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyAddButton}
                                activeOpacity={0.85}
                                onPress={onAddPress}
                            >
                                <Feather name="plus" size={16} color={Colors.white} />
                                <Text style={styles.emptyAddButtonText}>Adicionar despesa</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        expenses.map((expense, index) => (
                            <TouchableOpacity key={index} style={styles.card} onPress={onExpenseDetailsPress}>
                                <View style={styles.cardMain}>
                                    <View style={styles.iconBoxPurple}>
                                        <Feather name="file-text" size={20} color={Colors.primary} />
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardTitle}>{expense.titulo || 'Despesa'}</Text>
                                        <Text style={styles.cardSubtitle}>Vence em {expense.vencimento || 'Breve'}</Text>
                                    </View>
                                    <View style={styles.cardValues}>
                                        <Text style={styles.totalValue}>R$ {expense.valor || '0,00'}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
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
        paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 48,
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        height: 36,
        borderRadius: 12,
        gap: 6,
    },
    addButtonText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: 'bold',
    },
    tabsContainer: {
        marginBottom: 24,
        maxHeight: 36,
    },
    tabsContent: {
        gap: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.2)',
        justifyContent: 'center',
    },
    activeTab: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.white,
    },
    listContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    cardMain: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    iconBoxPurple: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(94, 43, 151, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconBoxPink: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(204, 146, 194, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconBoxGray: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(132, 130, 143, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
        paddingRight: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 11,
        color: Colors.textSecondary,
        lineHeight: 16,
    },
    cardValues: {
        alignItems: 'flex-end',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 6,
    },
    yourPartLabel: {
        fontSize: 10,
        color: Colors.primary,
        fontWeight: '700',
    },
    yourPartValue: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    quitadaText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: 'bold',
        marginTop: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(132, 130, 143, 0.1)',
        paddingTop: 12,
    },
    footerText: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    badgeGray: {
        backgroundColor: 'rgba(132, 130, 143, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeGrayText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.textSecondary,
    },
    badgeGreenOutline: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeGreenOutlineText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#10B981',
    },
    badgeGreenSolid: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeGreenSolidText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#10B981',
    },
    emptyCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.18)',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(94, 43, 151, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 6,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 12.5,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 18,
        paddingHorizontal: 12,
    },
    emptyAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 8,
    },
    emptyAddButtonText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
});