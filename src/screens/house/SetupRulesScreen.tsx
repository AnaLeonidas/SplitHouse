import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface RuleItem {
  id: string;
  title: string;
  value: string;
}

interface SetupRulesScreenProps {
  houseName?: string;
  onBackPress?: () => void;
  onSubmit?: (rules: RuleItem[]) => void;
}

export const SetupRulesScreen: React.FC<SetupRulesScreenProps> = ({
  houseName = 'Moradia Compartilhada',
  onBackPress,
  onSubmit,
}) => {
  const [rules, setRules] = useState<RuleItem[]>([]);

  const updateRuleTitle = (id: string, text: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, title: text } : rule))
    );
  };

  const updateRuleValue = (id: string, text: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, value: text } : rule))
    );
  };

  const handleAddRule = () => {
    const newId = String(Date.now());
    setRules((prev) => [
      ...prev,
      {
        id: newId,
        title: '',
        value: '',
      },
    ]);
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Svg height="260" width="260" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="setupRulesTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#setupRulesTopGlow)" />
      </Svg>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={onBackPress}
          >
            <Feather name="chevron-left" size={22} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Passo 2 de 2</Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Regras da república</Text>
          <Text style={styles.subtitle}>
            Defina as diretrizes básicas de convivência de{' '}
            <Text style={styles.subtitleBold}>{houseName}</Text>.
          </Text>
        </View>

        <View style={styles.rulesList}>
          {rules.length === 0 && (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconBox}>
                <Feather name="file-text" size={26} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma regra cadastrada</Text>
              <Text style={styles.emptySubtitle}>
                Toque no botão abaixo para criar as regras de convivência da sua moradia.
              </Text>
            </View>
          )}

          {rules.map((rule, index) => (
            <View key={rule.id} style={styles.ruleCard}>
              <View style={styles.ruleCardHeader}>
                <View style={styles.ruleHeaderLeft}>
                  <View style={styles.ruleIconContainer}>
                    <Feather name="file-text" size={15} color={Colors.primary} />
                  </View>
                  <TextInput
                    style={styles.ruleTitleInput}
                    value={rule.title}
                    onChangeText={(text) => updateRuleTitle(rule.id, text)}
                    placeholder={`Título da regra ${index + 1}`}
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                  onPress={() => handleDeleteRule(rule.id)}
                >
                  <Feather name="trash-2" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.ruleInput}
                value={rule.value}
                onChangeText={(text) => updateRuleValue(rule.id, text)}
                placeholder="Descreva o conteúdo da regra"
                placeholderTextColor={Colors.textSecondary}
                multiline
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.addRuleButton}
            activeOpacity={0.8}
            onPress={handleAddRule}
          >
            <View style={styles.addRuleIconContainer}>
              <Feather name="plus" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.addRuleButtonText}>Adicionar nova regra</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Feather
              name="info"
              size={18}
              color={Colors.primary}
              style={styles.infoCardIcon}
            />
            <Text style={styles.infoCardText}>
              Essas regras ficarão visíveis para todos os novos moradores assim que
              aceitarem o convite e poderão ser editadas a qualquer momento.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            onPress={() => onSubmit && onSubmit(rules)}
          >
            <Text style={styles.submitButtonText}>
              Salvar regras e gerar convite
            </Text>
            <Feather name="arrow-right" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  topGlowSvg: {
    position: 'absolute',
    top: -40,
    right: -40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 28,
    paddingBottom: Platform.OS === 'android' ? 44 : 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepBadge: {
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  subtitleBold: {
    fontWeight: '700',
    color: Colors.text,
  },
  rulesList: {
    gap: 14,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  ruleCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 10,
  },
  ruleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ruleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  ruleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleTitleInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.3,
    paddingVertical: 4,
  },
  deleteButton: {
    padding: 4,
  },
  ruleInput: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FAFAFA',
    lineHeight: 17,
  },
  addRuleButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(204, 146, 194, 0.7)',
    borderRadius: 16,
    backgroundColor: 'rgba(204, 146, 194, 0.08)',
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addRuleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(94, 43, 151, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRuleButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoCard: {
    backgroundColor: '#F7F7F8',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 2,
  },
  infoCardIcon: {
    marginTop: 1,
  },
  infoCardText: {
    flex: 1,
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 14.5,
    fontWeight: '700',
  },
});
