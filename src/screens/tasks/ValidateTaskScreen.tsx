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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';

export interface TaskValidationData {
  id?: string;
  title?: string;
  executorName?: string;
  executedAt?: string;
  photoFilename?: string;
  photoTimestamp?: string;
  xp?: number;
  points?: number;
}

interface ValidateTaskScreenProps {
  task?: TaskValidationData;
  onBackPress?: () => void;
  onApprovePress?: (justification?: string) => void;
  onRejectPress?: (justification: string) => void;
}

export const ValidateTaskScreen: React.FC<ValidateTaskScreenProps> = ({
  task,
  onBackPress,
  onApprovePress,
  onRejectPress,
}) => {
  const [justification, setJustification] = useState('');

  const title = task?.title || 'Aspirar tapete da sala';
  const executorName = task?.executorName || 'Doutor Octopus';
  const executedAt = task?.executedAt || 'Hoje às 11:15';
  const photoFilename = task?.photoFilename || 'tapete_sala_concluido.jpg';
  const photoTimestamp = task?.photoTimestamp || '11/09/2026 11:15';
  const xp = task?.xp ?? 25;
  const points = task?.points ?? 10;

  const handleApprove = () => {
    if (onApprovePress) {
      onApprovePress(justification.trim() || undefined);
    } else {
      Alert.alert(
        'Tarefa Aprovada!',
        `Você aprovou a execução de ${executorName}. +${xp} XP e ${points} Moedas foram creditados.`
      );
    }
  };

  const handleReject = () => {
    if (!justification.trim()) {
      Alert.alert(
        'Justificativa obrigatória',
        'Por favor, preencha o campo de observação com o motivo da recusa antes de recusar a tarefa.'
      );
      return;
    }

    if (onRejectPress) {
      onRejectPress(justification.trim());
    } else {
      Alert.alert(
        'Tarefa Recusada',
        `A execução foi recusada e ${executorName} foi notificado com sua justificativa.`
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Svg height="320" width="320" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="validateTaskTopGlow" cx="60%" cy="30%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="320" height="320" fill="url(#validateTaskTopGlow)" />
      </Svg>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={onBackPress}
        >
          <Feather name="chevron-left" size={22} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Avaliação de Par</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.taskHeaderSection}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>Validação por Pares (RN-09)</Text>
          </View>
          <Text style={styles.taskTitle}>{title}</Text>
          <Text style={styles.taskSubtitle}>
            Executada por <Text style={styles.executorHighlight}>{executorName}</Text> •{' '}
            {executedAt}
          </Text>
        </View>

        <View style={styles.photoCard}>
          <Text style={styles.photoCardLabel}>FOTO ANEXADA PELO EXECUTOR</Text>

          <View style={styles.photoContainer}>
            <LinearGradient
              colors={['#18181B', '#27272A', '#3F3F46']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.photoGraphicBox}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  stroke="#D4D4D8"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.photoFilename}>{photoFilename}</Text>
            </View>

            <View style={styles.photoTimestampBadge}>
              <Text style={styles.photoTimestampText}>{photoTimestamp}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardInput}>
          <Text style={styles.inputLabel}>
            OBSERVAÇÃO OU JUSTIFICATIVA (OBRIGATÓRIO EM CASO DE RECUSA)
          </Text>
          <TextInput
            style={styles.textInputArea}
            placeholder="Ex: Ficou muito bom! Ou: Ainda tem sujeira perto do sofá..."
            placeholderTextColor="rgba(132, 130, 143, 0.45)"
            multiline
            numberOfLines={2}
            value={justification}
            onChangeText={setJustification}
          />
        </View>

        <View style={styles.rewardNoticeCard}>
          <Text style={styles.rewardNoticeText}>
            Se aprovado, concede a {executorName.split(' ')[0]}:
          </Text>
          <View style={styles.rewardValuesRow}>
            <Text style={styles.rewardXpText}>+{xp} XP •</Text>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Circle
                cx={12}
                cy={12}
                r={9}
                stroke="#CC92C2"
                strokeWidth={2.5}
                fill="#CC92C2"
                fillOpacity={0.35}
              />
              <Circle
                cx={12}
                cy={12}
                r={4.5}
                stroke="#CC92C2"
                strokeWidth={2.5}
              />
            </Svg>
            <Text style={styles.rewardCoinsText}>{points} Moedas</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.approveButton}
          activeOpacity={0.88}
          onPress={handleApprove}
        >
          <Feather name="check" size={18} color="#FCFCFC" />
          <Text style={styles.approveButtonText}>Aprovar tarefa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectButton}
          activeOpacity={0.85}
          onPress={handleReject}
        >
          <Feather name="x" size={14} color={Colors.danger} />
          <Text style={styles.rejectButtonText}>Recusar com justificativa</Text>
        </TouchableOpacity>

        <View style={styles.homeIndicator} />
      </View>
    </KeyboardAvoidingView>
  );
};

export const TaskValidationScreen = ValidateTaskScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  topGlowSvg: {
    position: 'absolute',
    top: -100,
    right: -80,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 14 : 52,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
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
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  taskHeaderSection: {
    gap: 4,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
    marginBottom: 4,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  taskSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  executorHighlight: {
    fontWeight: '700',
    color: Colors.text,
  },
  photoCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  photoCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  photoContainer: {
    width: '100%',
    height: 176,
    borderRadius: 16,
    backgroundColor: '#27272A',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoGraphicBox: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  photoFilename: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(252, 252, 252, 0.9)',
    marginTop: 6,
  },
  photoTimestampBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.60)',
    zIndex: 2,
  },
  photoTimestampText: {
    color: '#FCFCFC',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  cardInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.20)',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  textInputArea: {
    fontSize: 12,
    color: Colors.text,
    minHeight: 48,
    textAlignVertical: 'top',
    padding: 0,
  },
  rewardNoticeCard: {
    padding: 12,
    backgroundColor: '#FAF8FC',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.20)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardNoticeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rewardValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardXpText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primary,
  },
  rewardCoinsText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primary,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 16 : 8,
    paddingTop: 8,
    backgroundColor: '#FCFCFC',
    gap: 8,
  },
  approveButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FCFCFC',
  },
  rejectButton: {
    width: '100%',
    height: 44,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.30)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#2D2D2A',
    borderRadius: 100,
    alignSelf: 'center',
    opacity: 0.25,
    marginTop: 4,
    marginBottom: 4,
  },
});
