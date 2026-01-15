import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createArticle, updateArticle, getArticleById } from '@/lib/api';

export default function ManageArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [link, setLink] = useState('');

  const isEditMode = !!id;

  const { data: existingArticle, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticleById(id as string),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && existingArticle) {
      setTitle(existingArticle.title || '');
      setContent(existingArticle.content || '');
      setAuthor(existingArticle.author || '');
      setLink(existingArticle.link || '');
    }
  }, [isEditMode, existingArticle]);

  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({ title: 'Sucesso!', description: 'Artigo criado com sucesso.' });
      navigate('/alienacao-parental');
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao criar artigo.', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', id] });
      toast({ title: 'Sucesso!', description: 'Artigo atualizado com sucesso.' });
      navigate('/alienacao-parental');
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao atualizar artigo.', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, content, author, link };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoadingArticle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-16">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {isEditMode ? 'Editando Artigo' : 'Novo Artigo'}
          </h1>
          <p>Carregando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pt-28 pb-16">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">
          {isEditMode ? 'Editando Artigo' : 'Novo Artigo'}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} required />
          </div>
          <div>
            <Label htmlFor="author">Autor (Opcional)</Label>
            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="link">Link Original (Opcional)</Label>
            <Input id="link" type="url" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEditMode ? 'Atualizar Artigo' : 'Criar Artigo'}
          </Button>
        </form>
      </main>
    </div>
  );
}
