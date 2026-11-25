import { supabase } from './supabase';
import { Perfil } from '../types/database';

/**
 * Dados do formulário de edição de perfil (EditProfileScreen).
 */
export interface UpdateProfileInput {
  /** Nome completo atualizado do morador */
  nomeCompleto: string;
  /** Novo endereço de e-mail do morador */
  email: string;
  /** Chave Pix atualizada para recebimento de rateios */
  chavePix: string;
  /** Senha atual exigida para validar troca de senha (opcional) */
  senhaAtual?: string;
  /** Nova senha desejada para a conta (opcional) */
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

/**
 * Converte erros retornados pelo Supabase em instâncias de `Error` com mensagem amigável.
 *
 * @param error Objeto de erro retornado pelo cliente Supabase.
 * @param fallback Mensagem padrão caso `error.message` esteja ausente.
 * @returns Instância de erro padronizada.
 */
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
      if (!authUser.email) {
        throw new Error('E-mail atual da conta indisponível para validar a senha.');
      }
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: authUser.email,
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
      .upsert(
        {
          id: authUser.id,
          nome_completo: nome,
          email: authUser.email || email,
          chave_pix: pix || null,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    if (perfilError) {
      throw toError(perfilError, 'Não foi possível salvar os dados do perfil.');
    }

    const { error: metaError } = await supabase.auth.updateUser({ data: { full_name: nome } });
    if (metaError) {
      console.warn('profileService.updateProfile aviso metadata:', metaError.message);
    }

    let emailPendente = false;
    if (email !== (authUser.email || '').toLowerCase()) {
      const { data: updated, error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) {
        throw toError(emailError, 'Não foi possível alterar o e-mail.');
      }

      if (updated.user?.email?.toLowerCase() === email) {
        const { error: emailSyncError } = await supabase
          .from('perfis')
          .update({ email, atualizado_em: new Date().toISOString() })
          .eq('id', authUser.id);
        if (emailSyncError) {
          throw toError(emailSyncError, 'Não foi possível sincronizar o e-mail no perfil.');
        }
      } else {
        emailPendente = true;
      }
    }

    return { emailPendente, senhaAlterada };
  },
};
