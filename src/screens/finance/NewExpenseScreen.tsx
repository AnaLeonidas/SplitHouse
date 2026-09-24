import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    StatusBar as RNStatusBar,
    KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface NewExpenseScreenProps {
    onBackPress?: () => void;
    onSubmitPress?: () => void;
}

export const NewExpenseScreen: React.FC<NewExpenseScreenProps> = ({
    onBackPress,
    onSubmitPress,
}) => {
    const [value, setValue] = useState('140,00');
    const [description, setDescription] = useState('Internet Fibra 600MB');
    const [divisionType, setDivisionType] = useState('igualitaria');
    const [payer, setPayer] = useState('voce');

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                        <Feather name="chevron-left" size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nova Despesa</Text>
                    <View style={{ width: 42 }} />
                </View>

                <View style={styles.cardInput}>
                    <Text style={styles.labelTitle}>VALOR DA CONTA</Text>
                    <View style={styles.currencyRow}>
                        <Text style={styles.currencySymbol}>R$ </Text>
                        <TextInput
                            style={styles.valueInput}
                            value={value}
                            onChangeText={setValue}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                <View style={styles.cardInput}>
                    <Text style={styles.labelTitle}>DESCRIÇÃO</Text>
                    <TextInput
                        style={styles.textInputDesc}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Ex: Aluguel, Mercado, etc."
                    />
                </View>

                <View style={styles.rowCards}>
                    <TouchableOpacity style={[styles.cardInput, styles.flexCard]}>
                        <Text style={styles.labelTitle}>CATEGORIA</Text>
                        <View style={styles.categoryRow}>
                            <View style={styles.categoryDot} />
                            <Text style={styles.categoryText}>Utilidades</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.cardInput, styles.flexCard]}>
                        <Text style={styles.labelTitle}>VENCIMENTO</Text>
                        <View style={styles.categoryRow}>
                            <Feather name="calendar" size={14} color={Colors.textSecondary} />
                            <Text style={styles.categoryText}>15/09/2026</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.cardInput}>
                    <Text style={styles.labelTitle}>QUEM PAGOU A CONTA?</Text>
                    <View style={styles.payerButtonsRow}>
                        <TouchableOpacity
                            style={[styles.payerBtn, payer === 'voce' && styles.payerBtnActive]}
                            onPress={() => setPayer('voce')}
                        >
                            <Text style={[styles.payerBtnText, payer === 'voce' && styles.payerBtnTextActive]}>
                                Norman Osborn (Você)
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.payerBtn, payer === 'outro' && styles.payerBtnActive]}
                            onPress={() => setPayer('outro')}
                        >
                            <Text style={[styles.payerBtnText, payer === 'outro' && styles.payerBtnTextActive]}>
                                Outro morador
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardInput}>
                    <Text style={styles.labelTitle}>COMO SERÁ A DIVISÃO?</Text>
                    <View style={styles.divisionTabs}>
                        <TouchableOpacity
                            style={[styles.divTab, divisionType === 'igualitaria' && styles.divTabActive]}
                            onPress={() => setDivisionType('igualitaria')}
                        >
                            <Text style={[styles.divTabText, divisionType === 'igualitaria' && styles.divTabTextActive]}>Igualitária</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.divTab, divisionType === 'porcentagem' && styles.divTabActive]}
                            onPress={() => setDivisionType('porcentagem')}
                        >
                            <Text style={[styles.divTabText, divisionType === 'porcentagem' && styles.divTabTextActive]}>Porcentagem</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.divTab, divisionType === 'fixo' && styles.divTabActive]}
                            onPress={() => setDivisionType('fixo')}
                        >
                            <Text style={[styles.divTabText, divisionType === 'fixo' && styles.divTabTextActive]}>Valor Fixo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divisionResultRow}>
                        <Text style={styles.divisionResultText}>Dividir com todos (4 moradores)</Text>
                        <Text style={styles.divisionResultValue}>R$ 35,00 / pessoa</Text>
                    </View>
                    <Text style={styles.divisionMembersText}>Norman Osborn, Doutor Octopus, Lagarto e Homem-Areia.</Text>
                </View>

                <TouchableOpacity style={styles.attachCard}>
                    <View style={styles.attachIconBox}>
                        <Feather name="image" size={16} color={Colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.attachTitle}>Anexar Comprovante</Text>
                        <Text style={styles.attachSubtitle}>Foto da nota fiscal ou boleto</Text>
                    </View>
                    <Text style={styles.attachAddText}>+ Adicionar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitButton} onPress={onSubmitPress}>
                    <Text style={styles.submitButtonText}>Cadastrar despesa</Text>
                    <Feather name="check" size={18} color={Colors.white} />
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#FCFCFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 48, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.white, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.25)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    cardInput: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(132, 130, 143, 0.15)', marginBottom: 12 },
    labelTitle: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
    currencyRow: { flexDirection: 'row', alignItems: 'center' },
    currencySymbol: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
    valueInput: { fontSize: 32, fontWeight: 'bold', color: Colors.text, padding: 0 },
    textInputDesc: { fontSize: 15, fontWeight: '600', color: Colors.text },
    rowCards: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    flexCard: { flex: 1, marginBottom: 0 },
    categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    categoryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
    categoryText: { fontSize: 13, fontWeight: '600', color: Colors.text },
    payerButtonsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    payerBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FAF8FC', alignItems: 'center' },
    payerBtnActive: { backgroundColor: Colors.primary },
    payerBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
    payerBtnTextActive: { color: Colors.white },
    divisionTabs: { flexDirection: 'row', backgroundColor: '#FAF8FC', borderRadius: 8, padding: 4, marginBottom: 16 },
    divTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    divTabActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    divTabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
    divTabTextActive: { color: Colors.primary },
    divisionResultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    divisionResultText: { fontSize: 13, fontWeight: 'bold', color: Colors.text },
    divisionResultValue: { fontSize: 13, fontWeight: 'bold', color: Colors.primary },
    divisionMembersText: { fontSize: 10, color: Colors.textSecondary },
    attachCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(94, 43, 151, 0.3)', borderStyle: 'dashed', marginBottom: 24 },
    attachIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(132, 130, 143, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    attachTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.text },
    attachSubtitle: { fontSize: 10, color: Colors.textSecondary },
    attachAddText: { fontSize: 13, fontWeight: 'bold', color: Colors.primary },
    submitButton: { backgroundColor: Colors.primary, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    submitButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' }
});