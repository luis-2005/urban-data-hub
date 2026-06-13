import 'dotenv/config';
import { connectDatabase } from './config/database';
import { Occurrence } from './models/Occurrence';

const seedData = [
  {
    title: 'Buraco grande na Av. São Paulo',
    description: 'Buraco de aproximadamente 1 metro de diâmetro no meio da via, risco de acidentes para motoristas e ciclistas.',
    category: 'buraco_via',
    neighborhood: 'Centro',
    address: 'Av. São Paulo, 500',
    status: 'aberta',
    statusHistory: [{ status: 'aberta', changedAt: new Date() }],
  },
  {
    title: 'Poste sem iluminação na Rua das Flores',
    description: 'Poste apagado há mais de duas semanas, rua completamente escura à noite, gerando insegurança para moradores.',
    category: 'iluminacao',
    neighborhood: 'Jardim Paulistano',
    address: 'Rua das Flores, 120',
    status: 'em_andamento',
    statusHistory: [
      { status: 'aberta', changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { status: 'em_andamento', changedAt: new Date(), note: 'Equipe de manutenção agendada' },
    ],
  },
  {
    title: 'Descarte irregular de entulho no Parque',
    description: 'Grande quantidade de entulho de obra descartada ilegalmente próximo ao parque municipal, bloqueando a calçada.',
    category: 'descarte_residuos',
    neighborhood: 'Vila Hortência',
    address: 'Rua do Parque, s/n',
    status: 'resolvida',
    statusHistory: [
      { status: 'aberta', changedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { status: 'em_andamento', changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), note: 'Coleta agendada' },
      { status: 'resolvida', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Entulho recolhido pela prefeitura' },
    ],
  },
  {
    title: 'Calçada danificada com raízes expostas',
    description: 'Raízes de árvore levantaram as placas da calçada, criando risco de queda especialmente para idosos e pessoas com deficiência.',
    category: 'calcada_danificada',
    neighborhood: 'Éden',
    address: 'Rua Ipê Amarelo, 340',
    status: 'aberta',
    statusHistory: [{ status: 'aberta', changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }],
  },
  {
    title: 'Alagamento recorrente no cruzamento',
    description: 'A cada chuva forte, o cruzamento fica completamente alagado por horas. Problema de drenagem crônico no local.',
    category: 'alagamento',
    neighborhood: 'Wanel Ville',
    address: 'Cruzamento das Ruas Alfa e Beta',
    status: 'em_andamento',
    statusHistory: [
      { status: 'aberta', changedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
      { status: 'em_andamento', changedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), note: 'Estudo técnico de drenagem em andamento' },
    ],
  },
  {
    title: 'Sinalização apagada na rotatória',
    description: 'Placas de sinalização da rotatória estão completamente apagadas e sem retroreflexão, causando confusão no trânsito noturno.',
    category: 'sinalizacao',
    neighborhood: 'Jardim Paulistano',
    address: 'Rotatória da Av. Central',
    status: 'aberta',
    statusHistory: [{ status: 'aberta', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }],
  },
  {
    title: 'Acúmulo de lixo irregular na esquina',
    description: 'Moradores estão descartando lixo doméstico em local não autorizado, gerando mau cheiro e proliferação de animais.',
    category: 'descarte_residuos',
    neighborhood: 'Centro',
    address: 'Esquina da Rua XV com Rua Dom Pedro',
    status: 'cancelada',
    statusHistory: [
      { status: 'aberta', changedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { status: 'cancelada', changedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), note: 'Duplicata - ocorrência já registrada anteriormente' },
    ],
  },
  {
    title: 'Buracos em série na rua principal',
    description: 'Mais de cinco buracos consecutivos na via principal do bairro, trecho de aproximadamente 200 metros em péssimas condições.',
    category: 'buraco_via',
    neighborhood: 'Wanel Ville',
    address: 'Rua Principal do Bairro, 800 a 1000',
    status: 'em_andamento',
    statusHistory: [
      { status: 'aberta', changedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { status: 'em_andamento', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Obra de recapeamento aprovada e iniciada' },
    ],
  },
];

async function seed(): Promise<void> {
  await connectDatabase();

  console.log('Limpando dados existentes...');
  await Occurrence.deleteMany({});

  console.log('Inserindo dados de exemplo...');
  await Occurrence.insertMany(seedData);

  console.log(`✓ ${seedData.length} ocorrências inseridas com sucesso!`);
  process.exit(0);
}

seed().catch((error) => {
  console.error('Erro ao executar seed:', error);
  process.exit(1);
});
