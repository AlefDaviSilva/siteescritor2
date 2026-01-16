import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { Users, PlusCircle, Pencil, Trash2 } from 'lucide-react'; // Import icons
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Import useMutation and useQueryClient
import { getArticles, deleteArticle } from '@/lib/api'; // Import API function
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // Import Button
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // Import alert dialog components

export default function AlienacaoParental() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isAuthenticated = localStorage.getItem('accessToken');

  const { data: articles, isLoading, isError, error } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({ title: 'Sucesso!', description: 'Artigo excluído com sucesso.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao excluir artigo.', variant: 'destructive' });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-16">
          <div className="max-w-2xl mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Alienação Parental
              </h1>
            </div>
            <p className="text-muted-foreground">
              Artigos, links e textos sobre alienação parental — um tema importante que afeta 
              milhares de famílias. Conteúdo próprio e de outros autores, sempre de acesso livre.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => ( // Show 3 skeleton cards
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="h-4 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[150px] mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-16">
          <div className="max-w-2xl mb-12">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Alienação Parental
            </h1>
            <p className="text-muted-foreground">
              Ocorreu um erro ao carregar os artigos: {error?.message}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 pt-28 pb-16">
        {/* Page Header */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Alienação Parental
            </h1>
          </div>
          <p className="text-muted-foreground">
            Artigos, links e textos sobre alienação parental — um tema importante que afeta 
            milhares de famílias. Conteúdo próprio e de outros autores, sempre de acesso livre.
          </p>
          {isAuthenticated && (
            <Button onClick={() => navigate('/alienacao-parental/new')} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Artigo
            </Button>
          )}
        </div>

        {/* Articles Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles?.map((article: any) => (
            <div key={article.id} className="relative group">
              <ArticleCard
                article={article}
                basePath="/alienacao-parental"
              />
              {isAuthenticated && (
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/alienacao-parental/edit/${article.id}`)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente
                          este artigo do servidor.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(article.id)}>Continuar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
