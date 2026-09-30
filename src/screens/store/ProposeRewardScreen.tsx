import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import { Colors } from '../../constants/theme';

/**
 * Propriedades e callbacks do formulário de proposição de nova recompensa.
 */
interface ProposeRewardScreenProps {
  /** Callback para voltar à loja de recompensas */
  onBackPress?: () => void;
  /** Callback executado após submissão bem-sucedida da proposta */
  onSubmitSuccess?: () => void;
}

/**
 * Categorias disponíveis para classificação de uma recompensa proposta.
 */
type RewardCategory = 'Convivência' | 'Folga de tarefa' | 'Bônus coletivo' | 'Outros';

/**
 * Tela de proposição de nova recompensa para a loja da república (Tela 28).
 * Permite a qualquer morador sugerir um novo benefício coletivo com categoria, custo em moedas e limite por ciclo.
 *
 * @param props Handlers para retorno e conclusão do envio da proposta.
 */
export const ProposeRewardScreen: React.FC<ProposeRewardScreenProps> = ({
  onBackPress,
  onSubmitSuccess,
}) => {
  const [title, setTitle] = useState('Escolha da playlist da faxina');
  const [category, setCategory] = useState<RewardCategory>('Convivência');
  const [cost, setCost] = useState('75');
  const [limit, setLimit] = useState('3 resgates por ciclo');
  const [description, setDescription] = useState(
    'Direito exclusivo de conectar o celular na caixa de som durante as 2 horas da faxina coletiva de sábado, sem vetos do grupo.'
  );

  const categories: RewardCategory[] = [
    'Convivência',
    'Folga de tarefa',
    'Bônus coletivo',
    'Outros',
  ];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'Informe o título da recompensa.');
      return;
    }
    if (!cost.trim() || isNaN(Number(cost))) {
      Alert.alert('Atenção', 'Informe um valor válido em moedas.');
      return;
    }

    Alert.alert(
      'Recompensa Proposta!',
      `A recompensa "${title}" foi enviada para votação dos moradores da república.`,
      [
        {
          text: 'OK',
          onPress: () => {
            if (onSubmitSuccess) {
              onSubmitSuccess();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop}>
        <Svg width="340" height="340" viewBox="0 0 340 340">
          <Defs>
            <RadialGradient
              id="proposeGlow"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor="#5E2B97" stopOpacity="0.12" />
              <Stop offset="50%" stopColor="#CC92C2" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#FCFCFC" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="340" height="340" fill="url(#proposeGlow)" />
        </Svg>
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={onBackPress}
        >
          <Feather name="chevron-left" size={22} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Propor Recompensa</Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label}>TÍTULO DA RECOMPENSA</Text>
          <TextInput
            style={styles.textInputBold}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Isenção de tirar o lixo"
            placeholderTextColor="#84828F"
          />

          <View style={styles.divider} />

          <Text style={styles.label}>CATEGORIA</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    isSelected && styles.categoryPillActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      isSelected && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>CUSTO (MOEDAS DA CASA)</Text>
          <View style={styles.costInputRow}>
            <View style={styles.coinIconContainer}>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="9" fill="#CC92C2" fillOpacity="0.4" stroke="#CC92C2" strokeWidth="2.2" />
                <Circle cx="12" cy="12" r="4.5" stroke="#CC92C2" strokeWidth="2.2" />
              </Svg>
            </View>
            <TextInput
              style={styles.costInput}
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
              placeholder="75"
              placeholderTextColor="#84828F"
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>LIMITE MENSAL</Text>
          <TextInput
            style={styles.textInputRegular}
            value={limit}
            onChangeText={setLimit}
            placeholder="Ex: 2 resgates por mês"
            placeholderTextColor="#84828F"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>DESCRIÇÃO E REGRAS DE USO</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="Explique os termos combinados para o benefício..."
            placeholderTextColor="#84828F"
            textAlignVertical="top"
          />
        </View>

        <View style={styles.infoBox}>
          <Feather name="info" size={17} color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            <Text style={styles.infoTextBold}>Aprovação coletiva: </Text>
            Recompensas propostas ficam ativas na loja após validação pelos moradores da república.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.8}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Publicar recompensa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 44,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 340,
    height: 340,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D2D2A',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#84828F',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInputBold: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D2D2A',
    paddingVertical: 4,
  },
  textInputRegular: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D2A',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(132, 130, 143, 0.15)',
    marginVertical: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.3)',
  },
  categoryPillActive: {
    backgroundColor: '#5E2B97',
    borderColor: '#5E2B97',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#84828F',
  },
  categoryPillTextActive: {
    color: '#FCFCFC',
    fontWeight: '700',
  },
  costInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(204, 146, 194, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  costInput: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D2D2A',
    flex: 1,
  },
  textArea: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2D2D2A',
    lineHeight: 20,
    minHeight: 80,
    paddingTop: 4,
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoText: {
    fontSize: 12,
    color: '#84828F',
    lineHeight: 18,
    flex: 1,
  },
  infoTextBold: {
    color: '#2D2D2A',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(252, 252, 252, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(132, 130, 143, 0.2)',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 36 : 24,
  },
  submitButton: {
    backgroundColor: '#5E2B97',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#5E2B97',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FCFCFC',
  },
});
