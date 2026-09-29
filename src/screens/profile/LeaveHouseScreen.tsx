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

interface CandidateMember {
  id: string;
  name: string;
  initials: string;
  levelInfo: string;
  avatarBg: string;
  avatarTextColor: string;
}

interface LeaveHouseScreenProps {
  republicName?: string;
  balance?: number;
  onBackPress?: () => void;
  onConfirmSuccess?: () => void;
  onCancelPress?: () => void;
}

const defaultCandidates: CandidateMember[] = [
  {
    id: '1',
    name: 'Doutor Octopus',
    initials: 'DO',
    levelInfo: 'Nível 4 • 15 tarefas feitas',
    avatarBg: '#2D2D2A',
    avatarTextColor: '#FFFFFF',
  },
  {
    id: '2',
    name: 'Lagarto',
    initials: 'LG',
    levelInfo: 'Nível 3 • 11 tarefas feitas',
    avatarBg: 'rgba(204, 146, 194, 0.3)',
    avatarTextColor: '#2D2D2A',
  },
  {
    id: '3',
    name: 'Homem-Areia',
    initials: 'HA',
    levelInfo: 'Nível 2 • 7 tarefas feitas',
    avatarBg: '#F3F4F6',
    avatarTextColor: '#2D2D2A',
  },
];

export const LeaveHouseScreen: React.FC<LeaveHouseScreenProps> = ({
  republicName = 'República do Sexteto Sinistro',
  balance = 95.0,
  onBackPress,
  onConfirmSuccess,
  onCancelPress,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('1');
  const [password, setPassword] = useState('••••••••••••');

  const handleConfirm = () => {
    const selected = defaultCandidates.find((c) => c.id === selectedCandidateId);
    Alert.alert(
      'Solicitação Enviada',
      `O convite de administração foi enviado para ${selected?.name || 'o morador indicado'}. Sua desvinculação será concluída assim que o aceite for confirmado.`,
      [
        {
          text: 'Entendido',
          onPress: () => {
            if (onConfirmSuccess) {
              onConfirmSuccess();
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
              id="leaveGlow"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.08" />
              <Stop offset="50%" stopColor="#CC92C2" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#FCFCFC" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="340" height="340" fill="url(#leaveGlow)" />
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

        <Text style={styles.headerTitle}>Desvinculação</Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Text style={styles.sectionTitle}>Sair da república</Text>
          <Text style={styles.sectionSubtitle}>
            Você deixará de fazer parte da <Text style={styles.boldText}>{republicName}</Text>.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.financeHeader}>
            <Text style={styles.label}>SITUAÇÃO FINANCEIRA</Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>Quitado</Text>
            </View>
          </View>
          <Text style={styles.financeText}>
            Você não possui dívidas em aberto. Seu saldo atual é de{' '}
            <Text style={styles.financeHighlight}>
              {balance >= 0 ? `+R$ ${balance.toFixed(2).replace('.', ',')} a receber` : `-R$ ${Math.abs(balance).toFixed(2).replace('.', ',')} a pagar`}
            </Text>.
          </Text>
        </View>

        <View style={[styles.card, styles.adminCard]}>
          <View style={styles.adminHeader}>
            <View style={styles.adminTag}>
              <Text style={styles.adminTagText}>Admin</Text>
            </View>
            <Text style={styles.adminTitle}>Indicar Novo Administrador</Text>
          </View>
          <Text style={styles.adminSubtitle}>
            Como administrador atual, escolha quem assumirá a gestão da moradia:
          </Text>

          <View style={styles.candidatesList}>
            {defaultCandidates.map((member) => {
              const isSelected = selectedCandidateId === member.id;
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.candidateRow,
                    isSelected && styles.candidateRowSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCandidateId(member.id)}
                >
                  <View style={styles.candidateLeft}>
                    <View
                      style={[
                        styles.candidateAvatar,
                        { backgroundColor: member.avatarBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.candidateAvatarText,
                          { color: member.avatarTextColor },
                        ]}
                      >
                        {member.initials}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.candidateName}>{member.name}</Text>
                      <Text style={styles.candidateLevel}>{member.levelInfo}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.warningBox}>
            <Feather name="alert-circle" size={15} color="#B45309" style={styles.warningIcon} />
            <Text style={styles.warningText}>
              O indicado receberá uma solicitação de posse. A troca de administração e sua desvinculação só ocorrerão após o aceite dele.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>CONFIRMAÇÃO POR SENHA</Text>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Digite sua senha de acesso"
            placeholderTextColor="#84828F"
          />
          <Text style={styles.helpText}>
            Confirme suas credenciais para autorizar a transferência de posse.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.dangerButton}
          activeOpacity={0.8}
          onPress={handleConfirm}
        >
          <Text style={styles.dangerButtonText}>Solicitar transferência e sair</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.7}
          onPress={onCancelPress || onBackPress}
        >
          <Text style={styles.cancelButtonText}>Cancelar e permanecer na república</Text>
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
    color: '#DC2626',
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
    paddingBottom: 140,
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
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  financeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#84828F',
    letterSpacing: 0.8,
  },
  paidBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
  financeText: {
    fontSize: 12,
    color: '#2D2D2A',
    lineHeight: 18,
  },
  financeHighlight: {
    fontWeight: '800',
    color: '#047857',
  },
  adminCard: {
    borderWidth: 2,
    borderColor: 'rgba(94, 43, 151, 0.25)',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  adminTag: {
    backgroundColor: '#5E2B97',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  adminTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2D2D2A',
  },
  adminSubtitle: {
    fontSize: 11,
    color: '#84828F',
    marginBottom: 12,
    marginTop: 2,
  },
  candidatesList: {
    gap: 8,
    marginBottom: 12,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
  },
  candidateRowSelected: {
    borderColor: '#5E2B97',
    borderWidth: 2,
    backgroundColor: 'rgba(94, 43, 151, 0.05)',
  },
  candidateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  candidateAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateAvatarText: {
    fontSize: 11,
    fontWeight: '800',
  },
  candidateName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D2D2A',
  },
  candidateLevel: {
    fontSize: 10,
    color: '#84828F',
    marginTop: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(132, 130, 143, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#5E2B97',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#5E2B97',
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningIcon: {
    marginTop: 2,
  },
  warningText: {
    fontSize: 10,
    color: '#92400E',
    lineHeight: 15,
    flex: 1,
    fontWeight: '600',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#2D2D2A',
    letterSpacing: 2,
    marginTop: 6,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 10,
    color: '#84828F',
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
    gap: 6,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#84828F',
  },
});
