import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ArticleCard } from '@/components/ArticleCard';
import { mockArticles } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { ArrowRight, Feather, Users, BookOpen } from 'lucide-react';

const sections = [
  {
    title: 'Textos Pessoais',
    description: 'Reflexões, contos e pensamentos de minha autoria',
    icon: Feather,
    path: '/textos-pessoais',
    category: 'personal' as const,
  },
  {
    title: 'Alienação Parental',
    description: 'Artigos e recursos sobre este tema importante',
    icon: Users,
    path: '/alienacao-parental',
    category: 'alienacao' as const,
  },
  {
    title: 'Diário',
    description: 'Meu espaço privado de reflexão',
    icon: BookOpen,
    path: '/diario',
    category: 'diario' as const,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      <main className="container mx-auto px-6 py-16">
        {/* Section Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.path}
                to={section.path}
                className="group bg-card rounded-lg p-6 shadow-sm card-hover border border-border"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  Explorar <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Recent Articles */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-8">
            Publicações Recentes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockArticles
              .filter((a) => a.category !== 'diario')
              .slice(0, 4)
              .map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  basePath={article.category === 'personal' ? '/textos-pessoais' : '/alienacao-parental'}
                />
              ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Meus Escritos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
