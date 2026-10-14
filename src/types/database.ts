/**
 * Representação dos dados cadastrais do morador.
 * Mapeia as colunas da tabela relacional 'public.perfis' sincronizada com auth.users via trigger.
 */
export interface Perfil {
  /** Identificador único do usuário (UUID referenciando auth.users.id) */
  id: string;
  /** Nome completo do morador informado no cadastro */
  nome_completo: string;
  /** Endereço de e-mail do morador */
  email: string;
  /** URL pública da foto de avatar armazenada no bucket do Supabase Storage */
  foto_url?: string | null;
  /** Chave Pix cadastrada para recebimento e acerto de despesas */
  chave_pix?: string | null;
  /** Timestamp de registro inicial do perfil na aplicação */
  criado_em?: string;
  /** Timestamp da última atualização cadastral do morador */
  atualizado_em?: string;
}