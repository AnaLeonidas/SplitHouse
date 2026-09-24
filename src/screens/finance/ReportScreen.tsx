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

interface ReportScreenProps {
    onBackPress?: () => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({ onBackPress }) => {
    return (
        <View style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                        <Feather name="chevron-left" size={22} color={Colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.monthSelector}>
                        <Text style={styles.monthText}>Setembro 2026</Text>
                        <Feather name="chevron-down" size={16} color={Colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backButton}>
                        <Feather name="download" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.pageTitle}>Histórico e Gráficos</Text>

                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>TOTAL DE DESPESAS DA CASA EM SETEMBRO</Text>
                    <View style={styles.totalValueRow}>
                        <Text style={styles.currencySymbol}>R$ </Text>
                        <Text style={styles.totalValue}>1.840,00</Text>
                    </View>
                    <Text style={styles.totalSubtitle}>Média de <Text style={styles.totalSubtitleBold}>R$ 460,00</Text> por morador (4 pessoas).</Text>
                </View>

                <View style={styles.chartCard}>
                    <Text style={styles.cardTitle}>Divisão por Categorias</Text>

                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressSegment, { flex: 5, backgroundColor: Colors.primary }]} />
                        <View style={[styles.progressSegment, { flex: 2.5, backgroundColor: '#CC92C2' }]} />
                        <View style={[styles.progressSegment, { flex: 1.5, backgroundColor: '#84828F' }]} />
                        <View style={[styles.progressSegment, { flex: 1, backgroundColor: '#1A1A1A' }]} />
                    </View>

                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                            <Text style={styles.legendText}>Aluguel: <Text style={styles.legendValue}>R$ 920</Text></Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#CC92C2' }]} />
                            <Text style={styles.legendText}>Energia/Água: <Text style={styles.legendValue}>R$ 460</Text></Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#84828F' }]} />
                            <Text style={styles.legendText}>Mercado: <Text style={styles.legendValue}>R$ 276</Text></Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#1A1A1A' }]} />
                            <Text style={styles.legendText}>Internet: <Text style={styles.legendValue}>R$ 184</Text></Text>
                        </View>
                    </View>
                </View>

                <View style={styles.historyCard}>
                    <Text style={styles.cardTitle}>Registro de Movimentações Recentes (RN-11)</Text>

                    <View style={styles.historyItem}>
                        <View style={styles.historyInfo}>
                            <Text style={styles.historyItemTitle}>Internet Fibra 600MB cadastrada</Text>
                            <Text style={styles.historyItemSubtitle}>Por Norman Osborn • 10/09 às 14:22</Text>
                        </View>
                        <Text style={[styles.historyItemValue, { color: Colors.primary }]}>+ R$ 140,00</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.historyItem}>
                        <View style={styles.historyInfo}>
                            <Text style={styles.historyItemTitle}>Quitação confirmada: Lagarto</Text>
                            <Text style={styles.historyItemSubtitle}>Por Norman Osborn • 09/09 às 18:10</Text>
                        </View>
                        <Text style={[styles.historyItemValue, { color: '#10B981' }]}>R$ 35,00</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.historyItem}>
                        <View style={styles.historyInfo}>
                            <Text style={styles.historyItemTitle}>Compras de Limpeza quitada</Text>
                            <Text style={styles.historyItemSubtitle}>Por Lagarto • 08/09 às 11:05</Text>
                        </View>
                        <Text style={[styles.historyItemValue, { color: Colors.text }]}>R$ 68,00</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#FCFCFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 48, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.white, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.25)', alignItems: 'center', justifyContent: 'center' },
    monthSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.2)', gap: 8 },
    monthText: { fontSize: 13, fontWeight: 'bold', color: Colors.text },
    pageTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, marginBottom: 20 },
    totalCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(94, 43, 151, 0.15)', marginBottom: 16 },
    totalLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 8 },
    totalValueRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    currencySymbol: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginTop: 4, marginRight: 4 },
    totalValue: { fontSize: 36, fontWeight: '900', color: Colors.text },
    totalSubtitle: { fontSize: 11, color: Colors.textSecondary },
    totalSubtitleBold: { fontWeight: 'bold', color: Colors.text },
    chartCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.15)', marginBottom: 16 },
    cardTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
    progressBarContainer: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 20, gap: 2 },
    progressSegment: { height: '100%' },
    legendContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
    legendItem: { flexDirection: 'row', alignItems: 'center', width: '45%', marginBottom: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    legendText: { fontSize: 11, color: Colors.textSecondary },
    legendValue: { fontWeight: 'bold', color: Colors.textSecondary },
    historyCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.15)', marginBottom: 16 },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyInfo: { flex: 1, paddingRight: 12 },
    historyItemTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
    historyItemSubtitle: { fontSize: 10, color: Colors.textSecondary },
    historyItemValue: { fontSize: 14, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: 'rgba(132, 130, 143, 0.1)', marginVertical: 14 },
});