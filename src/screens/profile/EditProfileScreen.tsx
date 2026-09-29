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

interface EditProfileScreenProps {
  onBackPress?: () => void;
  onSaveSuccess?: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onBackPress,
  onSaveSuccess,
}) => {
  const [name, setName] = useState('Norman Osborn');
  const [email, setEmail] = useState('norman.osborn@oscorp.com');
  const [pixKey, setPixKey] = useState('norman.pix@oscorp.com');
  const [currentPassword, setCurrentPassword] = useState('••••••••••••');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar em branco.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Atenção', 'O e-mail não pode ficar em branco.');
      return;
    }

    Alert.alert(
      'Perfil Atualizado',
      'Suas alterações foram salvas com sucesso!',
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

  return (
    <View style={styles.container}>
      <View style={styles.glowTop}>
        <Svg width="340" height="340" viewBox="0 0 340 340">
          <Defs>
            <RadialGradient
              id="editProfileGlow"
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
          <Rect x="0" y="0" width="340" height="340" fill="url(#editProfileGlow)" />
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

        <Text style={styles.headerTitle}>Editar Perfil</Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NO</Text>
            </View>
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.7}>
              <Feather name="camera" size={14} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Alterar foto de exibição</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>NOME COMPLETO</Text>
          <TextInput
            style={styles.inputBold}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome completo"
            placeholderTextColor="#84828F"
          />

          <View style={styles.divider} />

          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.inputRegular}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="seu.email@exemplo.com"
            placeholderTextColor="#84828F"
          />

          <View style={styles.divider} />

          <Text style={styles.label}>CHAVE PIX (PARA RECEBER RATEIOS)</Text>
          <TextInput
            style={styles.inputPurple}
            value={pixKey}
            onChangeText={setPixKey}
            placeholder="CPF, e-mail ou telefone"
            placeholderTextColor="#84828F"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Alterar Senha</Text>

          <Text style={styles.label}>SENHA ATUAL</Text>
          <TextInput
            style={styles.inputRegular}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Digite sua senha atual"
            placeholderTextColor="#84828F"
          />

          <View style={styles.divider} />

          <Text style={styles.label}>NOVA SENHA</Text>
          <TextInput
            style={styles.inputRegular}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Deixe em branco para manter a atual"
            placeholderTextColor="#84828F"
          />
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
  avatarSection: {
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#5E2B97',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#5E2B97',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  avatarText: {
    color: '#FCFCFC',
    fontSize: 24,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5E2B97',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.2)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2D2D2A',
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#84828F',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  inputBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D2D2A',
    paddingVertical: 4,
  },
  inputRegular: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D2D2A',
    paddingVertical: 4,
  },
  inputPurple: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5E2B97',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(132, 130, 143, 0.15)',
    marginVertical: 12,
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
