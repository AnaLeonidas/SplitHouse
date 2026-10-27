import { supabase } from './supabase';
import { Perfil } from '../types/database';

/**
 * Dados do formulário de edição de perfil (EditProfileScreen).
 */
export interface UpdateProfileInput {
  nomeCompleto: string;
  email: string;
  chavePix: string;
  senhaAtual?: string;
  novaSenha?: string;
}

/**
 * Resultado da atualização do perfil.
 */
export interface UpdateProfileResult {
  /** Indica se a troca de e-mail aguarda confirmação pelo link enviado */
  emailPendente: boolean;
  /** Indica se a senha foi alterada */
  senhaAlterada: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toError(error: { message?: string } | null, fallback: string): Error {
  return new Error(error?.message || fallback);
}

/**
 * Serviço responsável pela leitura e atualização dos dados cadastrais do morador
 * na tabela 'perfis' e das credenciais no Supabase Auth.
 */
export const profileService = {
  /**
   * Busca o perfil de um usuário.
   *
   * @param userId UUID do usuário.
   */
  async getProfile(userId: string): Promise<Perfil | null> {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw toError(error, 'Não foi possível carregar o perfil.');
    }
    return (data as Perfil) || null;
  },

  /**
   * Atualiza nome, chave Pix, e-mail e, opcionalmente, a senha do usuário logado.
   * A troca de senha exige a senha atual, validada por uma nova autenticação.
   *
   * @param input Dados do formulário de edição.
   * @throws {Error} Se os dados forem inválidos ou a gravação falhar.
   */
  async updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('Usuário não autenticado.');
    }
    const authUser = authData.user;

    const nome = input.nomeCompleto.trim();
    const email = input.email.trim().toLowerCase();
    const pix = input.chavePix.trim();
    const novaSenha = input.novaSenha || '';
    const senhaAtual = input.senhaAtual || '';

    if (!nome) {
      throw new Error('O nome não pode ficar em branco.');
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new Error('Informe um e-mail válido.');
    }
    if (novaSenha) {
      if (novaSenha.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
      }
      if (!senhaAtual) {
        throw new Error('Informe sua senha atual para definir uma nova senha.');
      }
      if (senhaAtual === novaSenha) {
        throw new Error('A nova senha deve ser diferente da atual.');
      }
    }

    let senhaAlterada = false;
    if (novaSenha) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: authUser.email || email,
        password: senhaAtual,
      });
      if (reauthError) {
        throw new Error('Senha atual incorreta.');
      }

      const { error: passError } = await supabase.auth.updateUser({ password: novaSenha });
      if (passError) {
        throw toError(passError, 'Não foi possível alterar a senha.');
      }
      senhaAlterada = true;
    }

    const { error: perfilError } = await supabase
      .from('perfis')
      .update({
        nome_completo: nome,
        chave_pix: pix || null,
      })
      .eq('id', authUser.id);
    if (perfilError) {
      throw toError(perfilError, 'Não foi possível salvar os dados do perfil.');
    }

    await supabase.auth.updateUser({ data: { full_name: nome } });

    let emailPendente = false;
    if (email !== (authUser.email || '').toLowerCase()) {
      const { data: updated, error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) {
        throw toError(emailError, 'Não foi possível alterar o e-mail.');
      }

      if (updated.user?.email?.toLowerCase() === email) {
        await supabase.from('perfis').update({ email }).eq('id', authUser.id);
      } else {
        emailPendente = true;
      }
    }

    return { emailPendente, senhaAlterada };
  },
};
