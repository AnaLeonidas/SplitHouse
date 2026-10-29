import React, { useState, useEffect, useMemo } from 'react';
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
    Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { pickImageWithPrompt } from '../../services/storageService';

/**
 * Representação da fração de rateio individual de um morador na despesa.
 */
export interface MemberSplitItem {
    userId: string;
    amount: number;
    percentage?: number;
}

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
    /** URI local do comprovante anexado (enviado ao Storage pelo App) */
    receiptUri?: string | null;
    /** Divisão discriminada por morador participante */
    splits?: MemberSplitItem[];
}

/**
 * Opção de morador para atribuição de pagador e participante do rateio.
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
    onSubmitPress?: (data: ExpenseFormData) => void | Promise<void>;
    /** Lista de membros da república para seleção do pagador e rateio */
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
 * Formata número no padrão monetário brasileiro.
 */
const formatBRL = (val: number): string => {
    return Number(val || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Tela de criação e rateio de nova despesa coletiva.
 * Permite definir valor, descrição, pagador responsável, data de vencimento e
 * modalidade de divisão totalmente interativa (igualitária com seleção de moradores,
 * por porcentagem customizada ou por valor fixo em R$).
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
    const [selectedOtherPayerId, setSelectedOtherPayerId] = useState<string>('');

    const [modalCategoryVisible, setModalCategoryVisible] = useState(false);
    const [modalPayerVisible, setModalPayerVisible] = useState(false);
    const [receiptUri, setReceiptUri] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Lista consolidada de membros incluindo o usuário logado
    const effectiveMembers = useMemo(() => {
        const list = [...membersList];
        if (user?.id && !list.some((m) => m.id === user.id)) {
            list.unshift({
                id: user.id,
                name: profile?.nome_completo ? `${profile.nome_completo} (Você)` : 'Você',
            });
        }
        return list;
    }, [membersList, user?.id, profile?.nome_completo]);

    // Participantes para divisão igualitária (default: todos selecionados)
    const [selectedEqualMembers, setSelectedEqualMembers] = useState<string[]>([]);

    // Valores para porcentagem (id -> string de %)
    const [percentages, setPercentages] = useState<{ [id: string]: string }>({});

    // Valores para divisão fixa (id -> string de R$)
    const [fixedAmounts, setFixedAmounts] = useState<{ [id: string]: string }>({});

    // Inicializa moradores e valores padrão quando effectiveMembers mudar
    useEffect(() => {
        if (effectiveMembers.length > 0) {
            setSelectedEqualMembers(effectiveMembers.map((m) => m.id));
            if (!selectedOtherPayerId) {
                const other = effectiveMembers.find((m) => m.id !== user?.id);
                if (other) setSelectedOtherPayerId(other.id);
            }
        }
    }, [effectiveMembers, user?.id]);

    // Valor numérico digitado no campo principal
    const numericTotal = useMemo(() => {
        const sanitized = value.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(sanitized);
        return isNaN(num) || num < 0 ? 0 : num;
    }, [value]);

    // Distribuir porcentagens igualmente entre todos os membros
    const handleDistributePercentagesEqually = () => {
        if (effectiveMembers.length === 0) return;
        const count = effectiveMembers.length;
        const base = Math.floor((100 / count) * 100) / 100;
        const remainder = parseFloat((100 - base * count).toFixed(2));
        const newPct: { [id: string]: string } = {};
        effectiveMembers.forEach((m, idx) => {
            const val = idx === 0 ? base + remainder : base;
            newPct[m.id] = val.toFixed(2).replace('.', ',');
        });
        setPercentages(newPct);
    };

    // Distribuir valor fixo igualmente entre todos os membros
    const handleDistributeFixedEqually = () => {
        if (effectiveMembers.length === 0 || numericTotal <= 0) return;
        const count = effectiveMembers.length;
        const base = Math.floor((numericTotal / count) * 100) / 100;
        const remainder = parseFloat((numericTotal - base * count).toFixed(2));
        const newFixed: { [id: string]: string } = {};
        effectiveMembers.forEach((m, idx) => {
            const val = idx === 0 ? base + remainder : base;
            newFixed[m.id] = val.toFixed(2).replace('.', ',');
        });
        setFixedAmounts(newFixed);
    };

    // Total de porcentagem somada
    const totalPercentageSum = useMemo(() => {
        let sum = 0;
        effectiveMembers.forEach((m) => {
            const raw = (percentages[m.id] || '').replace(',', '.');
            const num = parseFloat(raw);
            if (!isNaN(num) && num > 0) sum += num;
        });
        return parseFloat(sum.toFixed(2));
    }, [percentages, effectiveMembers]);

    // Total de valor fixo somado
    const totalFixedSum = useMemo(() => {
        let sum = 0;
        effectiveMembers.forEach((m) => {
            const raw = (fixedAmounts[m.id] || '').replace(/\./g, '').replace(',', '.');
            const num = parseFloat(raw);
            if (!isNaN(num) && num > 0) sum += num;
        });
        return parseFloat(sum.toFixed(2));
    }, [fixedAmounts, effectiveMembers]);

    // Alternar morador na divisão igualitária
    const toggleEqualMember = (memberId: string) => {
        setSelectedEqualMembers((prev) => {
            if (prev.includes(memberId)) {
                if (prev.length === 1) {
                    Alert.alert('Atenção', 'A despesa precisa ter ao menos um morador participante.');
                    return prev;
                }
                return prev.filter((id) => id !== memberId);
            }
            return [...prev, memberId];
        });
    };

    /** Aceita AAAA-MM-DD ou DD/MM/AAAA e devolve AAAA-MM-DD (ou null se inválida). */
    const normalizeDate = (raw: string): string | null => {
        const v = raw.trim();
        let y: number, m: number, d: number;
        let match = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
            y = +match[1]; m = +match[2]; d = +match[3];
        } else if ((match = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/))) {
            d = +match[1]; m = +match[2]; y = +match[3];
        } else {
            return null;
        }
        const dt = new Date(y, m - 1, d);
        if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const handleAttach = async () => {
        const uri = await pickImageWithPrompt('Anexar comprovante');
        if (uri) setReceiptUri(uri);
    };

    const handleFormSubmit = async () => {
        if (submitting) return;

        if (!description.trim()) {
            Alert.alert('Atenção', 'Por favor, informe a descrição ou título da despesa.');
            return;
        }

        if (numericTotal <= 0) {
            Alert.alert('Atenção', 'Informe um valor financeiro válido maior que zero.');
            return;
        }

        const pagadorFinalId = payer === 'voce' ? (user?.id || '') : (selectedOtherPayerId || user?.id || '');
        if (!pagadorFinalId) {
            Alert.alert('Atenção', 'Não foi possível identificar o pagador responsável.');
            return;
        }

        const normalizedDate = dueDate.trim() ? normalizeDate(dueDate) : null;
        if (dueDate.trim() && !normalizedDate) {
            Alert.alert('Atenção', 'Informe o vencimento no formato AAAA-MM-DD ou DD/MM/AAAA.');
            return;
        }

        // Validação e cálculo das frações conforme o tipo de divisão escolhido
        let splits: MemberSplitItem[] = [];

        if (divisionType === 'igualitaria') {
            if (selectedEqualMembers.length === 0) {
                Alert.alert('Atenção', 'Selecione ao menos um morador para a divisão da despesa.');
                return;
            }
            const count = selectedEqualMembers.length;
            const basePart = Math.floor((numericTotal / count) * 100) / 100;
            const remainder = parseFloat((numericTotal - basePart * count).toFixed(2));

            splits = selectedEqualMembers.map((userId, index) => {
                const individualAmount = index === 0 ? basePart + remainder : basePart;
                return {
                    userId,
                    amount: parseFloat(individualAmount.toFixed(2)),
                };
            });
        } else if (divisionType === 'porcentagem') {
            if (Math.abs(totalPercentageSum - 100) > 0.1) {
                Alert.alert(
                    'Porcentagem incompleta',
                    `A soma de todas as porcentagens deve ser exatamente 100%.\nAtualmente a soma está em ${totalPercentageSum.toFixed(2)}%.`
                );
                return;
            }

            let calculatedSum = 0;
            splits = effectiveMembers
                .map((m) => {
                    const raw = (percentages[m.id] || '').replace(',', '.');
                    const pct = parseFloat(raw) || 0;
                    const calculatedAmount = parseFloat(((numericTotal * pct) / 100).toFixed(2));
                    calculatedSum += calculatedAmount;
                    return {
                        userId: m.id,
                        amount: calculatedAmount,
                        percentage: pct,
                    };
                })
                .filter((s) => s.amount > 0 || (s.percentage || 0) > 0);

            // Ajuste de centavo decorrente de arredondamento
            const diff = parseFloat((numericTotal - calculatedSum).toFixed(2));
            if (diff !== 0 && splits.length > 0) {
                splits[0].amount = parseFloat((splits[0].amount + diff).toFixed(2));
            }
        } else if (divisionType === 'fixo') {
            if (Math.abs(totalFixedSum - numericTotal) > 0.05) {
                Alert.alert(
                    'Valores não conferem',
                    `A soma dos valores individuais (R$ ${formatBRL(totalFixedSum)}) deve ser igual ao valor total da conta (R$ ${formatBRL(numericTotal)}).\nDiferença: R$ ${formatBRL(Math.abs(numericTotal - totalFixedSum))}.`
                );
                return;
            }

            splits = effectiveMembers
                .map((m) => {
                    const raw = (fixedAmounts[m.id] || '').replace(/\./g, '').replace(',', '.');
                    const num = parseFloat(raw) || 0;
                    return {
                        userId: m.id,
                        amount: parseFloat(num.toFixed(2)),
                    };
                })
                .filter((s) => s.amount > 0);
        }

        if (splits.length === 0) {
            Alert.alert('Atenção', 'Nenhum morador foi atribuído a esta despesa.');
            return;
        }

        if (onSubmitPress) {
            try {
                setSubmitting(true);
                await onSubmitPress({
                    title: description.trim(),
                    amount: numericTotal,
                    category,
                    dueDate: normalizedDate,
                    divisionType,
                    payerId: pagadorFinalId,
                    receiptUri,
                    splits,
                });
            } finally {
                setSubmitting(false);
            }
        }
    };

    const selectedOtherName =
        effectiveMembers.find((m) => m.id === selectedOtherPayerId)?.name || 'Outro morador';

    const equalPerPerson =
        selectedEqualMembers.length > 0 && numericTotal > 0
            ? numericTotal / selectedEqualMembers.length
            : 0;

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

                {/* VALOR */}
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

                {/* DESCRIÇÃO */}
                <View style={styles.cardInput}>
                    <Text style={styles.labelTitle}>DESCRIÇÃO</Text>
                    <TextInput
                        style={styles.textInputDesc}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Ex: Aluguel, Mercado, Luz, Internet..."
                        placeholderTextColor={Colors.textSecondary}
                    />
                </View>

                {/* CATEGORIA E VENCIMENTO */}
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

                {/* QUEM PAGOU */}
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
                                if (effectiveMembers.length > 0) setModalPayerVisible(true);
                            }}
                        >
                            <Text style={[styles.payerBtnText, payer === 'outro' && styles.payerBtnTextActive]} numberOfLines={1}>
                                {payer === 'outro' && selectedOtherName !== 'Outro morador' ? selectedOtherName : 'Outro morador'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* COMO SERÁ A DIVISÃO? */}
                <View style={styles.cardInput}>
                    <Text style={styles.labelTitle}>COMO SERÁ A DIVISÃO?</Text>
                    <View style={styles.divisionTabs}>
                        <TouchableOpacity
                            style={[styles.divTab, divisionType === 'igualitaria' && styles.divTabActive]}
                            onPress={() => setDivisionType('igualitaria')}
                        >
                            <Text style={[styles.divTabText, divisionType === 'igualitaria' && styles.divTabTextActive]}>
                                Igualitária
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.divTab, divisionType === 'porcentagem' && styles.divTabActive]}
                            onPress={() => {
                                setDivisionType('porcentagem');
                                if (Object.keys(percentages).length === 0) {
                                    handleDistributePercentagesEqually();
                                }
                            }}
                        >
                            <Text style={[styles.divTabText, divisionType === 'porcentagem' && styles.divTabTextActive]}>
                                Porcentagem
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.divTab, divisionType === 'fixo' && styles.divTabActive]}
                            onPress={() => {
                                setDivisionType('fixo');
                                if (Object.keys(fixedAmounts).length === 0 && numericTotal > 0) {
                                    handleDistributeFixedEqually();
                                }
                            }}
                        >
                            <Text style={[styles.divTabText, divisionType === 'fixo' && styles.divTabTextActive]}>
                                Valor Fixo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* MODALIDADE 1: IGUALITÁRIA */}
                    {divisionType === 'igualitaria' && (
                        <View style={styles.divisionContainer}>
                            <View style={styles.divisionHeaderRow}>
                                <Text style={styles.divisionSectionTitle}>
                                    Selecione os participantes ({selectedEqualMembers.length} de {effectiveMembers.length}):
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (selectedEqualMembers.length === effectiveMembers.length) {
                                            if (user?.id) setSelectedEqualMembers([user.id]);
                                        } else {
                                            setSelectedEqualMembers(effectiveMembers.map((m) => m.id));
                                        }
                                    }}
                                >
                                    <Text style={styles.divisionActionLink}>
                                        {selectedEqualMembers.length === effectiveMembers.length ? 'Desmarcar' : 'Todos'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.membersCheckboxList}>
                                {effectiveMembers.map((m) => {
                                    const isSelected = selectedEqualMembers.includes(m.id);
                                    return (
                                        <TouchableOpacity
                                            key={m.id}
                                            style={[styles.memberRow, isSelected && styles.memberRowSelected]}
                                            activeOpacity={0.7}
                                            onPress={() => toggleEqualMember(m.id)}
                                        >
                                            <View style={[styles.checkboxBox, isSelected && styles.checkboxBoxActive]}>
                                                {isSelected && <Feather name="check" size={14} color={Colors.white} />}
                                            </View>
                                            <Text style={[styles.memberNameText, isSelected && styles.memberNameTextSelected]}>
                                                {m.name}
                                            </Text>
                                            <Text style={[styles.memberShareAmount, !isSelected && styles.memberShareAmountDisabled]}>
                                                {isSelected ? `R$ ${formatBRL(equalPerPerson)}` : 'Não participa'}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View style={styles.divisionSummaryBox}>
                                <Feather name="pie-chart" size={16} color={Colors.primary} />
                                <Text style={styles.divisionSummaryText}>
                                    {selectedEqualMembers.length} pessoas • <Text style={{ fontWeight: 'bold' }}>R$ {formatBRL(equalPerPerson)}</Text> por morador
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* MODALIDADE 2: PORCENTAGEM */}
                    {divisionType === 'porcentagem' && (
                        <View style={styles.divisionContainer}>
                            <View style={styles.divisionHeaderRow}>
                                <Text style={styles.divisionSectionTitle}>Defina a porcentagem de cada um:</Text>
                                <TouchableOpacity
                                    style={styles.distributeBtn}
                                    onPress={handleDistributePercentagesEqually}
                                >
                                    <Feather name="sliders" size={12} color={Colors.primary} />
                                    <Text style={styles.distributeBtnText}>Dividir igualmente</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.membersInputList}>
                                {effectiveMembers.map((m) => {
                                    const pctStr = percentages[m.id] || '';
                                    const pctNum = parseFloat(pctStr.replace(',', '.')) || 0;
                                    const calculatedAmount = (numericTotal * pctNum) / 100;

                                    return (
                                        <View key={m.id} style={styles.memberInputRow}>
                                            <Text style={styles.memberInputName} numberOfLines={1}>
                                                {m.name}
                                            </Text>

                                            <View style={styles.pctInputWrapper}>
                                                <TextInput
                                                    style={styles.pctTextInput}
                                                    value={pctStr}
                                                    onChangeText={(txt) => {
                                                        setPercentages((prev) => ({ ...prev, [m.id]: txt }));
                                                    }}
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                />
                                                <Text style={styles.pctSymbol}>%</Text>
                                            </View>

                                            <Text style={styles.calculatedShareText}>
                                                R$ {formatBRL(calculatedAmount)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Status da soma de porcentagem */}
                            <View
                                style={[
                                    styles.validationBadge,
                                    Math.abs(totalPercentageSum - 100) < 0.1
                                        ? styles.validationBadgeSuccess
                                        : styles.validationBadgeWarning,
                                ]}
                            >
                                <Feather
                                    name={Math.abs(totalPercentageSum - 100) < 0.1 ? 'check-circle' : 'alert-circle'}
                                    size={14}
                                    color={Math.abs(totalPercentageSum - 100) < 0.1 ? Colors.success : Colors.danger}
                                />
                                <Text
                                    style={[
                                        styles.validationBadgeText,
                                        Math.abs(totalPercentageSum - 100) < 0.1
                                            ? { color: Colors.success }
                                            : { color: Colors.danger },
                                    ]}
                                >
                                    {Math.abs(totalPercentageSum - 100) < 0.1
                                        ? 'Total: 100% (distribuição completa)'
                                        : `Soma atual: ${totalPercentageSum.toFixed(1)}% de 100% (${totalPercentageSum < 100 ? `faltam ${(100 - totalPercentageSum).toFixed(1)}%` : `excedeu ${(totalPercentageSum - 100).toFixed(1)}%`})`}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* MODALIDADE 3: VALOR FIXO */}
                    {divisionType === 'fixo' && (
                        <View style={styles.divisionContainer}>
                            <View style={styles.divisionHeaderRow}>
                                <Text style={styles.divisionSectionTitle}>Defina o valor em R$ de cada um:</Text>
                                <TouchableOpacity
                                    style={styles.distributeBtn}
                                    onPress={handleDistributeFixedEqually}
                                >
                                    <Feather name="sliders" size={12} color={Colors.primary} />
                                    <Text style={styles.distributeBtnText}>Dividir igualmente</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.membersInputList}>
                                {effectiveMembers.map((m) => {
                                    const fixStr = fixedAmounts[m.id] || '';

                                    return (
                                        <View key={m.id} style={styles.memberInputRow}>
                                            <Text style={styles.memberInputName} numberOfLines={1}>
                                                {m.name}
                                            </Text>

                                            <View style={styles.fixedInputWrapper}>
                                                <Text style={styles.fixedCurrencyPrefix}>R$</Text>
                                                <TextInput
                                                    style={styles.fixedTextInput}
                                                    value={fixStr}
                                                    onChangeText={(txt) => {
                                                        setFixedAmounts((prev) => ({ ...prev, [m.id]: txt }));
                                                    }}
                                                    placeholder="0,00"
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Status da soma de valores fixos */}
                            <View
                                style={[
                                    styles.validationBadge,
                                    Math.abs(totalFixedSum - numericTotal) < 0.05 && numericTotal > 0
                                        ? styles.validationBadgeSuccess
                                        : styles.validationBadgeWarning,
                                ]}
                            >
                                <Feather
                                    name={
                                        Math.abs(totalFixedSum - numericTotal) < 0.05 && numericTotal > 0
                                            ? 'check-circle'
                                            : 'alert-circle'
                                    }
                                    size={14}
                                    color={
                                        Math.abs(totalFixedSum - numericTotal) < 0.05 && numericTotal > 0
                                            ? Colors.success
                                            : Colors.danger
                                    }
                                />
                                <Text
                                    style={[
                                        styles.validationBadgeText,
                                        Math.abs(totalFixedSum - numericTotal) < 0.05 && numericTotal > 0
                                            ? { color: Colors.success }
                                            : { color: Colors.danger },
                                    ]}
                                >
                                    {Math.abs(totalFixedSum - numericTotal) < 0.05 && numericTotal > 0
                                        ? `Total conferido: R$ ${formatBRL(totalFixedSum)}`
                                        : `Distribuído R$ ${formatBRL(totalFixedSum)} de R$ ${formatBRL(numericTotal)} (${totalFixedSum < numericTotal ? `restam R$ ${formatBRL(numericTotal - totalFixedSum)}` : `passou R$ ${formatBRL(totalFixedSum - numericTotal)}`})`}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* ANEXAR COMPROVANTE */}
                <TouchableOpacity style={styles.attachCard} onPress={handleAttach}>
                    {receiptUri ? (
                        <Image source={{ uri: receiptUri }} style={styles.attachThumb} />
                    ) : (
                        <View style={styles.attachIconBox}>
                            <Feather name="image" size={16} color={Colors.textSecondary} />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.attachTitle}>
                            {receiptUri ? 'Comprovante anexado' : 'Anexar Comprovante'}
                        </Text>
                        <Text style={styles.attachSubtitle}>
                            {receiptUri ? 'Toque para trocar a imagem' : 'Foto da nota fiscal ou boleto (opcional)'}
                        </Text>
                    </View>
                    <Text style={styles.attachAddText}>{receiptUri ? 'Trocar' : '+ Adicionar'}</Text>
                </TouchableOpacity>

                {/* BOTÃO CADASTRAR */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                    disabled={submitting}
                    onPress={handleFormSubmit}
                >
                    <Text style={styles.submitButtonText}>{submitting ? 'Cadastrando...' : 'Cadastrar despesa'}</Text>
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
                        {effectiveMembers.filter((m) => m.id !== user?.id).length === 0 ? (
                            <Text style={{ color: Colors.textSecondary, marginVertical: 12, textAlign: 'center' }}>
                                Nenhum outro morador encontrado na moradia.
                            </Text>
                        ) : (
                            effectiveMembers
                                .filter((m) => m.id !== user?.id)
                                .map((m) => (
                                    <TouchableOpacity
                                        key={m.id}
                                        style={[styles.modalItem, selectedOtherPayerId === m.id && styles.modalItemActive]}
                                        onPress={() => {
                                            setSelectedOtherPayerId(m.id);
                                            setModalPayerVisible(false);
                                        }}
                                    >
                                        <Text
                                            style={[styles.modalItemText, selectedOtherPayerId === m.id && styles.modalItemTextActive]}
                                        >
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 48,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
    cardInput: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(132, 130, 143, 0.15)',
        marginBottom: 12,
    },
    labelTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textSecondary,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
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
    payerBtn: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 20,
        backgroundColor: '#FAF8FC',
        alignItems: 'center',
    },
    payerBtnActive: { backgroundColor: Colors.primary },
    payerBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
    payerBtnTextActive: { color: Colors.white },
    divisionTabs: {
        flexDirection: 'row',
        backgroundColor: '#FAF8FC',
        borderRadius: 10,
        padding: 4,
        marginBottom: 16,
    },
    divTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    divTabActive: {
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    divTabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
    divTabTextActive: { color: Colors.primary },
    divisionContainer: { marginTop: 4 },
    divisionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    divisionSectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.text },
    divisionActionLink: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    distributeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: 'rgba(94, 43, 151, 0.08)',
    },
    distributeBtnText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
    membersCheckboxList: { gap: 8, marginBottom: 12 },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F9F9FB',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    memberRowSelected: {
        backgroundColor: '#FAF5FC',
        borderColor: 'rgba(94, 43, 151, 0.25)',
    },
    checkboxBox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#C5C5CE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: Colors.white,
    },
    checkboxBoxActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    memberNameText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, flex: 1 },
    memberNameTextSelected: { color: Colors.text, fontWeight: '700' },
    memberShareAmount: { fontSize: 13, fontWeight: '700', color: Colors.primary },
    memberShareAmountDisabled: { fontSize: 11, color: '#A0A0A0', fontWeight: 'normal' },
    divisionSummaryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(94, 43, 151, 0.06)',
        padding: 10,
        borderRadius: 10,
    },
    divisionSummaryText: { fontSize: 12, color: Colors.text },
    membersInputList: { gap: 8, marginBottom: 12 },
    memberInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#F9F9FB',
        borderRadius: 10,
    },
    memberInputName: { fontSize: 13, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 8 },
    pctInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E2EA',
        paddingHorizontal: 8,
        width: 72,
        height: 36,
    },
    pctTextInput: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text, padding: 0, textAlign: 'right' },
    pctSymbol: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginLeft: 2 },
    calculatedShareText: { width: 90, textAlign: 'right', fontSize: 12, fontWeight: '700', color: Colors.primary },
    fixedInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E2EA',
        paddingHorizontal: 8,
        width: 120,
        height: 36,
    },
    fixedCurrencyPrefix: { fontSize: 12, fontWeight: '700', color: Colors.primary, marginRight: 4 },
    fixedTextInput: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text, padding: 0 },
    validationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    validationBadgeSuccess: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
    validationBadgeWarning: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    validationBadgeText: { fontSize: 11, fontWeight: '700' },
    attachCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(94, 43, 151, 0.3)',
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    attachIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(132, 130, 143, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    attachThumb: { width: 40, height: 40, borderRadius: 12, marginRight: 12 },
    attachTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.text },
    attachSubtitle: { fontSize: 10, color: Colors.textSecondary },
    attachAddText: { fontSize: 13, fontWeight: 'bold', color: Colors.primary },
    submitButton: {
        backgroundColor: Colors.primary,
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalItemActive: { backgroundColor: 'rgba(94, 43, 151, 0.05)' },
    modalItemText: { fontSize: 14, color: Colors.text },
    modalItemTextActive: { color: Colors.primary, fontWeight: 'bold' },
    modalCloseBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
    modalCloseBtnText: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },
});
