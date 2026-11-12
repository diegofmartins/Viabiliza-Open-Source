import type { DemoEtp, DemoEtpRecord, DemoUser, DemoAgency, DemoSettings, DemoStorage, SaveEtpInput } from './types';
import { INITIAL_STATE } from '../constants/etpInitialState';

// --- Dados fictícios: 2 ETPs ---

/**
 * ETP 1: Aquisição de notebooks para modernização do atendimento
 * Status: em andamento
 */
export const demoEtpNotebooks: DemoEtpRecord = {
  id: 'demo-etp-notebooks',
  userId: 'demo-user-servidor',
  userEmail: 'servidor@exemplo.gov.br',
  title: 'Aquisição de notebooks para modernização do atendimento',
  data: {
    ...INITIAL_STATE,
    etp_name: 'Aquisição de notebooks para modernização do atendimento',
    diag_problema_necessidade: 'A demanda de atendimento ao público tem crescido significativamente nos últimos anos, exigindo mais equipamentos e pessoal qualificado. O aumento de 40% no fluxo de visitantes tem sobrecarregado a estrutura atual, que possui apenas 50% dos computadores necessários em pleno funcionamento.',
    diag_alternativas_solucao: 'A contratação de notebooks por meio de ata de registro de preços tem se mostrado a alternativa mais vantajosa, permitendo a renovação gradual do parque de máquinas sem necessidade de novo processo licitatório completo. A modalidade de locação também foi considerada, mas descartada por ter custo total maior a longo prazo.',
    diag_objeto_vigencia: 'Aquisição de até 30 (trinta) notebooks com vigência de 24 (vinte e quatro) meses, podendo ser prorrogada por igual período, conforme necessidade da administração.',
    diag_quantidades_valor: 'Orçamento total de R$ 150.000,00 (cento e cinquenta mil reais), com valor unitário estimado de R$ 5.000,00 (cinco mil reais) por notebook.',
    objeto_sucinto: 'Modernização do ambiente de atendimento ao cidadão por meio da aquisição de notebooks para a Secretaria de Administração, visando melhorar a eficiência e a qualidade do serviço prestado à população.',
    especificacoes_tecnicas: 'Notebooks com processador i5 ou equivalente, 8GB de RAM, 256GB de armazenamento SSD, tela de 14 polegadas, bateria de longa duração, sistema operacional Windows 11 Pro ou Linux Ubuntu LTS, garantia de 3 (três) anos.',
    justificativa_necessidade: 'A modernização do atendimento é essencial para garantir a continuidade dos serviços públicos diante do crescimento da demanda. A substituição dos equipamentos antigos por novos notebooks permitirá um atendimento mais ágil e eficiente à população, reduzindo o tempo de espera e aumentando a produtividade das equipes.',
    estimativa_quantidades_texto: '30 (trinta) unidades de notebooks',
    estimativa_valor_texto: 'R$ 150.000,00 (cento e cinquenta mil reais)',
    resultados_pretendidos: 'Redução de 30% no tempo de atendimento ao cidadão; aumento de 25% na produtividade das equipes de apoio; modernização da infraestrutura tecnológica da secretaria.',
    alinhamento_planejamento: 'Este ETP está alinhado ao Pl Plurianual 2024-2026, eixo de modernização tecnológica, meta de digitalização de serviços ao cidadão.',
    unidade_requisitante: 'Secretaria de Administração (exemplo)',
    processo_spae: 'SPAE 0000/2026 (exemplo)',
    data_documento: '2026-11-10',
    include_riscos_interna: true,
    include_riscos_externa: true,
    analise_riscos_resumo: 'Risco principal: possível atraso na entrega dos equipamentos devido à situação de fornecedores no mercado. Mitigação: contratação de fornecedor alternativo e cláusula de penalidade no contrato. Risco secundário: desgaste dos equipamentos antes do fim do período de vigência. Mitigação: plano de manutenção preventiva contratada.',
  } as any,
  status: 'in_progress',
  createdAt: {
    toDate: () => new Date('2026-11-03T13:00:00.000Z'),
    seconds: new Date('2026-11-03T13:00:00.000Z').getTime() / 1000,
    nanoseconds: new Date('2026-11-03T13:00:00.000Z').getTime() % 1000000000,
    toISO: () => new Date('2026-11-03T13:00:00.000Z').toISOString(),
  },
  updatedAt: {
    toDate: () => new Date('2026-11-10T09:15:00.000Z'),
    seconds: new Date('2026-11-10T09:15:00.000Z').getTime() / 1000,
    nanoseconds: new Date('2026-11-10T09:15:00.000Z').getTime() % 1000000000,
    toISO: () => new Date('2026-11-10T09:15:00.000Z').toISOString(),
  },
};

// --- ETP 2: Contratação de manutenção predial preventiva ---
/**
 * ETP 2: Contratação de manutenção predial preventiva
 * Status: concluído
 */
