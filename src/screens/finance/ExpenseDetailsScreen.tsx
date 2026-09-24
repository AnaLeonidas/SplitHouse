import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface ExpenseDetailsScreenProps {
    onBackPress?: () => void;
    onNudgePress?: () => void;
}

export const ExpenseDetailsScreen: React.FC<ExpenseDetailsScreenProps> = ({ onBackPress, onNudgePress }) => {
    return (
        <View style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                        <Feather name="chevron-left" size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalhes da Conta</Text>
                    <View style={{ width: 42 }} />
                </View>

                <View style={styles.mainCard}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>Utilidades</Text>
                        </View>
                        <Text style={styles.dueDateText}>Vencimento: 15/09/2026</Text>
                    </View>

                    <Text style={styles.expenseTitle}>Internet Fibra 600MB</Text>
                    <View style={styles.valueRow}>
                        <Text style={styles.valueLabel}>Valor total: </Text>
                        <Text style={styles.valueAmount}>R$ 140,00</Text>
                    </View>

                    <View style={styles.payerBox}>
                        <Text style={styles.payerLabel}>Pago integralmente por:</Text>
                        <Text style={styles.payerName}>Norman Osborn</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.receiptCard}>
                    <View style={styles.receiptIconBox}>
                        <Feather name="file-text" size={16} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.receiptTitle}>Comprovante Anexado</Text>
                        <Text style={styles.receiptSubtitle}>comprovante_internet_set.pdf</Text>
                    </View>
                    <Text style={styles.viewText}>Visualizar</Text>
                </TouchableOpacity>

                <View style={styles.divisionCard}>
                    <View style={styles.divisionHeader}>
                        <Text style={styles.divisionTitle}>Divisão do Rateio (4 partes)</Text>
                        <Text style={styles.divisionValue}>R$ 35,00 cada</Text>
                    </View>

                    <View style={styles.memberRow}>
                        <View style={[styles.avatar, { backgroundColor: Colors.primary }]}><Text style={[styles.avatarText, { color: Colors.white }]}>NO</Text></View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.memberName}>Norman Osborn</Text>
                            <Text style={styles.memberRole}>Pagador original</Text>
                        </View>
                        <View style={styles.statusBadgeGreen}><Text style={styles.statusTextGreen}>Quitado</Text></View>
                    </View>

                    <View style={styles.memberRow}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>DO</Text></View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.memberName}>Doutor Octopus</Text>
                        </View>
                        <View style={styles.statusBadgeGray}><Text style={styles.statusTextGray}>Pendente</Text></View>
                    </View>

                    <View style={styles.memberRow}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>LG</Text></View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.memberName}>Lagarto</Text>
                        </View>
                        <View style={styles.statusBadgeGreen}><Text style={styles.statusTextGreen}>Quitado</Text></View>
                    </View>

                    <View style={styles.memberRow}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>HA</Text></View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.memberName}>Homem-Areia</Text>
                        </View>
                        <View style={styles.statusBadgeGray}><Text style={styles.statusTextGray}>Pendente</Text></View>
                    </View>

                </View>

                <TouchableOpacity style={styles.nudgeButton} onPress={onNudgePress}>
                    <Feather name="bell" size={16} color={Colors.white} />
                    <Text style={styles.nudgeButtonText}>Lembrar pendentes (Cutucar)</Text>
                </TouchableOpacity>

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
    mainCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.15)', marginBottom: 16 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    categoryBadge: { backgroundColor: 'rgba(94, 43, 151, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    categoryBadgeText: { color: Colors.primary, fontSize: 10, fontWeight: 'bold' },
    dueDateText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
    expenseTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 8 },
    valueRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 24 },
    valueLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
    valueAmount: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
    payerBox: { backgroundColor: '#FAF8FC', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    payerLabel: { fontSize: 11, color: Colors.textSecondary },
    payerName: { fontSize: 13, fontWeight: 'bold', color: Colors.text },
    receiptCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: 24 },
    receiptIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    receiptTitle: { fontSize: 12, fontWeight: 'bold', color: Colors.text },
    receiptSubtitle: { fontSize: 10, color: Colors.textSecondary },
    viewText: { fontSize: 12, fontWeight: 'bold', color: Colors.primary },
    divisionCard: { marginBottom: 24 },
    divisionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    divisionTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.text },
    divisionValue: { fontSize: 13, fontWeight: 'bold', color: Colors.primary },
    memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(204, 146, 194, 0.2)', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 11, fontWeight: 'bold', color: Colors.text },
    memberName: { fontSize: 13, fontWeight: 'bold', color: Colors.text },
    memberRole: { fontSize: 10, color: Colors.primary, marginTop: 2 },
    statusBadgeGreen: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusTextGreen: { fontSize: 10, fontWeight: 'bold', color: '#10B981' },
    statusBadgeGray: { backgroundColor: 'rgba(132, 130, 143, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusTextGray: { fontSize: 10, fontWeight: 'bold', color: Colors.textSecondary },
    nudgeButton: { backgroundColor: Colors.primary, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    nudgeButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});