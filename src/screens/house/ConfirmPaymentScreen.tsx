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

interface ConfirmPaymentScreenProps {
    onBackPress?: () => void;
    onConfirmPress?: () => void;
    onRejectPress?: () => void;
}

export const ConfirmPaymentScreen: React.FC<ConfirmPaymentScreenProps> = ({
    onBackPress,
    onConfirmPress,
    onRejectPress,
}) => {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                        <Feather name="chevron-left" size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Validar Pagamento</Text>
                    <View style={{ width: 42 }} />
                </View>

                <View style={styles.centerContainer}>
                    <View style={styles.shieldIconBox}>
                        <Feather name="shield" size={28} color={Colors.primary} />
                        <View style={styles.shieldCheckBadge}>
                            <Feather name="check" size={10} color={Colors.white} />
                        </View>
                    </View>

                    <Text style={styles.mainTitle}>Confirmar Recebimento?</Text>
                    <Text style={styles.subtitle}>
                        A quitação da dívida só é efetivada após a sua confirmação.
                    </Text>
                </View>

                <View style={styles.detailsCard}>
                    <View style={styles.payerRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>DO</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.payerLabel}>PAGADOR</Text>
                            <Text style={styles.payerName}>Doutor Octopus</Text>
                            <Text style={styles.paymentMethod}>Transferência via Pix</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Valor informado:</Text>
                        <Text style={styles.infoValueLarge}>R$ 50,50</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Referente a:</Text>
                        <Text style={styles.infoValue}>Internet Fibra 600MB</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Data e hora:</Text>
                        <Text style={styles.infoValue}>Hoje às 10:42</Text>
                    </View>

                    <TouchableOpacity style={styles.receiptButton}>
                        <View style={styles.receiptLeft}>
                            <Feather name="image" size={16} color={Colors.primary} />
                            <Text style={styles.receiptText} numberOfLines={1}>comprovante_pix_octopus.png</Text>
                        </View>
                        <Text style={styles.receiptActionText}>Ver</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.confirmButton} onPress={onConfirmPress}>
                    <Feather name="check" size={18} color={Colors.white} />
                    <Text style={styles.confirmButtonText}>Confirmar recebimento</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.rejectButton} onPress={onRejectPress}>
                    <Text style={styles.rejectButtonText}>Não recebi esse pagamento</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#FCFCFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 48, paddingBottom: 24 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
    backButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.white, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.25)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    centerContainer: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 16 },
    shieldIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(94, 43, 151, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
    shieldCheckBadge: { position: 'absolute', bottom: 14, right: 14, backgroundColor: Colors.primary, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.white },
    mainTitle: { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
    detailsCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.15)' },
    payerRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(204, 146, 194, 0.2)', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
    payerLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.textSecondary, letterSpacing: 0.5 },
    payerName: { fontSize: 15, fontWeight: 'bold', color: Colors.text, marginTop: 2 },
    paymentMethod: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
    divider: { height: 1, backgroundColor: 'rgba(132, 130, 143, 0.15)', marginVertical: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    infoLabel: { fontSize: 12, color: Colors.textSecondary },
    infoValueLarge: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
    infoValue: { fontSize: 12, fontWeight: 'bold', color: Colors.text },
    receiptButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAF8FC', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: 'rgba(94, 43, 151, 0.1)' },
    receiptLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
    receiptText: { fontSize: 12, color: Colors.primary, marginLeft: 8, fontWeight: '500' },
    receiptActionText: { fontSize: 12, fontWeight: 'bold', color: Colors.primary },
    bottomActions: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingTop: 16, backgroundColor: '#FCFCFC' },
    confirmButton: { backgroundColor: Colors.primary, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
    confirmButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
    rejectButton: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.2)' },
    rejectButtonText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
});