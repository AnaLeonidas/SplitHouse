import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import { Colors } from '../../constants/theme';

export interface TaskDetailsData {
  id?: string;
  title?: string;
  description?: string;
  type?: 'Fixa' | 'Rotativa' | 'Emergencial';
  location?: string;
  deadline?: string;
  assignee?: string;
  xp?: number;
  points?: number;
}

interface TaskDetailsScreenProps {
  task?: TaskDetailsData;
  onBackPress?: () => void;
  onOptionsPress?: () => void;
  onSubmitValidation?: () => void;
}

export const TaskDetailsScreen: React.FC<TaskDetailsScreenProps> = ({
  task,
  onBackPress,
  onOptionsPress,
  onSubmitValidation,
}) => {
  const [hasPhoto, setHasPhoto] = useState(false);

  const title = task?.title || 'Lavar louça do almoço';
  const description =
    task?.description ||
    'Lavar os pratos, panelas e talheres utilizados no almoço coletivo, secar e guardar nos armários.';
  const type = task?.type || 'Rotativa';
  const location = task?.location || 'Cozinha';
  const deadline = task?.deadline || 'Hoje às 14:00';
  const assignee = task?.assignee || 'Norman Osborn (Você)';
  const xp = task?.xp ?? 30;
  const points = task?.points ?? 10;

  const handlePhotoPress = () => {
    setHasPhoto((prev) => !prev);
  };

  const handleSendValidation = () => {
    if (!hasPhoto) {
      Alert.alert(
        'Foto necessária',
        'Tire uma foto como comprovante antes de enviar a tarefa para validação.',
        [
          { text: 'Tirar foto agora', onPress: () => setHasPhoto(true) },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    if (onSubmitValidation) {
      onSubmitValidation();
    } else {
      Alert.alert('Sucesso', 'Tarefa enviada para validação dos moradores!');
    }
  };

  return (
    <View style={styles.wrapper}>
      <Svg height="320" width="320" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="taskDetailsTopGlow" cx="60%" cy="30%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="320" height="320" fill="url(#taskDetailsTopGlow)" />
      </Svg>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={onBackPress}
        >
          <Feather name="chevron-left" size={22} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalhes da Tarefa</Text>

        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={onOptionsPress}
        >
          <Feather name="more-horizontal" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>
                {type} • {location}
              </Text>
            </View>
            <Text style={styles.deadlineText}>Prazo: {deadline}</Text>
          </View>

          <Text style={styles.taskTitle}>{title}</Text>
          <Text style={styles.taskDescription}>{description}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Responsável</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {assignee}
              </Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Recompensa</Text>
              <View style={styles.rewardRow}>
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
          </View>
        </View>

        <TouchableOpacity
          style={[styles.evidenceCard, hasPhoto && styles.evidenceCardAttached]}
          activeOpacity={0.8}
          onPress={handlePhotoPress}
        >
          <View style={[styles.cameraIconBox, hasPhoto && styles.cameraIconBoxAttached]}>
            <Feather
              name={hasPhoto ? 'check' : 'camera'}
              size={24}
              color={hasPhoto ? Colors.success : Colors.primary}
            />
          </View>
          <Text style={styles.evidenceTitle}>
            {hasPhoto ? 'Foto anexada com sucesso' : 'Tirar foto da pia limpa'}
          </Text>
          <Text style={styles.evidenceSubtitle}>
            {hasPhoto
              ? 'Toque para alterar ou tirar outra foto de comprovante.'
              : 'A foto servirá como comprovante para que outro morador valide sua conclusão.'}
          </Text>
        </TouchableOpacity>

        <View style={styles.ruleCard}>
          <View style={styles.ruleIconContainer}>
            <Feather name="info" size={15} color={Colors.primary} />
          </View>
          <Text style={styles.ruleText}>
            <Text style={styles.ruleBoldText}>Regra da casa:</Text> É proibida a
            autoconfirmação da tarefa. Outro morador precisará aprovar sua execução.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.88}
          onPress={handleSendValidation}
        >
          <Feather name="check" size={18} color="#FCFCFC" />
          <Text style={styles.submitButtonText}>Enviar para validação</Text>
        </TouchableOpacity>

        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

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
  headerButton: {
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  mainCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.20)',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  deadlineText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  infoCol: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FAF8FC',
    borderWidth: 1,
    borderColor: 'rgba(94, 43, 151, 0.20)',
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
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
  evidenceCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(94, 43, 151, 0.40)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceCardAttached: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  cameraIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cameraIconBoxAttached: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  evidenceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  evidenceSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 220,
    lineHeight: 14,
  },
  ruleCard: {
    padding: 12,
    backgroundColor: '#FAF8FC',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.20)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleIconContainer: {
    marginTop: 1,
  },
  ruleText: {
    flex: 1,
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  ruleBoldText: {
    fontWeight: '700',
    color: Colors.text,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 16 : 8,
    paddingTop: 8,
    backgroundColor: '#FCFCFC',
    gap: 8,
  },
  submitButton: {
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
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FCFCFC',
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