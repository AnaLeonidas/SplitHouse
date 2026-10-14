export interface Perfil {
  id: string;
  nome_completo: string;
  email: string;
  foto_url?: string | null;
  chave_pix?: string | null;
  criado_em?: string;
  atualizado_em?: string;
}