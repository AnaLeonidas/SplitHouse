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
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';

/**
 * Propriedades e callbacks da tela de edição do estatuto da república.
 */
interface EditHouseRulesScreenProps {
  /** Nome da república */
  republicName?: string;
  /** Callback para voltar à visualização de regras */
  onBackPress?: () => void;
  /** Callback executado após a gravação das novas regras da casa */
  onSaveSuccess?: () => void;
}

/**
 * Tela de edição e atualização das regras de convivência da república (Tela 31).
 * Permite ao morador administrador atualizar horários de silêncio, política de visitas, tolerância de tarefas e inadimplência.
 *
 * @param props Handlers para retorno e salvamento do estatuto revisado.
 */
export const EditHouseRulesScreen: React.FC<EditHouseRulesScreenProps> = ({
  republicName = 'República do Sexteto Sinistro',
  onBackPress,
  onSaveSuccess,
}) => {
  const [silenceHighlight, setSilenceHighlight] = useState(
    '22h00 às 08h00 (dias úteis) • 00h00 aos fins de semana'
  );
  const [silenceDesc, setSilenceDesc] = useState(
    'Música alta e conversa em volume elevado nas áreas compartilhadas (sala e varanda) são vedados após o horário limite.'
  );

  const [guestsHighlight, setGuestsHighlight] = useState(
    'Aviso prévio de 24h no grupo da república'
  );
  const [guestsDesc, setGuestsDesc] = useState(
    'Hóspedes podem pernoitar por até 2 noites seguidas. Períodos maiores necessitam de aprovação da maioria dos moradores.'
  );

  const [suppliesHighlight, setSuppliesHighlight] = useState(
    'Divisão automática em 4 partes iguais'
  );

  const [toleranceHighlight, setToleranceHighlight] = useState(
    'Até 3 dias úteis após o vencimento'
  );

  const handleSave = () => {
    Alert.alert(
      'Regras Atualizadas',
      'O estatuto da casa foi modificado e todos os moradores foram notificados.',
      [
        {
          text: 'OK',
          onPress: () => {
            if (onSaveSuccess) {
              onSaveSuccess();
            }
          },
        },
      ]
    );
  };

  const handleAddRule = () => {
    Alert.alert(
      'Nova Regra',
      'Funcionalidade para adicionar campo dinâmico de nova regra de convivência.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop}>
        <Svg width="340" height="340" viewBox="0 0 340 340">
          <Defs>
            <RadialGradient
              id="editRulesGlow"
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
          <Rect x="0" y="0" width="340" height="340" fill="url(#editRulesGlow)" />
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

        <Text style={styles.headerTitle}>Editar Regras</Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Text style={styles.sectionTitle}>Atualizar estatuto</Text>
          <Text style={styles.sectionSubtitle}>
            Modifique as normas de convivência da <Text style={styles.boldText}>{republicName}</Text>.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>1. HORÁRIO DE SILÊNCIO</Text>
          <TextInput
            style={styles.input}
            value={silenceHighlight}
            onChangeText={setSilenceHighlight}
          />
          <TextInput
            style={styles.textArea}
            value={silenceDesc}
            onChangeText={setSilenceDesc}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>2. VISITAS E HÓSPEDES</Text>
          <TextInput
            style={styles.input}
            value={guestsHighlight}
            onChangeText={setGuestsHighlight}
          />
          <TextInput
            style={styles.textArea}
            value={guestsDesc}
            onChangeText={setGuestsDesc}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>3. INSUMOS COLETIVOS</Text>
          <TextInput
            style={styles.input}
            value={suppliesHighlight}
            onChangeText={setSuppliesHighlight}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>4. TOLERÂNCIA DE PAGAMENTO</Text>
          <TextInput
            style={styles.input}
            value={toleranceHighlight}
            onChangeText={setToleranceHighlight}
          />
        </View>

        <TouchableOpacity
          style={styles.addRuleButton}
          activeOpacity={0.7}
          onPress={handleAddRule}
        >
          <View style={styles.addRuleIconContainer}>
            <Feather name="plus" size={15} color={Colors.primary} />
          </View>
          <Text style={styles.addRuleText}>Adicionar nova regra</Text>
        </TouchableOpacity>

        <View style={styles.noticeBox}>
          <Feather name="bell" size={16} color={Colors.primary} style={styles.noticeIcon} />
          <Text style={styles.noticeText}>
            Todos os moradores (Doutor Octopus, Lagarto e Homem-Areia) receberão uma notificação sobre a atualização do estatuto.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Salvar alterações</Text>
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
  introSection: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D2D2A',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#84828F',
    marginTop: 3,
  },
  boldText: {
    fontWeight: '700',
    color: '#2D2D2A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2D2D2A',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#2D2D2A',
  },
  textArea: {
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 11,
    color: '#84828F',
    lineHeight: 16,
    minHeight: 52,
  },
  addRuleButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(204, 146, 194, 0.6)',
    backgroundColor: 'rgba(204, 146, 194, 0.08)',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  addRuleIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRuleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E2B97',
  },
  noticeBox: {
    backgroundColor: 'rgba(94, 43, 151, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.18)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeText: {
    fontSize: 11,
    color: '#5E2B97',
    fontWeight: '600',
    lineHeight: 17,
    flex: 1,
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
  saveButton: {
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
  saveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FCFCFC',
  },
});
