import { useState } from 'react';
import { Header } from '@/components/Header';
import { BookOpen, Upload, Download, Trash2, FileText } from 'lucide-react'; // Import icons
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadDiaryEntry, getDiaryEntries, downloadDiaryEntry, deleteDiaryEntry } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

export default function Diario() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: diaryEntries, isLoading, isError, error } = useQuery({
    queryKey: ['diaryEntries'],
    queryFn: getDiaryEntries,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDiaryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
      setSelectedFile(null);
      toast({ title: 'Sucesso!', description: 'Entrada de diário carregada com sucesso.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao carregar entrada de diário.', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDiaryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
      toast({ title: 'Sucesso!', description: 'Entrada de diário excluída com sucesso.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao excluir entrada de diário.', variant: 'destructive' });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    } else {
      toast({ title: 'Aviso', description: 'Por favor, selecione um arquivo para upload.', variant: 'warning' });
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const blob = await downloadDiaryEntry(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Sucesso!', description: `Arquivo "${filename}" baixado.` });
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Falha ao baixar arquivo.', variant: 'destructive' });
    }
  };

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
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Meu Diário
              </h1>
            </div>
            <p className="text-muted-foreground">
              Meu espaço privado de reflexão. Registros trimestrais de pensamentos, 
              acontecimentos e memórias pessoais.
            </p>
          </div>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
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
          <h1 className="font-display text-3xl font-bold text-foreground">
            Meu Diário
          </h1>
          <p className="text-muted-foreground">
            Ocorreu um erro ao carregar as entradas do diário: {error?.message}
          </p>
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
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Meu Diário
            </h1>
          </div>
          <p className="text-muted-foreground">
            Meu espaço privado de reflexão. Registros trimestrais de pensamentos, 
            acontecimentos e memórias pessoais.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
            <Input 
              type="file" 
              accept=".docx" 
              onChange={handleFileChange} 
              className="flex-grow"
            />
            <Button onClick={handleUpload} disabled={!selectedFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Carregando...' : <><Upload className="mr-2 h-4 w-4" /> Carregar DOCX</>}
            </Button>
          </div>
        </div>

        {/* Diary Entries Grid */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diaryEntries?.length === 0 ? (
            <p className="col-span-full text-muted-foreground">Nenhuma entrada de diário encontrada. Carregue seu primeiro DOCX!</p>
          ) : (
            diaryEntries?.map((entry: any) => (
              <div key={entry.id} className="relative group border rounded-lg p-4 bg-card shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground truncate">{entry.filename}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Carregado em: {format(new Date(entry.upload_date), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(entry.filename)}>
                    <Download className="h-4 w-4 mr-2" /> Baixar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente
                          a entrada de diário "{entry.filename}" do servidor.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(entry.id)}>Continuar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
