# SplitHouse

## Projeto
O SplitHouse é uma aplicação mobile estruturada para centralizar a gestão de despesas e tarefas domésticas em moradias compartilhadas (repúblicas). O foco principal do sistema é substituir o gerenciamento manual por processos automatizados, promovendo transparência, organização financeira, divisão de responsabilidades e convivência harmoniosa entre os moradores de um imóvel.

## Status do Projeto
O projeto está em fase ativa de desenvolvimento.
- **Autenticação e Perfis (#60):** Integrado ao Supabase Auth com persistência de credenciais em armazenamento seguro nativo (SecureStore), criação automática de perfil em PostgreSQL via triggers e recuperação de senha.
- **Home e Tarefas Domésticas (#61):** Integrado ao Supabase com tabelas relacionais (`tarefas` e `validacoes_tarefa`), políticas de segurança por linha (RLS), serviços dedicados (`tasksService` e `homeService`), ciclo de vida de tarefas, auditoria por pares com envio de foto comprobatória e fallback transparente para execução offline.
- **Próximas Etapas:** Integração completa do back-end para gestão de moradias (imóvel, moradores, convites via QR Code) e divisão de despesas financeiras.

## Funcionalidades e Módulos do Sistema
A interface do sistema está estruturada e modularizada em diretórios:
- **Autenticação e Acesso (`src/screens/auth`):** Telas de apresentação (Splash, Welcome), login, cadastro de usuário sincronizado com Supabase, recuperação de senha e gestão de sessão com `AuthContext`.
- **Painel Principal (`src/screens/dashboard`):** Tela inicial com resumo dinâmico do morador, saldo financeiro da casa, próximas tarefas a vencer, atalhos rápidos e métricas da moradia.
- **Tarefas Domésticas (`src/screens/tasks`):** Listagem de afazeres filtrados por status, criação de nova atividade (fixa, rotativa ou emergencial), detalhamento da execução, submissão de foto comprobatória e auditoria/validação por pares (RN-09).
- **Gestão Financeira (`src/screens/finance`):** Lista de contas e despesas coletivas, lançamento de novos gastos com anexo de comprovante, detalhes do rateio, confirmação de liquidações e relatório financeiro mensal consolidado.
- **Gestão da Moradia (`src/screens/house`):** Seleção de imóvel, criação de república, convite via QR Code, administração de moradores, regras de convivência e aprovação de novas solicitações de entrada.
- **Perfil e Convivência (`src/screens/profile`):** Informações do morador, edição cadastral, visualização das regras da casa e fluxo formal de desvinculação/saída do imóvel.
- **Classificação e Gamificação (`src/screens/ranking`):** Acompanhamento de pontuação de experiência (XP), moedas acumuladas por tarefas concluídas e posição no ranking da república.
- **Loja e Recompensas (`src/screens/store`):** Catálogo de recompensas e folgas de tarefas disponíveis para troca por moedas acumuladas, além de proposta de novos benefícios pelos moradores.
- **Notificações (`src/screens/notifications`):** Central de avisos sobre pendências financeiras, tarefas a vencer e solicitações de validação pendentes.

## Tecnologias e Arquitetura
A arquitetura do projeto adota o padrão Cliente-Servidor com separação clara de responsabilidades:
- **Front-end:** React Native, Expo (SDK 57), TypeScript.
- **Estilização e Ícones:** StyleSheet nativo, React Native SVG e `@expo/vector-icons` (Feather).
- **Armazenamento Seguro:** `expo-secure-store` para persistência local criptografada de tokens de sessão.
- **Back-end e Banco de Dados:** Supabase (PostgreSQL 15), Supabase Auth, Row Level Security (RLS) e Supabase Storage.
- **Padrão de Documentação:** Tipagem estrita com TypeScript e documentação formal TSDoc/JSDoc em 100% dos componentes, serviços e esquemas de dados.

## Modelagem do Banco de Dados (Supabase)
O banco de dados relacional foi estruturado em tabelas modulares com Row Level Security (RLS) habilitado:
- `perfis`: Dados cadastrais do morador vinculados ao `auth.users.id`, nome completo, foto de perfil e chave Pix.
- `moradias`: Informações do imóvel compartilhado, endereço e código de convite.
- `membros_moradia`: Relação morador-república, papel de acesso (admin/morador), status de aprovação, nível, XP e saldo de moedas.
- `tarefas`: Afazeres domésticos da moradia (fixa, rotativa ou emergencial), atribuição de responsáveis, prazo, pontos de XP, moedas e status de ciclo de vida.
- `validacoes_tarefa`: Auditoria por pares para tarefas que requerem validação com foto comprobatória, impedindo autovalidação pelo executor (RN-09).
- `despesas`: Registro de contas e despesas coletivas, data de vencimento, pagador e anexos.
- `rateios_despesa`: Divisão da cota-parte de cada morador em cada despesa da moradia.
- `recompensas_loja`: Catálogo de benefícios e vantagens resgatáveis por moedas no imóvel.

### Scripts de Provisionamento SQL
- Os scripts DDL para criação das tabelas e políticas de tarefas encontram-se em `supabase/schema_tarefas_home.sql`. Para provisionar, basta executar o conteúdo do arquivo no **SQL Editor** do dashboard do Supabase.

## Testes Automatizados e Qualidade de Código
O projeto conta com suíte de testes automatizados e verificação estática de tipos:

```bash
npm test
```

O comando executa:
1. **Verificação de Tipos:** `npx tsc --noEmit` garantindo tipagem estrita e ausência de inconsistências em tempo de compilação.
2. **Suíte de Esquema SQL (`tests/schemaValidation.test.js`):** Valida a integridade do arquivo DDL `schema_tarefas_home.sql`, conferindo tabelas, constraints de integridade e políticas RLS.
3. **Suíte de Tarefas (`tests/tasksBusinessLogic.test.js`):** Testa mapeamento de registros, ciclo de vida de validação, aprovação, recusa justificada e bloqueio de autofraude (regra RN-09).
4. **Suíte do Painel Home (`tests/homeDashboardLogic.test.js`):** Testa extração de iniciais de perfis, cálculo de pendências e filtragem prioritária de tarefas para a tela inicial.

## Como Executar a Aplicação

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/AnaLeonidas/SplitHouse.git
cd SplitHouse
npm install
```

### 2. Configurar as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as chaves do seu projeto no Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

### 3. Iniciar o servidor de desenvolvimento Expo
No Linux ou ambientes gerais, execute:

```bash
ELECTRON_DISABLE_SANDBOX=1 npx expo start --tunnel -c
```

Para conexão em rede local direta (mesmo Wi-Fi):
```bash
npx expo start --lan -c
```

### 4. Abrir no dispositivo móvel
- Escaneie o QR Code gerado no terminal usando o aplicativo **Expo Go** no Android ou a câmera nativa no iOS.

## Equipe Desenvolvedora
- Ana Paula Pereira Leonidas
- Camila Moura
- Elder Matheus Maia de Oliveira
- Emanuelly de Almeida e Silva
- Gabriel Lima Pereira
