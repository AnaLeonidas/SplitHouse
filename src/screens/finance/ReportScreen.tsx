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

/**
 * Propriedades e callbacks da tela de relatórios financeiros.
 */
interface ReportScreenProps {
    /** Callback para voltar ao painel financeiro */
    onBackPress?: () => void;
    /** Total de despesas */
    totalAmount?: string;
    /** Média por morador */
    averagePerResident?: string;
    /** Histórico de movimentações */
    history?: {
        id: string;
        title: string;
        subtitle: string;
        value: string;
        isIncome?: boolean;
    }[];
}

/**
 * Tela de relatórios e métricas de gastos mensais da moradia (Tela 19).
 * Apresenta comparativos de consumo por categoria (aluguel, mercado, utilidades), histórico mensal e opção de exportação.
 *
 * @param props Handler para retorno da navegação.
 */
export const ReportScreen: React.FC<ReportScreenProps> = ({
    onBackPress,
    totalAmount = '0,00',
    averagePerResident = '0,00',
    history = [],
}) => {
    return (
        <View style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                        <Feather name="chevron-left" size={22} color={Colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.monthSelector}>
                        <Text style={styles.monthText}>Mês Atual</Text>
                        <Feather name="chevron-down" size={16} color={Colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backButton}>
                        <Feather name="download" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.pageTitle}>Histórico e Gráficos</Text>

                <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>TOTAL DE DESPESAS DA CASA NO CICLO</Text>
                    <View style={styles.totalValueRow}>
                        <Text style={styles.currencySymbol}>R$ </Text>
                        <Text style={styles.totalValue}>{totalAmount}</Text>
                    </View>
                    <Text style={styles.totalSubtitle}>Média calculada de <Text style={styles.totalSubtitleBold}>R$ {averagePerResident}</Text> por morador.</Text>
                </View>

                <View style={styles.historyCard}>
                    <Text style={styles.cardTitle}>Registro de Movimentações Recentes</Text>

                    {history.length === 0 ? (
                        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                            <Feather name="clock" size={28} color={Colors.textSecondary} style={{ marginBottom: 8 }} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 }}>
                                Nenhuma movimentação recente
                            </Text>
                            <Text style={{ fontSize: 12, color: Colors.textSecondary, textAlign: 'center' }}>
                                As despesas e quitações registradas aparecerão aqui.
                            </Text>
                        </View>
                    ) : (
                        history.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <View style={styles.historyItem}>
                                    <View style={styles.historyInfo}>
                                        <Text style={styles.historyItemTitle}>{item.title}</Text>
                                        <Text style={styles.historyItemSubtitle}>{item.subtitle}</Text>
                                    </View>
                                    <Text style={[styles.historyItemValue, { color: item.isIncome ? '#10B981' : Colors.primary }]}>
                                        {item.value}
                                    </Text>
                                </View>
                                {index < history.length - 1 && <View style={styles.divider} />}
                            </React.Fragment>
                        ))
                    )}
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