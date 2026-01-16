export interface Article {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  date: string;
  category: 'personal' | 'alienacao' | 'diario';
  isProtected: boolean;
  password?: string;
  imageUrl?: string;
}

export const mockArticles: Article[] = [
  // Textos Pessoais
  {
    id: 'personal-1',
    title: 'Reflexões sobre o Tempo',
    synopsis: 'Uma meditação sobre como percebemos a passagem do tempo e as memórias que construímos ao longo da vida.',
    content: 'O tempo é uma construção curiosa. Passamos a vida tentando capturá-lo, medi-lo, controlá-lo, mas ele sempre escapa por entre nossos dedos como areia fina...',
    date: '15 de Janeiro, 2025',
    category: 'personal',
    isProtected: false,
    imageUrl: 'writing'
  },
  {
    id: 'personal-2',
    title: 'Cartas que Nunca Enviei',
    synopsis: 'Uma coleção de pensamentos guardados, palavras não ditas e sentimentos que ficaram no papel.',
    content: 'Existe algo libertador em escrever cartas que sabemos que nunca serão lidas...',
    date: '10 de Janeiro, 2025',
    category: 'personal',
    isProtected: true,
    password: '1234',
    imageUrl: 'writing'
  },
  {
    id: 'personal-3',
    title: 'O Silêncio das Manhãs',
    synopsis: 'Sobre encontrar paz nos momentos de quietude, antes que o mundo desperte.',
    content: 'Há uma qualidade especial no silêncio das primeiras horas da manhã...',
    date: '5 de Janeiro, 2025',
    category: 'personal',
    isProtected: true,
    password: 'aurora',
    imageUrl: 'writing'
  },

  // Alienação Parental
  {
    id: 'alienacao-1',
    title: 'O que é Alienação Parental?',
    synopsis: 'Uma introdução ao conceito de alienação parental, suas características e impactos na vida das crianças e famílias.',
    content: 'A alienação parental é uma forma de abuso emocional que ocorre quando um dos genitores manipula a criança para rejeitar o outro genitor...',
    date: '12 de Janeiro, 2025',
    category: 'alienacao',
    isProtected: false,
    imageUrl: 'family'
  },
  {
    id: 'alienacao-2',
    title: 'Sinais de Alienação Parental',
    synopsis: 'Como identificar os principais sinais de que uma criança está sendo vítima de alienação parental.',
    content: 'Reconhecer os sinais de alienação parental é o primeiro passo para proteger as crianças...',
    date: '8 de Janeiro, 2025',
    category: 'alienacao',
    isProtected: false,
    imageUrl: 'family'
  },
  {
    id: 'alienacao-3',
    title: 'Lei da Alienação Parental no Brasil',
    synopsis: 'Um panorama da legislação brasileira sobre alienação parental e como ela protege as famílias.',
    content: 'A Lei 12.318/2010 define a alienação parental e estabelece medidas para coibi-la...',
    date: '3 de Janeiro, 2025',
    category: 'alienacao',
    isProtected: false,
    imageUrl: 'family'
  },

  // Diário
  {
    id: 'diario-1',
    title: 'Janeiro - Março 2025',
    synopsis: 'Registro pessoal do primeiro trimestre de 2025.',
    content: 'Dia 1 de Janeiro: Um novo ano começa com promessas de mudança...',
    date: 'Janeiro 2025',
    category: 'diario',
    isProtected: true,
    imageUrl: 'diary'
  },
  {
    id: 'diario-2',
    title: 'Outubro - Dezembro 2024',
    synopsis: 'Registro pessoal do último trimestre de 2024.',
    content: 'As festas de fim de ano sempre trazem uma mistura de alegria e melancolia...',
    date: 'Outubro 2024',
    category: 'diario',
    isProtected: true,
    imageUrl: 'diary'
  }
];

export const DIARY_PASSWORD = 'diario2025';
