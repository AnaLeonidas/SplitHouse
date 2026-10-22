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

/**
 * Representação da tabela 'public.tarefas' no Supabase.
 * Mapeia afazeres domésticos da moradia (rotativas, fixas e emergenciais), atribuição e recompensas.
 */
export interface TarefaDB {
  /** Identificador único da tarefa (UUID) */
  id: string;
  /** Identificador da moradia à qual a tarefa pertence */
  moradia_id: string;
  /** Título descritivo da atividade */
  titulo: string;
  /** Descrição detalhada das orientações da tarefa */
  descricao?: string | null;
  /** Cômodo ou ambiente de execução na casa */
  comodo: string;
  /** Tipologia de rotatividade da tarefa */
  tipo: 'Rotativa' | 'Fixa' | 'Emergencial';
  /** UUID do morador atribuído como responsável (referencia public.perfis.id) */
  responsavel_id: string;
  /** Dados do perfil do responsável obtidos via join */
  responsavel?: {
    id?: string;
    nome_completo?: string | null;
  } | null;
  /** Prazo limite de conclusão (timestamptz) */
  prazo_limite: string;
  /** Quantidade de pontos de experiência (XP) concedidos */
  recompensa_xp: number;
  /** Quantidade de moedas distribuídas */
  recompensa_moedas: number;
  /** Indica se a conclusão requer validação por pares com foto */
  requer_validacao: boolean;
  /** Estado atual da tarefa no banco */
  status: 'pendente' | 'em_validacao' | 'concluida' | 'expirada';
  /** UUID do criador da tarefa (referencia public.perfis.id) */
  criado_por?: string | null;
  /** Timestamp de criação do registro */
  criado_em?: string;
  /** Timestamp da última atualização do registro */
  atualizado_em?: string;
}

/**
 * Representação da tabela 'public.validacoes_tarefa' no Supabase.
 * Registra a auditoria por pares da conclusão de tarefas com foto.
 */
export interface ValidacaoTarefaDB {
  /** Identificador único da validação (UUID) */
  id: string;
  /** Identificador da tarefa validada (referencia public.tarefas.id) */
  tarefa_id: string;
  /** UUID do executor da tarefa (referencia public.perfis.id) */
  executor_id: string;
  /** URL pública da foto comprobatória */
  foto_comprovante_url: string;
  /** Data e hora em que a foto foi registrada */
  data_hora_foto?: string;
  /** UUID do morador avaliador (referencia public.perfis.id) */
  validador_id?: string | null;
  /** Parecer da validação */
  status: 'pendente' | 'aprovada' | 'recusada';
  /** Justificativa informada pelo avaliador em caso de recusa */
  justificativa?: string | null;
  /** Timestamp da avaliação */
  validado_em?: string | null;
  /** Timestamp de registro */
  criado_em?: string;
}

/**
 * Dados agregados para exibição no painel principal (Home Dashboard).
 */
export interface HomeDashboardData {
  /** Nome de exibição do usuário logado */
  userName: string;
  /** Iniciais do usuário para avatar */
  userInitials: string;
  /** Nível de gamificação do usuário */
  userLevel: number;
  /** Nome da república */
  houseName: string;
  /** Saldo monetário líquido na casa */
  balanceAmount: string;
  /** Status do saldo (credor ou devedor) */
  balanceStatus: string;
  /** Detalhe de quem deve ao usuário */
  debtorText?: string;
  /** Valor individual devido */
  debtorAmount?: string;
  /** Nome do líder do ranking */
  leaderName: string;
  /** Pontos de XP do líder */
  leaderXp: number;
}

/**
 * Representação da tabela 'public.moradias' no Supabase.
 */
export interface MoradiaDB {
  /** Identificador único da moradia (UUID) */
  id: string;
  /** Nome da casa ou apartamento */
  nome: string;
  /** Endereço do imóvel */
  endereco: string;
  /** Tipologia do imóvel */
  tipo: 'apartamento' | 'casa';
  /** Quantidade estimada de moradores */
  estimativa_moradores?: number | null;
  /** Código de convite no formato SPLIT-0000 */
  codigo_convite: string;
  /** Nome do ciclo financeiro atual */
  nome_ciclo_atual?: string | null;
  /** UUID do usuário criador */
  criado_por?: string | null;
  criado_em?: string;
  atualizado_em?: string;
}

/** Papel do morador dentro da moradia. */
export type PapelMembro = 'admin' | 'morador';

/** Estado do vínculo do morador com a moradia. */
export type StatusMembro = 'pendente' | 'aprovado' | 'recusado' | 'saiu';

/**
 * Representação da tabela 'public.membros_moradia' no Supabase.
 */
export interface MembroMoradiaDB {
  id: string;
  moradia_id: string;
  usuario_id: string;
  papel: PapelMembro;
  status: StatusMembro;
  nivel: number;
  titulo_nivel: string;
  xp: number;
  moedas: number;
  entrou_em?: string | null;
}

/**
 * Vínculo do usuário logado com uma moradia (membro + dados da moradia).
 */
export interface MinhaMoradia {
  /** Id do registro em membros_moradia */
  membro_id: string;
  moradia_id: string;
  nome: string;
  endereco: string;
  tipo: 'apartamento' | 'casa';
  codigo_convite: string;
  nome_ciclo_atual?: string | null;
  papel: PapelMembro;
  status: StatusMembro;
}

/**
 * Morador ou solicitação, já com os dados do perfil.
 */
export interface MembroMoradia extends MembroMoradiaDB {
  nome: string | null;
  email: string | null;
}

/**
 * Representação da tabela 'public.regras_moradia' no Supabase.
 */
export interface RegraMoradiaDB {
  id: string;
  moradia_id: string;
  /** Posição da regra no estatuto */
  numero_ordem: number;
  titulo: string;
  /** Resumo/destaque da regra */
  destaque?: string | null;
  descricao: string;
  /** Nome do ícone Feather */
  nome_icone?: string | null;
  criado_em?: string;
  atualizado_em?: string;
}

/** Dados de uma regra enviados ao backend (criação e edição). */
export interface RegraInput {
  titulo: string;
  destaque?: string;
  descricao: string;
}
