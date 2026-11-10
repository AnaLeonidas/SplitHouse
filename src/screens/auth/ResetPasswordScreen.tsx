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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Propriedades da tela de redefinição de senha.
 */
interface ResetPasswordScreenProps {
  /** E-mail inicial pré-preenchido vindo do fluxo anterior */
  initialEmail?: string;
  /** Token pré-carregado vindo de deep link (se houver) */
  initialToken?: string;
  /** Callback para voltar à tela anterior */
  onBackPress?: () => void;
  /** Callback executado após a redefinição com sucesso */
  onSuccess?: () => void;
  /** Callback para ir à tela de login */
  onLoginPress?: () => void;
}

/**
 * Tela de redefinição de senha do SplitHouse.
 * Permite ao usuário validar o código/token de recuperação e cadastrar uma nova senha segura.
 *
 * @param props Callbacks de navegação e e-mail pré-carregado.
 */
export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  initialEmail = '',
  initialToken = '',
  onBackPress,
  onSuccess,
  onLoginPress,
}) => {
  const { verifyRecoveryOtp, updatePassword, session } = useAuth();

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Se já houver sessão ativa (ex: usuário veio de link de recuperação que gerou sessão de recovery), não exige token
  const hasActiveRecoverySession = !!session;

  const handleReset = async () => {
    if (!hasActiveRecoverySession && !email.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu e-mail cadastrado.');
      return;
    }

    if (!hasActiveRecoverySession && !token.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o código de verificação recebido por e-mail.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atenção', 'A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'A confirmação de senha não confere com a nova senha digitada.');
      return;
    }

    try {
      setLoading(true);

      // 1. Se informou token manual, valida o OTP primeiro
      if (!hasActiveRecoverySession && token.trim()) {
        await verifyRecoveryOtp(email.trim(), token.trim());
      }

      // 2. Atualiza para a nova senha
      await updatePassword(password);

      Alert.alert(
        'Senha alterada!',
        'Sua nova senha foi cadastrada com sucesso. Acesse sua conta agora.',
        [
          {
            text: 'Fazer Login',
            onPress: () => {
              if (onSuccess) onSuccess();
              else if (onLoginPress) onLoginPress();
            },
          },
        ]
      );
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Token has expired') || msg.includes('invalid')) {
        Alert.alert(
          'Código inválido ou expirado',
          'O código de recuperação informado não é válido ou já expirou. Solicite um novo na tela anterior.'
        );
      } else {
        Alert.alert('Erro ao alterar senha', msg || 'Não foi possível redefinir sua senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Svg height="260" width="260" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="resetTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#resetTopGlow)" />
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
            disabled={loading}
          >
            <Feather name="chevron-left" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <View style={styles.formContainer}>
            <View style={styles.iconCircle}>
              <Feather name="shield" size={28} color={Colors.primary} />
            </View>

            <Text style={styles.title}>Nova Senha</Text>
            <Text style={styles.subtitle}>
              {hasActiveRecoverySession
                ? 'Sessão de recuperação autorizada. Digite sua nova senha de acesso.'
                : 'Informe o código recebido no seu e-mail e cadastre uma nova senha.'}
            </Text>

            <View style={styles.form}>
              {!hasActiveRecoverySession && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Seu e-mail</Text>
                    <View style={styles.inputWrapper}>
                      <Feather
                        name="mail"
                        size={17}
                        color={Colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="seu@email.com"
                        placeholderTextColor={Colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Código de verificação</Text>
                    <View style={styles.inputWrapper}>
                      <Feather
                        name="key"
                        size={17}
                        color={Colors.textSecondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Ex: 123456"
                        placeholderTextColor={Colors.textSecondary}
                        value={token}
                        onChangeText={setToken}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />
                    </View>
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nova senha</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="lock"
                    size={17}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={Colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={17}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirmar nova senha</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="check-circle"
                    size={17}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Repita a nova senha"
                    placeholderTextColor={Colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                activeOpacity={0.85}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Salvar nova senha</Text>
                    <Feather name="arrow-right" size={17} color={Colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.backToLoginRow}
                activeOpacity={0.75}
                onPress={onLoginPress}
                disabled={loading}
              >
                <Feather name="arrow-left" size={14} color={Colors.primary} />
                <Text style={styles.backToLoginText}>Voltar para o login</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 8 : 20,
    paddingBottom: Platform.OS === 'android' ? 44 : 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  formContainer: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(94, 43, 151, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  form: {
    width: '100%',
    gap: 14,
  },
  inputContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  submitButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  backToLoginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  backToLoginText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
