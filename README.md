# SplitHouse

## Projeto
O SplitHouse é uma aplicação mobile estruturada para centralizar a gestão de despesas e tarefas domésticas em moradias compartilhadas. O foco principal do sistema é substituir
o gerenciamente manual por processos automatizados, promovendo transparência, organização financeira e operacional entre os moradores de um imóvel.

## Status do Projeto
O projeto está em fase de desenvolvimento. A etapa atual consiste na modelagem do banco de dados. A integração com o Back-end e testes estão planejadas para as próximas entregas do cronograma.

## Funcionalidades/Telas do Sistema
A interface atual está modularizada em pastas:
- Autenticação e Acesso (auth): Telas de abertura, login, cadastro de usuário e recuperação de senha.
- Painel Principal (finance): Módulo contendo a lista de despesas, cadastro de nova conta, detalhes do rateio, acerto de contas. confirmação de pagamentos e relatório financeiro mensal.
- Gestão de Imóvel (house): Fluxos de seleção, criação e entrada em uma casa, geração de convite via código QR, gerenciamento de moradores, tela de solicitações pendentes
e configuração inicial de regras.
- Notificações (notifications): Tela de avisos sobre pendências financeiras e operacionais da casa.
- Perfil e Regras (profile): Área do usuário contendo edição de perfil, visualização e edição das regras de convivência da casa, e o fluxo de saída do imóvel.
- Classificação (ranking): Tela para acompanhamento da pontuação, experiência e posição dos moradores no ranking do imóvel.
- Loja e Recompensas (store): Interface da loja da casa e tela para propor novas recompensas a partir dos pontos acumulados.
- Tarefas Domésticas (tasks): Lista geral de afazeres, cadastro de nova atividade, detalhamento de execuções e validação de tarefas feitas por outros moradores.

## Tecnologias e Arquitetura
A arquitetura do projeto segue o padrão Cliente-Servidor (MVC). As ferramentas definidas para o ecossistema incluem:
- Front-end: React Native, Expo, TypeScript e Expo Router. Responsável pela renderização nativa, captura de entradas e rotas de navegação.
- Back-end e Banco de Dados: Supabase (PostgreSQL). Responsável pelo gerenciamento de autenticação, persistência relacional de dados e armazenamento de mídias (Storage).
- Prototipação: Figma.

## Modelagem do Banco de Dados (Supabase)
O banco de dados relacional foi estruturado em tabelas modulares para atender aos fluxos operacionais, financeiros e de gamificação da moradia:
- perfis: Dados cadastrais dos moradores vinculados à autenticação, chave Pix e foto de perfil.
- moradias: Informações cadastrais do imóvel compartilhado, endereço, tipo e código de convite via QR Code.
- membros_moradia: Relação entre usuários e repúblicas, permissões de acesso (admin/morador), status de aprovação e progresso no ranking (nível, XP e moedas).
- regras_moradia: Estatuto e regras de convivência estabelecidas para a casa.
- despesas: Registro de contas coletivas da moradia, valores, datas de vencimento, pagador e anexos de faturas.
- rateios_despesa: Divisão da cota-parte de cada morador em uma despesa e respectivo status de pagamento.
- pagamentos_acerto: Registro de liquidação de saldos e transferências entre moradores, aguardando confirmação do credor.
- historico_atividades: Linha do tempo e registro de movimentações recentes da república (RN-11).
- tarefas: Afazeres domésticos da moradia (rotativas, fixas e emergenciais), atribuição de responsáveis, prazos e recompensas.
- validacoes_tarefa: Auditoria e validação de conclusão de tarefas via foto por pares, sem autoconfirmação (RN-09).
- recompensas_loja: Catálogo de benefícios e folgas de tarefas disponíveis para troca por moedas acumuladas.
- resgates_recompensa: Histórico de resgate de itens e benefícios da loja da casa.
- notificacoes: Central de alertas, lembretes de vencimento, cutucadas amigáveis e avisos de validação.
- transferencias_admin: Controle de solicitação e aceite de posse de administração na saída de um morador líder.

## Como Executar a Aplicação (Front-end)
1. Faça o clone do repositório para o seu ambiente local.
2. Acesse a pasta raiz do projeto através do terminal.
3. Instale as dependências executando o comando npm install (ou yarn install).
4. Inicie o servidor do Expo com o comando npx expo start --tunnel.
5. Leia o QR Code gerado no terminal utilizando o aplicativo Expo Go em um aparelho físico ou no emulador.

## Equipe Desenvolvedora
- Ana Paula Pereira Leonidas
- Camila Moura
- Elder Matheus Maia de Oliveira
- Emanuelly de Almeida e Silva
- Gabriel Lima Pereira
