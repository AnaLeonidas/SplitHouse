import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Perfil } from '../types/database';

/**
 * Propriedades e métodos disponibilizados pelo contexto global de autenticação.
 */
interface AuthContextData {
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
  signUp: (email: string, password: string, nomeCompleto: string) => Promise<void>;
  /** Encerra a sessão atual do morador no dispositivo */
  signOut: () => Promise<void>;
  /** Dispara e-mail com instruções para redefinição de senha */
  resetPassword: (email: string) => Promise<void>;
  /** Recarrega os dados do perfil do morador a partir do Supabase */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Provedor de contexto responsável pelo ciclo de vida da autenticação no SplitHouse.
 * Gerencia a escuta de alterações de sessão em tempo real, persistência segura no SecureStore
 * e sincronização automática com a tabela de perfis.
 *
 * @param props Componentes filhos que terão acesso ao contexto de autenticação.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Consulta os dados cadastrais do morador na tabela 'perfis' a partir do UUID.
   *
   * @param userId Identificador único do usuário no auth.users.
   */
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Perfil);
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do morador:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nomeCompleto,
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  /**
   * Encerra a sessão ativa do morador e limpa os estados locais de usuário e perfil.
   *
   * @throws {AuthError} Lança erro caso ocorra falha na revogação do token.
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  /**
   * Solicita o envio de e-mail com instruções para redefinição de senha.
   *
   * @param email E-mail cadastrado do morador que deseja recuperar o acesso.
   * @throws {AuthError} Lança erro caso o serviço de e-mail falhe.
   */
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
  };

  /**
   * Atualiza os dados locais do perfil buscando as informações mais recentes na tabela 'perfis'.
   */
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
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
 * @returns {AuthContextData} Dados da sessão ativa, perfil do morador e métodos de autenticação.
 * @throws {Error} Lança erro se for utilizado fora de um AuthProvider.
 */
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}