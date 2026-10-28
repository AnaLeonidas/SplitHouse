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
    Alert,
    Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Dados coletados e validados pelo formulário de criação de nova despesa coletiva.
 */
export interface ExpenseFormData {
    title: string;
    amount: number;
    category: string;
    dueDate?: string | null;
    divisionType: 'igualitaria' | 'porcentagem' | 'fixo';
    payerId: string;
}

/**
 * Opção de morador para atribuição de pagador da despesa.
 */
export interface MemberOption {
    id: string;
    name: string;
}

/**
 * Propriedades e callbacks do formulário de cadastro de nova despesa.
 */
interface NewExpenseScreenProps {
    /** Callback para voltar à listagem de despesas */
    onBackPress?: () => void;
    /** Callback para submeter os dados e salvar a nova despesa */
    onSubmitPress?: (data: ExpenseFormData) => void;
    /** Lista de membros da república para seleção do pagador */
    membersList?: MemberOption[];
}

const CATEGORIAS_DISPONIVEIS = ['Utilidades', 'Aluguel', 'Mercado', 'Limpeza', 'Outros'];

/**
 * Retorna a data atual no formato YYYY-MM-DD para compatibilidade com o banco.
 */
const getDefaultDueDate = (): string => {
    const today = new Date();
    today.setDate(today.getDate() + 7); // vencimento padrão em 7 dias
    return today.toISOString().split('T')[0];
};

/**
 * Tela de criação e rateio de nova despesa coletiva (Tela 15).
 * Permite definir valor, descrição, pagador responsável, data de vencimento e modalidade de divisão (igualitária, personalizada ou percentual).
 *
 * @param props Callbacks de cancelamento/retorno e submissão.
 */
