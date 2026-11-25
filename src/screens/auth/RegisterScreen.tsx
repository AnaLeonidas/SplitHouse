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
import Svg, { Defs, RadialGradient, Stop, Rect, Path } from 'react-native-svg';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

/**
 * Propriedades e eventos da tela de cadastro de novo morador.
 */
export interface RegisterScreenProps {
  /** Callback para voltar à tela anterior */
  onBackPress?: () => void;
  /** Callback para submeter os dados de registro (nome, e-mail e senha) */
  onRegisterSubmit?: (name: string, email: string, pass: string) => void;
  /** Callback para redirecionar à tela de login */
  onLoginPress?: () => void;
  /** Callback para exibir os termos de uso */
  onTermsPress?: () => void;
  /** Callback para exibir a política de privacidade */
  onPrivacyPress?: () => void;
  /** Callback para iniciar cadastro com Google e retornar nome/e-mail pré-preenchidos */
  onGooglePress?: () => Promise<{ name?: string; email?: string } | null>;
}

/**
 * Tela de criação de conta e perfil inicial do morador (Tela 04).
 * Coleta nome, e-mail, confirmação de senha com indicador de força e aceitação dos termos de serviço.
 *
 * @param props Handlers de submissão de cadastro e links institucionais.
 */
export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBackPress,
  onRegisterSubmit,
  onLoginPress,
  onTermsPress,
  onPrivacyPress,
  onGooglePress,
}) => {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(false);

  /**
   * Processa a submissão do formulário de cadastro de novo morador.
   * Realiza a validação dos campos, checagem de força e igualdade de senhas,
   * e despacha a requisição de criação de conta para o Supabase Auth.
   */
  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu nome completo.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu e-mail.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'A confirmação de senha não coincide com a senha informada.');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Atenção', 'Você precisa concordar com os Termos de Uso e Política de Privacidade.');
      return;
    }

    try {
      setLoading(true);
      if (googleLinked) {
        let { data: updated, error: updateError } = await supabase.auth.updateUser({
          password,
          data: {
            full_name: name.trim(),
            cadastro_concluido: true,
          },
        });
        if (
          updateError &&
          updateError.message?.toLowerCase().includes('different from the old password')
        ) {
          const retry = await supabase.auth.updateUser({
            data: {
              full_name: name.trim(),
              cadastro_concluido: true,
            },
          });
          updated = retry.data;
          updateError = retry.error;
        }
        if (updateError) {
          throw updateError;
        }
        if (updated?.user?.id) {
          await supabase
            .from('perfis')
            .update({ nome_completo: name.trim() })
            .eq('id', updated.user.id);
        }
        Alert.alert('Sucesso', 'Cadastro com Google finalizado com sucesso!');
        if (onRegisterSubmit) {
          onRegisterSubmit(name.trim(), email.trim(), password);
        }
        return;
      }

      const result = await signUp(email.trim(), password, name.trim());
      if (!result.emailConfirmed && !result.session) {
        Alert.alert(
          'Confirmação necessária',
          `Sua conta foi criada! Enviamos um e-mail de ativação para ${email.trim()}.\n\nPor favor, confirme seu e-mail antes de fazer login.`,
          [
            {
              text: 'Ir para o Login',
              onPress: () => onLoginPress && onLoginPress(),
            },
          ]
        );
      } else {
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        if (onRegisterSubmit) {
          onRegisterSubmit(name.trim(), email.trim(), password);
        }
      }
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('already registered') || msg.includes('unique')) {
        Alert.alert('Erro no cadastro', 'Este e-mail já está cadastrado no sistema.');
      } else {
        Alert.alert('Erro no cadastro', msg || 'Não foi possível criar sua conta. Tente novamente.');
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
          <RadialGradient id="registerTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#registerTopGlow)" />
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
            <View style={styles.header}>
              <Text style={styles.title}>Crie sua conta</Text>
              <Text style={styles.subtitle}>
                Comece a organizar suas contas e tarefas coletivas.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome completo</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="user"
                    size={18}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Seu Nome Completo"
                    placeholderTextColor={Colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="mail"
                    size={18}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="seuemail@exemplo.com"
                    placeholderTextColor={Colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="lock"
                    size={18}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Mínimo de 6 caracteres"
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
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar senha</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="shield"
                    size={18}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Repita sua senha"
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

              <View style={styles.termsRow}>
                <TouchableOpacity
                  style={styles.checkboxTouch}
                  activeOpacity={0.8}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  disabled={loading}
                >
                  <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                    {agreeTerms && <Feather name="check" size={11} color={Colors.white} />}
                  </View>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  Li e concordo com os{' '}
                  <Text style={styles.termsLink} onPress={onTermsPress}>
                    Termos de Uso
                  </Text>{' '}
                  e a{' '}
                  <Text style={styles.termsLink} onPress={onPrivacyPress}>
                    Política de Privacidade
                  </Text>
                  .
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                activeOpacity={0.85}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>
                      {googleLinked ? 'Finalizar Cadastro' : 'Cadastrar'}
                    </Text>
                    <Feather name="arrow-right" size={18} color={Colors.white} />
                  </>
                )}
              </TouchableOpacity>

              {onGooglePress && !googleLinked && (
                <>
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ou cadastre-se com</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.googleButton}
                    activeOpacity={0.85}
                    disabled={loading}
                    onPress={async () => {
                      try {
                        setLoading(true);
                        const googleData = await onGooglePress();
                        if (googleData) {
                          if (googleData.name) setName(googleData.name);
                          if (googleData.email) setEmail(googleData.email);
                          setGoogleLinked(true);
                          Alert.alert(
                            'Google conectado!',
                            'Revise seu nome se desejar e defina uma senha para concluir seu cadastro no SplitHouse.'
                          );
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24">
                      <Path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <Path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                      />
                      <Path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                      />
                      <Path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                      />
                    </Svg>
                    <Text style={styles.googleButtonText}>Continuar com Google</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Já possui uma conta?{' '}
                <Text
                  style={styles.loginLink}
                  onPress={onLoginPress}
                >
                  Faça login
                </Text>
              </Text>
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
    marginBottom: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    paddingVertical: 8,
  },
  formContainer: {
    width: '100%',
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
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
  passwordInput: {
    paddingRight: 8,
  },
  eyeButton: {
    padding: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 4,
    paddingHorizontal: 2,
    gap: 8,
  },
  checkboxTouch: {
    paddingTop: 1,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    height: 48,
    gap: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

