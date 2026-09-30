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
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';

/**
 * Modelo descritivo de uma cláusula ou combinativo de convivência da república.
 */
export interface HouseRule {
  /** Identificador único da regra */
  id: string;
  /** Ordem numérica da regra no estatuto */
  number: number;
  /** Título do tópico de convivência */
  title: string;
  /** Destaque ou resumo sucinto da regra */
  highlight: string;
  /** Texto completo com a especificação da diretriz */
  description: string;
  /** Ícone representativo do Feather Icons */
  iconName: keyof typeof Feather.glyphMap;
  /** Cor de fundo do ícone */
  iconBgColor?: string;
  /** Cor do traço do ícone */
  iconColor?: string;
}

/**
 * Propriedades e callbacks da tela de estatuto e regras da casa.
 */
interface HouseRulesScreenProps {
  /** Nome da república */
  republicName?: string;
  /** Data da última revisão das regras */
  updatedDate?: string;
  /** Lista opcional de regras cadastradas */
  rules?: HouseRule[];
  /** Callback para voltar ao perfil */
  onBackPress?: () => void;
  /** Callback para abrir tela de edição do estatuto */
  onEditPress?: () => void;
}

const defaultRules: HouseRule[] = [
  {
    id: '1',
    number: 1,
    title: 'Horário de Silêncio',
    highlight: '22h00 às 08h00 (dias úteis) • 00h00 aos fins de semana',
    description:
      'Música alta e conversa em volume elevado nas áreas compartilhadas (sala e varanda) são vedados após o horário limite.',
    iconName: 'moon',
    iconBgColor: 'rgba(94, 43, 151, 0.1)',
    iconColor: '#5E2B97',
  },
  {
    id: '2',
    number: 2,
    title: 'Visitas e Hóspedes',
    highlight: 'Aviso prévio de 24h no grupo da república',
    description:
      'Hóspedes podem pernoitar por até 2 noites seguidas. Períodos maiores necessitam de aprovação da maioria dos moradores.',
    iconName: 'users',
    iconBgColor: 'rgba(204, 146, 194, 0.25)',
    iconColor: '#5E2B97',
  },
  {
    id: '3',
    number: 3,
    title: 'Insumos Coletivos',
    highlight: 'Divisão automática em 4 partes iguais',
    description:
      'Produtos de limpeza (detergente, água sanitária, desinfetante), sacos de lixo e papel higiênico entram como despesa compartilhada.',
    iconName: 'shopping-cart',
    iconBgColor: '#F3F4F6',
    iconColor: '#2D2D2A',
  },
  {
    id: '4',
    number: 4,
    title: 'Tolerância de Pagamento',
    highlight: 'Até 3 dias úteis após o vencimento',
    description:
      'O morador inadimplente recebe notificação automática e fica impedido de resgatar prêmios na Loja da Casa até a quitação.',
    iconName: 'clock',
    iconBgColor: 'rgba(94, 43, 151, 0.1)',
    iconColor: '#5E2B97',
  },
];

/**
 * Tela de consulta às regras de convivência da moradia (Tela 30).
 * Apresenta as cláusulas de silêncio, visitas, tarefas e pagamentos, com data da última revisão e atalho para edição.
 *
 * @param props Dados da república, lista de regras e handlers de retorno e edição.
 */
export const HouseRulesScreen: React.FC<HouseRulesScreenProps> = ({
  republicName = 'República do Sexteto Sinistro',
  updatedDate = '01/Set/2026',
  rules = defaultRules,
  onBackPress,
  onEditPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.glowTop}>
        <Svg width="340" height="340" viewBox="0 0 340 340">
          <Defs>
            <RadialGradient
              id="rulesGlow"
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
          <Rect x="0" y="0" width="340" height="340" fill="url(#rulesGlow)" />
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

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Regras da Casa</Text>
          <Text style={styles.headerSubtitle}>{republicName}</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.7}
          onPress={onEditPress}
        >
          <Feather name="edit-2" size={12} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBox}>
          <View style={styles.statusLeft}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Estatuto ativo</Text>
          </View>
          <Text style={styles.statusDate}>Atualizado em {updatedDate}</Text>
        </View>

        {rules.map((rule) => (
          <View key={rule.id} style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <View
                style={[
                  styles.ruleIconContainer,
                  { backgroundColor: rule.iconBgColor || '#F3F4F6' },
                ]}
              >
                <Feather
                  name={rule.iconName}
                  size={15}
                  color={rule.iconColor || Colors.primary}
                />
              </View>
              <Text style={styles.ruleTitle}>
                {rule.number}. {rule.title}
              </Text>
            </View>

            <Text style={styles.ruleHighlight}>{rule.highlight}</Text>
            <Text style={styles.ruleDescription}>{rule.description}</Text>
          </View>
        ))}
      </ScrollView>
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
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D2D2A',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#84828F',
    marginTop: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#5E2B97',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#5E2B97',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  statusBox: {
    backgroundColor: 'rgba(94, 43, 151, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.18)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5E2B97',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E2B97',
  },
  statusDate: {
    fontSize: 10,
    color: '#84828F',
  },
  ruleCard: {
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
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ruleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2D2D2A',
  },
  ruleHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E2B97',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 11,
    color: '#84828F',
    lineHeight: 17,
  },
});