export const NewExpenseScreen: React.FC<NewExpenseScreenProps> = ({
    onBackPress,
    onSubmitPress,
    membersList = [],
}) => {
    const { user, profile } = useAuth();
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Utilidades');
    const [dueDate, setDueDate] = useState(getDefaultDueDate());
    const [divisionType, setDivisionType] = useState<'igualitaria' | 'porcentagem' | 'fixo'>('igualitaria');
    const [payer, setPayer] = useState<'voce' | 'outro'>('voce');
    const [selectedOtherPayerId, setSelectedOtherPayerId] = useState<string>(
        membersList.length > 0 ? membersList[0].id : ''
    );

    const [modalCategoryVisible, setModalCategoryVisible] = useState(false);
    const [modalPayerVisible, setModalPayerVisible] = useState(false);

    const handleFormSubmit = () => {
        if (!description.trim()) {
            Alert.alert('Atenção', 'Por favor, informe a descrição ou título da despesa.');
            return;
        }

        // Sanitizar valor: substituir vírgula por ponto
        const sanitizedValue = value.replace(/\./g, '').replace(',', '.');
        const numericVal = parseFloat(sanitizedValue);

        if (isNaN(numericVal) || numericVal <= 0) {
            Alert.alert('Atenção', 'Informe um valor financeiro válido maior que zero.');
            return;
        }

        const pagadorFinalId = payer === 'voce' ? (user?.id || '') : (selectedOtherPayerId || user?.id || '');

        if (!pagadorFinalId) {
            Alert.alert('Atenção', 'Não foi possível identificar o pagador responsável.');
            return;
        }

        if (onSubmitPress) {
            onSubmitPress({
                title: description.trim(),
                amount: numericVal,
                category,
                dueDate,
                divisionType,
                payerId: pagadorFinalId,
            });
        }
    };

    const selectedOtherName =
        membersList.find((m) => m.id === selectedOtherPayerId)?.name || 'Outro morador';

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
                            placeholder="0,00"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.cardInput}>
                    <Text style={styles.labelTitle}>DESCRIÇÃO</Text>
                    <TextInput
                        style={styles.textInputDesc}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Ex: Aluguel, Mercado, Internet, etc."
                        placeholderTextColor={Colors.textSecondary}
                    />
                </View>

                <View style={styles.rowCards}>
                    <TouchableOpacity
                        style={[styles.cardInput, styles.flexCard]}
                        onPress={() => setModalCategoryVisible(true)}
                    >
                        <Text style={styles.labelTitle}>CATEGORIA</Text>
                        <View style={styles.categoryRow}>
                            <View style={styles.categoryDot} />
                            <Text style={styles.categoryText}>{category}</Text>
                            <Feather name="chevron-down" size={14} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
                        </View>
                    </TouchableOpacity>

                    <View style={[styles.cardInput, styles.flexCard]}>
                        <Text style={styles.labelTitle}>VENCIMENTO</Text>
                        <View style={styles.categoryRow}>
                            <Feather name="calendar" size={14} color={Colors.textSecondary} />
                            <TextInput
                                style={styles.dateInput}
                                value={dueDate}
                                onChangeText={setDueDate}
                                placeholder="AAAA-MM-DD"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.cardInput}>
                    <Text style={styles.labelTitle}>QUEM PAGOU A CONTA?</Text>
                    <View style={styles.payerButtonsRow}>
                        <TouchableOpacity
                            style={[styles.payerBtn, payer === 'voce' && styles.payerBtnActive]}
                            onPress={() => setPayer('voce')}
                        >
                            <Text style={[styles.payerBtnText, payer === 'voce' && styles.payerBtnTextActive]}>
                                {profile?.nome_completo ? `${profile.nome_completo} (Você)` : 'Você'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.payerBtn, payer === 'outro' && styles.payerBtnActive]}
                            onPress={() => {
                                setPayer('outro');
                                if (membersList.length > 0) setModalPayerVisible(true);
                            }}
                        >
                            <Text style={[styles.payerBtnText, payer === 'outro' && styles.payerBtnTextActive]} numberOfLines={1}>
                                {payer === 'outro' && selectedOtherName !== 'Outro morador' ? selectedOtherName : 'Outro morador'}
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
                        <Text style={styles.divisionResultText}>Dividir com todos os moradores</Text>
                        <Text style={styles.divisionResultValue}>Rateio proporcional</Text>
                    </View>
                    <Text style={styles.divisionMembersText}>A despesa será dividida igualmente entre os membros ativos da moradia.</Text>
                </View>

                <TouchableOpacity style={styles.attachCard} onPress={() => Alert.alert('Comprovante', 'O envio de comprovante em imagem/PDF estará disponível na versão web/storage.')}>
                    <View style={styles.attachIconBox}>
                        <Feather name="image" size={16} color={Colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.attachTitle}>Anexar Comprovante</Text>
                        <Text style={styles.attachSubtitle}>Foto da nota fiscal ou boleto</Text>
                    </View>
                    <Text style={styles.attachAddText}>+ Adicionar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
                    <Text style={styles.submitButtonText}>Cadastrar despesa</Text>
                    <Feather name="check" size={18} color={Colors.white} />
                </TouchableOpacity>
            </ScrollView>

            {/* Modal de Seleção de Categoria */}
            <Modal visible={modalCategoryVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecione a Categoria</Text>
                        {CATEGORIAS_DISPONIVEIS.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.modalItem, category === cat && styles.modalItemActive]}
                                onPress={() => {
                                    setCategory(cat);
                                    setModalCategoryVisible(false);
                                }}
                            >
                                <Text style={[styles.modalItemText, category === cat && styles.modalItemTextActive]}>
                                    {cat}
                                </Text>
                                {category === cat && <Feather name="check" size={16} color={Colors.primary} />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setModalCategoryVisible(false)}
                        >
                            <Text style={styles.modalCloseBtnText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de Seleção de Pagador (Outro Morador) */}
            <Modal visible={modalPayerVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Quem realizou o pagamento?</Text>
                        {membersList.length === 0 ? (
                            <Text style={{ color: Colors.textSecondary, marginVertical: 12, textAlign: 'center' }}>
                                Nenhum outro morador encontrado na moradia.
                            </Text>
                        ) : (
                            membersList.map((m) => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[styles.modalItem, selectedOtherPayerId === m.id && styles.modalItemActive]}
                                    onPress={() => {
                                        setSelectedOtherPayerId(m.id);
                                        setModalPayerVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, selectedOtherPayerId === m.id && styles.modalItemTextActive]}>
                                        {m.name}
                                    </Text>
                                    {selectedOtherPayerId === m.id && <Feather name="check" size={16} color={Colors.primary} />}
                                </TouchableOpacity>
                            ))
                        )}
                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setModalPayerVisible(false)}
                        >
                            <Text style={styles.modalCloseBtnText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    valueInput: { fontSize: 32, fontWeight: 'bold', color: Colors.text, padding: 0, flex: 1 },
    textInputDesc: { fontSize: 15, fontWeight: '600', color: Colors.text },
    rowCards: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    flexCard: { flex: 1, marginBottom: 0 },
    categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    categoryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
    categoryText: { fontSize: 13, fontWeight: '600', color: Colors.text },
    dateInput: { fontSize: 12, fontWeight: '600', color: Colors.text, padding: 0, flex: 1 },
    payerButtonsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    payerBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 20, backgroundColor: '#FAF8FC', alignItems: 'center' },
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
    submitButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalItemActive: { backgroundColor: 'rgba(94, 43, 151, 0.05)' },
    modalItemText: { fontSize: 14, color: Colors.text },
    modalItemTextActive: { color: Colors.primary, fontWeight: 'bold' },
    modalCloseBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
    modalCloseBtnText: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },
});
