import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

import { useAuth } from '../../contexts/AuthContext';

/**
 * Propriedades e callbacks da tela de acerto de contas.
 */
interface SettleUpScreenProps {
    /** Callback para voltar ao painel financeiro */
    onBackPress?: () => void;
    /** Callback para iniciar fluxo de liquidação ou pagamento de dívida */
    onPayPress?: () => void;
    /** Lista de pendências bilaterais */
    debts?: {
        id: string;
        debtorName: string;
        debtorInitials: string;
        debtorStatus: string;
        debtAmount: string;
        refText?: string;
        isSettled?: boolean;
    }[];
    /** Saldo líquido formatado */
    netBalance?: string;
}

/**
 * Tela de balanço líquido e acerto de contas entre moradores (Tela 17).
 * Calcula e simplifica as dívidas cruzadas da casa, indicando quem deve a quem com o menor número possível de transferências.
 *
 * @param props Callbacks de navegação de retorno e liquidação de dívidas.
 */
export const SettleUpScreen: React.FC<SettleUpScreenProps> = ({
    onBackPress,
    onPayPress,
    debts = [],
    netBalance = 'R$ 0,00',
}) => {
    const { profile } = useAuth();
    const displayName = profile?.nome_completo ? profile.nome_completo.toUpperCase() : 'SUA SITUAÇÃO';

    return (
        <View style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                        <Feather name="chevron-left" size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Acertar Contas</Text>
                    <View style={{ width: 42 }} />
                </View>

                <Text style={styles.pageTitle}>Balanço da Casa</Text>

                <View style={styles.statusCard}>
                    <View style={styles.statusTopRow}>
                        <Text style={styles.statusLabel}>SITUAÇÃO DE {displayName}</Text>
                        <View style={styles.creditorBadge}>
                            <Text style={styles.creditorBadgeText}>Tudo em dia</Text>
                        </View>
                    </View>
                    <View style={styles.statusValueRow}>
                        <Text style={styles.balanceLabel}>Saldo líquido: </Text>
                        <Text style={styles.balanceValue}>{netBalance}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Pendências bilaterais na casa</Text>

                {debts.length === 0 ? (
                    <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 32, alignItems: 'center', marginVertical: 20, borderWidth: 1, borderColor: '#F3F4F6' }}>
                        <Feather name="check-circle" size={32} color="#10B981" style={{ marginBottom: 12 }} />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 }}>
                            Tudo acertado!
                        </Text>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center' }}>
                            Nenhum acerto de contas pendente entre os moradores no momento.
                        </Text>
                    </View>
                ) : (
                    debts.map((item) => (
                        <View key={item.id} style={styles.debtCard}>
                            <View style={[styles.debtMain, item.isSettled && { marginBottom: 0 }]}>
                                <View style={[styles.avatar, item.isSettled && { backgroundColor: '#F3F4F6' }]}>
                                    <Text style={styles.avatarText}>{item.debtorInitials}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.debtorName}>{item.debtorName}</Text>
                                    <Text style={[styles.debtorStatus, item.isSettled && { color: '#10B981', fontWeight: 'bold' }]}>
                                        {item.debtorStatus}
                                    </Text>
                                </View>
                                <Text style={[styles.debtAmount, item.isSettled && { color: Colors.textSecondary }]}>
                                    {item.debtAmount}
                                </Text>
                            </View>
                            {item.refText && !item.isSettled && (
                                <View style={styles.debtFooter}>
                                    <Text style={styles.refText}>{item.refText}</Text>
                                    <TouchableOpacity style={styles.smallNudgeBtn}>
                                        <Text style={styles.smallNudgeText}>Lembrar (Cutucar)</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                )}

                {onPayPress && debts.length > 0 && (
                    <TouchableOpacity style={styles.payButton} onPress={onPayPress}>
                        <Feather name="credit-card" size={18} color={Colors.white} />
                        <Text style={styles.payButtonText}>Informar pagamento efetuado</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#FCFCFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 48, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.white, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.25)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    pageTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, marginBottom: 20 },
    statusCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(94, 43, 151, 0.2)', marginBottom: 32 },
    statusTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statusLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.textSecondary, letterSpacing: 0.5 },
    creditorBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    creditorBadgeText: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
    statusValueRow: { flexDirection: 'row', alignItems: 'flex-end' },
    balanceLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
    balanceValue: { fontSize: 26, fontWeight: 'bold', color: Colors.primary },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
    debtCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.15)', marginBottom: 12 },
    debtMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(204, 146, 194, 0.2)', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 12, fontWeight: 'bold', color: Colors.text },
    debtorName: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
    debtorStatus: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
    debtAmount: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
    debtFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(132, 130, 143, 0.1)', paddingTop: 12 },
    refText: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
    smallNudgeBtn: { backgroundColor: 'rgba(94, 43, 151, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    smallNudgeText: { color: Colors.primary, fontSize: 11, fontWeight: 'bold' },
    payButton: { backgroundColor: Colors.primary, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
    payButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});