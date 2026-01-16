import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createPersonalText, updatePersonalText, getPersonalTextById } from '@/lib/api';

export default function ManagePersonalText() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');

  const isEditMode = !!id;

  const { data: existingText, isLoading: isLoadingText } = useQuery({
    queryKey: ['personalText', id],
    queryFn: () => getPersonalTextById(id as string),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && existingText) {
      setTitle(existingText.title || '');
      setSynopsis(existingText.synopsis || '');
      setContent(existingText.content || '');
      setIsPrivate(existingText.is_private || false);
      setPassword(existingText.password || '');
    }
  }, [isEditMode, existingText]);

  const createMutation = useMutation({
    mutationFn: createPersonalText,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalTexts'] });
      toast({ title: 'Sucesso!', description: 'Texto pessoal criado com sucesso.' });
      navigate('/textos-pessoais');
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao criar texto pessoal.', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updatePersonalText(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalTexts'] });
      queryClient.invalidateQueries({ queryKey: ['personalText', id] });
      toast({ title: 'Sucesso!', description: 'Texto pessoal atualizado com sucesso.' });
      navigate('/textos-pessoais');
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao atualizar texto pessoal.', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, synopsis, content, is_private: isPrivate, password: isPrivate ? password : null };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoadingText) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-28 pb-16">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {isEditMode ? 'Editando Texto Pessoal' : 'Novo Texto Pessoal'}
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
          {isEditMode ? 'Editando Texto Pessoal' : 'Novo Texto Pessoal'}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="synopsis">Sinopse</Label>
            <Textarea id="synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} required />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="isPrivate" checked={isPrivate} onCheckedChange={(checked) => setIsPrivate(checked as boolean)} />
            <Label htmlFor="isPrivate">Proteger com senha?</Label>
          </div>
          {isPrivate && (
            <div>
              <Label htmlFor="password">Senha para acesso</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={isPrivate} />
            </div>
          )}
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {isEditMode ? 'Atualizar Texto' : 'Criar Texto'}
          </Button>
        </form>
      </main>
    </div>
  );
}