export const demoEtpManutencao: DemoEtpRecord = {
  id: 'demo-etp-manutencao',
  userId: 'demo-user-servidor',
  userEmail: 'servidor@exemplo.gov.br',
  title: 'Contratação de manutenção predial preventiva',
  data: {
    ...INITIAL_STATE,
    etp_name: 'Contratação de manutenção predial preventiva',
    diag_problema_necessidade: 'Os equipamentos de ar-condicionado apresentam falhas frequentes, comprometendo o conforto térmico e a qualidade do ar nos ambientes. A contratação busca assegurar o funcionamento adequado de todos os aparelhos, prolongar sua vida útil e reduzir em 30% os chamados emergenciais.',
    diag_alternativas_solucao: 'A manutenção preventiva e corretiva contínua foi selecionada por ser mais eficaz na prevenção de falhas, otimizando o desempenho dos equipamentos e evitando gastos emergenciais maiores. A alternativa de contratação pontual foi descartada por apresentar risco de falhas não planejadas.',
    diag_objeto_vigencia: 'Prestação de serviços de manutenção preventiva e corretiva em 50 (cinquenta) equipamentos de ar-condicionado (splits e centrais), incluindo mão de obra, peças e componentes. O prazo de vigência será de 24 (vinte e quatro) meses, prorrogável por até 60 (sessenta) meses, por se tratar de serviço contínuo.',
    diag_quantidades_valor: 'A estimativa é de 50 equipamentos, com base no inventário atual. O valor mensal por equipamento para manutenção preventiva e corretiva é de R$ 150,00 (cento e cinquenta reais), resultando em um valor anual estimado de R$ 90.000,00 (noventa mil reais).',
    objeto_sucinto: 'Contratação de empresa especializada em manutenção preventiva e corretiva de sistemas de ar-condicionado, abrangendo 50 equipamentos por um período de 24 meses.',
    especificacoes_tecnicas: 'Os técnicos devem possuir certificação NR-10 e NR-35. A manutenção preventiva deve ser mensal, com relatório detalhado. O tempo máximo de atendimento para chamados corretivos emergenciais é de 4 (quatro) horas, com solução em até 24 (vinte e quatro) horas.',
    justificativa_necessidade: 'A estimativa é de 50 equipamentos, com base no inventário atual. O valor mensal por equipamento para manutenção preventiva e corretiva é de R$ 150,00, resultando em um valor anual estimado de R$ 90.000,00.',
    estimativa_quantidades_texto: '50 (cinquenta) equipamentos',
    estimativa_valor_texto: 'R$ 90.000,00 (noventa mil reais)',
    resultados_pretendidos: 'Redução de 30% no número de chamados emergenciais; aumento da vida útil dos equipamentos em, pelo menos, 40%; melhoria do conforto térmico e da qualidade do ar nos ambientes.',
    alinhamento_planejamento: 'Este ETP está alinhado ao Pl Plurianual 2024-2026, eixo de infraestrutura de edifícios, meta de manutenção predial preventiva.',
    unidade_requisitante: 'Secretaria de Infraestrutura (exemplo)',
    processo_spae: 'SPAE 0001/2026 (exemplo)',
    data_documento: '2026-10-28',
    include_riscos_interna: true,
    include_riscos_externa: true,
    analise_riscos_resumo: 'Risco principal: possível indisponibilidade de peças de reposição no mercado local. Mitigação: exigência de estoque mínimo de peças críticas e prazos de reposição definidos em contrato. Conclusão: A contratação é viável e fundamental para garantir o conforto e a saúde ocupacional.',
  } as any,
  status: 'completed',
  createdAt: {
    toDate: () => new Date('2026-10-01T11:30:00.000Z'),
    seconds: new Date('2026-10-01T11:30:00.000Z').getTime() / 1000,
    nanoseconds: new Date('2026-10-01T11:30:00.000Z').getTime() % 1000000000,
    toISO: () => new Date('2026-10-01T11:30:00.000Z').toISOString(),
  },
  updatedAt: {
    toDate: () => new Date('2026-10-28T16:40:00.000Z'),
    seconds: new Date('2026-10-28T16:40:00.000Z').getTime() / 1000,
    nanoseconds: new Date('2026-10-28T16:40:00.000Z').getTime() % 1000000000,
    toISO: () => new Date('2026-10-28T16:40:00.000Z').toISOString(),
  },
};

// --- Dados fictícios: 3 usuários ---

export const DEMO_USERS: DemoUser[] = [
  {
    uid: 'demo-user-12345',
    email: 'visitante@exemplo.gov.br',
    displayName: 'Visitante da Demonstração',
    role: 'master',
    status: 'approved',
    hasAcceptedTerms: true,
  },
  {
    uid: 'demo-user-servidor',
    email: 'servidor@exemplo.gov.br',
    displayName: 'Servidor de Exemplo',
    role: 'user',
    status: 'approved',
    hasAcceptedTerms: true,
  },
  {
    uid: 'demo-user-pendente',
    email: 'novo.servidor@exemplo.gov.br',
    displayName: 'Novo Servidor',
    role: 'user',
    status: 'pending',
    hasAcceptedTerms: false,
  },
];

// --- Órgão fictício ---

export const DEMO_AGENCY: DemoAgency = {
  name: 'Órgão Público Exemplo',
  logoUrl: '',
};

// --- Configurações fictícias ---

export const DEMO_SETTINGS: DemoSettings = {
  chatWebhookUrl: undefined,
  geminiApiKey: undefined,
};

// --- Função de construção de ETPs para o armazenamento ---

export function buildDemoEtps(): DemoEtpRecord[] {
  return [demoEtpNotebooks, demoEtpManutencao];
}

// --- Helper: converter DemoTimestamp para Date ---

export function timestampToDate(ts: DemoTimestamp): Date {
  return ts.toDate();
}

// Helper: converter Date para DemoTimestamp (usado no seed inicial)

export function dateToTimestamp(d: Date): DemoTimestamp {
  return {
    toDate: () => new Date(d.getTime()),
    seconds: Math.floor(d.getTime() / 1000),
    nanoseconds: d.getTime() % 1000000000,
    toISO: () => d.toISOString(),
  };
}