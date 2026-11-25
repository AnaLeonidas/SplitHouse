import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Perfil } from '../types/database';

/**
 * Retorno estruturado da operação de cadastro de novo usuário.
 */
export interface SignUpResult {
  /** Usuário criado no Supabase Auth (null se o cadastro falhar) */
  user: User | null;
  /** Sessão autenticada imediata (null quando aguarda confirmação de e-mail) */
  session: Session | null;
  /** Indica se o e-mail já está confirmado ou se aguarda verificação pelo usuário */
  emailConfirmed: boolean;
}

/**
 * Propriedades e métodos disponibilizados pelo contexto global de autenticação.
 */
export interface AuthContextData {
  /** Objeto de usuário autenticado do Supabase Auth */
  user: User | null;
  /** Sessão ativa contendo token JWT e tempo de expiração */
  session: Session | null;
  /** Dados complementares do morador vindos da tabela 'perfis' */
  profile: Perfil | null;
  /** Indica se a restauração inicial da sessão do dispositivo ainda está em andamento */
  loading: boolean;
  /** Realiza a autenticação por e-mail e senha */
  signIn: (email: string, password: string) => Promise<void>;
  /** Cadastra um novo morador e dispara a criação automática do perfil no banco */
  signUp: (
    email: string,
    password: string,
    nomeCompleto: string
  ) => Promise<SignUpResult>;
  /** Encerra a sessão atual do morador no dispositivo */
  signOut: () => Promise<void>;
  /** Dispara e-mail com instruções para redefinição de senha */
  resetPassword: (email: string) => Promise<void>;
  /** Reenvia o e-mail de confirmação de cadastro para a conta */
  resendConfirmationEmail: (email: string) => Promise<void>;
  /** Valida o código/token de recuperação recebido por e-mail */
  verifyRecoveryOtp: (email: string, token: string) => Promise<void>;
  /** Atualiza a senha do morador na sessão de recuperação */
  updatePassword: (newPassword: string) => Promise<void>;
  /** Recarrega os dados do perfil do morador a partir do Supabase */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

/**
 * Propriedades do componente provedor de autenticação.
 */
export interface AuthProviderProps {
  /** Árvore de componentes filhos que terão acesso ao contexto de autenticação */
  children: React.ReactNode;
}

function getEmailRedirectUrl(path: string): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/${path}`;
  }
  return `splithouse://${path}`;
}

/**
 * Provedor de contexto responsável pelo ciclo de vida da autenticação no SplitHouse.
 * Gerencia a escuta de alterações de sessão em tempo real, persistência segura no SecureStore
 * e sincronização automática com a tabela de perfis.
 *
 * @param props Componentes filhos que terão acesso ao contexto de autenticação.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const activeUserIdRef = useRef<string | null>(null);

  /**
   * Consulta os dados cadastrais do morador na tabela 'perfis' a partir do UUID.
   * Cria automaticamente o registro caso ainda não exista no banco.
   *
   * @param userId Identificador único do usuário no auth.users.
   * @param authUser Usuário autenticado usado como fallback de nome/e-mail.
   */
  const fetchProfile = async (userId: string, authUser?: User | null) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (activeUserIdRef.current !== userId) return;

      if (!error && data) {
        setProfile(data as Perfil);
        return;
      }

      if (!data && authUser) {
        const fallbackName =
          String(authUser.user_metadata?.full_name || authUser.user_metadata?.name || '').trim() ||
          authUser.email?.split('@')[0] ||
          'Morador';
        const { data: created } = await supabase
          .from('perfis')
          .upsert(
            {
              id: userId,
              nome_completo: fallbackName,
              email: authUser.email || '',
            },
            { onConflict: 'id' }
          )
          .select('*')
          .maybeSingle();

        if (activeUserIdRef.current === userId && created) {
          setProfile(created as Perfil);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do morador:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        activeUserIdRef.current = currentSession?.user?.id ?? null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user);
        }
      } catch (err) {
        console.warn('Erro ao restaurar sessão inicial:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      activeUserIdRef.current = nextSession?.user?.id ?? null;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await fetchProfile(nextSession.user.id, nextSession.user);
      } else {
        setProfile(null);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Autentica o morador com credenciais de e-mail e senha via Supabase Auth.
   *
   * @param email E-mail cadastrado do morador.
   * @param password Senha de acesso.
   * @throws {AuthError} Lança erro caso as credenciais sejam inválidas.
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  /**
   * Registra um novo morador no Supabase Auth e envia o nome completo nos metadados
   * para acionar o trigger do PostgreSQL que insere o registro na tabela 'perfis'.
   *
   * @param email E-mail válido para a nova conta.
   * @param password Senha de acesso (mínimo de 6 caracteres).
   * @param nomeCompleto Nome completo do morador.
   * @throws {AuthError} Lança erro caso o e-mail já esteja cadastrado.
   */
  const signUp = async (email: string, password: string, nomeCompleto: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nomeCompleto,
        },
        emailRedirectTo: getEmailRedirectUrl('confirm-email'),
      },
    });

    if (error) {
      throw error;
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('User already registered');
    }

    const emailConfirmed = !!(
      data.user &&
      (data.user.confirmed_at || (data.user as any).email_confirmed_at || data.session)
    );

    return {
      user: data.user,
      session: data.session,
      emailConfirmed,
    };
  };

  /**
   * Reenvia o e-mail de ativação e confirmação da conta.
   */
  const resendConfirmationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getEmailRedirectUrl('confirm-email'),
      },
    });
    if (error) {
      throw error;
    }
  };

  /**
   * Encerra a sessão ativa do morador e limpa os estados locais de usuário e perfil.
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Ignora erro de rede e força limpeza local
      }
    } finally {
      activeUserIdRef.current = null;
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  /**
   * Solicita o envio de e-mail com instruções para redefinição de senha.
   *
   * @param email E-mail cadastrado do morador que deseja recuperar o acesso.
   * @throws {AuthError} Lança erro caso o serviço de e-mail falhe.
   */
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getEmailRedirectUrl('reset-password'),
    });
    if (error) {
      throw error;
    }
  };

  /**
   * Valida o token / OTP recebido por e-mail para autorizar a recuperação de senha.
   */
  const verifyRecoveryOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });
    if (error) {
      throw error;
    }
    if (data.session) {
      setSession(data.session);
      setUser(data.user);
    }
  };

  /**
   * Atualiza a senha da conta com a nova credencial informada.
   */
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw error;
    }
  };

  /**
   * Atualiza os dados locais do perfil buscando as informações mais recentes na tabela 'perfis'.
   */
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        resendConfirmationEmail,
        verifyRecoveryOtp,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook customizado para consumir o contexto de autenticação em qualquer tela ou componente.
 *
 * @returns Dados da sessão ativa, perfil do morador e métodos de autenticação.
 * @throws Lança erro se for utilizado fora de um AuthProvider.
 */
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}