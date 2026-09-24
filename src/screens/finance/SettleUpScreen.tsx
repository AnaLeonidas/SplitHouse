import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface SettleUpScreenProps {
    onBackPress?: () => void;
    onPayPress?: () => void;
}

export const SettleUpScreen: React.FC<SettleUpScreenProps> = ({ onBackPress, onPayPress }) => {
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
                        <Text style={styles.statusLabel}>SITUAÇÃO DE NORMAN OSBORN</Text>
                        <View style={styles.creditorBadge}>
                            <Text style={styles.creditorBadgeText}>Credor Geral</Text>
                        </View>
                    </View>
                    <View style={styles.statusValueRow}>
                        <Text style={styles.balanceLabel}>Saldo líquido a receber: </Text>
                        <Text style={styles.balanceValue}>R$ 85,50</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Pendências bilaterais na casa</Text>

                <View style={styles.debtCard}>
                    <View style={styles.debtMain}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>DO</Text></View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.debtorName}>Doutor Octopus</Text>
                            <Text style={styles.debtorStatus}>deve para você</Text>
                        </View>
                        <Text style={styles.debtAmount}>R$ 50,50</Text>
                    </View>
                    <View style={styles.debtFooter}>
                        <Text style={styles.refText}>Ref: Internet Fibra + Padaria</Text>
                        <TouchableOpacity style={styles.smallNudgeBtn}>
                            <Text style={styles.smallNudgeText}>Lembrar (Cutucar)</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.debtCard}>
                    <View style={styles.debtMain}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>HA</Text></View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.debtorName}>Homem-Areia</Text>
                            <Text style={styles.debtorStatus}>deve para você</Text>
                        </View>
                        <Text style={styles.debtAmount}>R$ 35,00</Text>
                    </View>
                    <View style={styles.debtFooter}>
                        <Text style={styles.refText}>Ref: Internet Fibra</Text>
                        <TouchableOpacity style={styles.smallNudgeBtn}>
                            <Text style={styles.smallNudgeText}>Lembrar (Cutucar)</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.debtCard}>
                    <View style={[styles.debtMain, { marginBottom: 0 }]}>
                        <View style={[styles.avatar, { backgroundColor: '#F3F4F6' }]}><Text style={styles.avatarText}>LG</Text></View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.debtorName}>Lagarto</Text>
                            <Text style={[styles.debtorStatus, { color: '#10B981', fontWeight: 'bold' }]}>Tudo quitado com você</Text>
                        </View>
                        <Text style={[styles.debtAmount, { color: Colors.textSecondary }]}>R$ 0,00</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.payButton} onPress={onPayPress}>
                    <Feather name="credit-card" size={18} color={Colors.white} />
                    <Text style={styles.payButtonText}>Informar pagamento efetuado</Text>
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