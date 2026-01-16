import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { PasswordModal } from '@/components/PasswordModal';
import { ArrowLeft, Calendar, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPersonalTextById, getArticleById } from '@/lib/api'; // Import API functions
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ArticleDetailProps {
  category: 'personal' | 'alienacao' | 'diario';
  backPath: string;
  backLabel: string;
}

export default function ArticleDetail({ category, backPath, backLabel }: ArticleDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAttempt, setPasswordAttempt] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const fetchArticle = async () => {
    if (!id) throw new Error('Article ID is missing.');
    switch (category) {
      case 'personal':
        return getPersonalTextById(id, passwordAttempt);
      case 'alienacao':
        return getArticleById(id);
      case 'diario':
        // Diary entries are docx files, not displayed directly here.
        // If this route is intended for diary *content*, then the backend
        // would need to extract text from docx, which is a complex task.
        // For now, redirect or show a message.
        // The user only specified downloading docx.
        throw new Error('Diary entries are not viewable as articles.');
      default:
        throw new Error('Unknown category');
    }
  };

  const { data: article, isLoading, isError, error, refetch } = useQuery({
    queryKey: [category, id, passwordAttempt],
    queryFn: fetchArticle,
    enabled: !!id, // Only fetch if id is available
    retry: false, // Do not retry on password-related 401s
  });

  useEffect(() => {
    if (!id) {
      navigate('/404');
      return;
    }
    if (isError && error.message.includes('Password required')) {
      setShowPasswordModal(true);
    } else if (isError && error.message !== 'Password required for this text.') {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }, [id, isError, error, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-16">
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            {backLabel}
          </Link>
          <article className="max-w-3xl mx-auto">
            <header className="mb-8">
              <Skeleton className="aspect-[16/9] w-full rounded-lg mb-6" />
              <Skeleton className="h-4 w-[200px] mb-4" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-[80%] mb-2" />
            </header>
            <div className="prose prose-lg max-w-none">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[90%] mb-2" />
            </div>
          </article>
        </main>
      </div>
    );
  }

  if (isError && !error.message.includes('Password required')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-16">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Error
          </h1>
          <p className="text-muted-foreground">
            Ocorreu um erro ao carregar o artigo: {error?.message}
          </p>
          <Link to={backPath} className="text-primary hover:underline">
            Voltar
          </Link>
        </main>
      </div>
    );
  }

  if (!article && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-16">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Artigo Não Encontrado
          </h1>
          <p className="text-muted-foreground">
            O artigo que você está procurando não existe.
          </p>
          <Link to={backPath} className="text-primary hover:underline">
            Voltar
          </Link>
        </main>
      </div>
    );
  }

  // Handle case for diary category where content is not displayed as text
  if (category === 'diario') {
     return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-16">
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            {backLabel}
          </Link>
          <article className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Visualização de Diário Indisponível
            </h1>
            <p className="text-muted-foreground mb-6">
              Entradas de diário são arquivos DOCX e não podem ser visualizadas diretamente aqui.
              Por favor, acesse a página do diário para gerenciar e baixar seus arquivos.
            </p>
            <Button onClick={() => navigate('/diario')}>Ir para Diário</Button>
          </article>
        </main>
      </div>
    );
  }


  const needsPassword = article?.is_private && !passwordAttempt;

  const handlePasswordSubmit = (submittedPassword: string) => {
    setPasswordAttempt(submittedPassword);
    setShowPasswordModal(false);
    // useQuery will automatically refetch with the new passwordAttempt
    return true; // Indicate that submission was handled
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 pt-28 pb-16">
        {/* Back Link */}
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          {backLabel}
        </Link>

        <article className="max-w-3xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            {/* The image logic needs to be revisited if we don't have mock data
                For now, a placeholder or removal is appropriate.
            <div className="aspect-[16/9] rounded-lg overflow-hidden mb-6">
              <img
                src={imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            */}
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              {/* Date is not provided by the current backend schema for personal texts/articles
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} />
                {article.date} 
              </span>
              */}
              {article?.is_private && (
                <span className="inline-flex items-center gap-1 bg-locked/20 text-locked px-2 py-0.5 rounded-md text-xs font-medium">
                  <Lock size={12} />
                  Protegido
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {article?.title}
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {article?.synopsis}
            </p>
          </header>

          {/* Article Content */}
          {needsPassword ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                Conteúdo Protegido
              </h2>
              <p className="text-muted-foreground mb-6">
                Este texto requer uma senha para ser lido. O título e sinopse estão visíveis acima.
              </p>
              <Button
                onClick={() => setShowPasswordModal(true)}
              >
                Desbloquear Texto
              </Button>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {article?.content}
              </p>
            </div>
          )}
        </article>
      </main>

      {article?.is_private && (
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordSubmit}
          title={article?.title || 'Conteúdo Protegido'}
        />
      )}
    </div>
  );
}
