import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/Header'; // Import Header

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error('Login failed response:', response); // Log the full response
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Could not parse error response as JSON:', jsonError);
          // If response is not JSON, it might be plain text
          const textError = await response.text();
          throw new Error(textError || `Login failed with status: ${response.status}`);
        }
        
        const errorMessage = errorData && errorData.message === 'Invalid Credentials' 
                             ? 'Usuário ou senha incorretos.' 
                             : (errorData && errorData.message) || `Login failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      toast({
        title: 'Success!',
        description: 'Logged in successfully.',
      });
      navigate('/diario'); // Redirect to diary or a dashboard after login
    } catch (error: any) {
      console.error('Login error:', error); // Log the error object
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative"> {/* Add relative here */}
      <Header /> {/* Render Header here */}
      <div className="flex justify-center items-center flex-grow p-4 pt-20"> {/* Add pt-20 */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">Acesse sua conta para gerenciar seu conteúdo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu nome de usuário"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-center text-gray-500 dark:text-gray-400">
            <p>
              Esta é uma área restrita. Se você não possui credenciais, por favor,
              entre em contato com o administrador.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
