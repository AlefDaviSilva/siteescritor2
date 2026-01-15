import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import TextosPessoais from "./pages/TextosPessoais";
import AlienacaoParental from "./pages/AlienacaoParental";
import Diario from "./pages/Diario";
import ArticleDetail from "./pages/ArticleDetail";
import NotFound from "./pages/NotFound";

import LoginPage from './pages/LoginPage'; // Import LoginPage
import ManagePersonalText from './pages/ManagePersonalText'; // Import ManagePersonalText
import ManageArticle from './pages/ManageArticle'; // Import ManageArticle

const queryClient = new QueryClient();

// A simple authentication checker component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} /> {/* Add login page route */}
          <Route path="/textos-pessoais" element={<TextosPessoais />} />
          <Route 
            path="/textos-pessoais/new" 
            element={
              <ProtectedRoute>
                <ManagePersonalText />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/textos-pessoais/edit/:id" 
            element={
              <ProtectedRoute>
                <ManagePersonalText />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/textos-pessoais/:id" 
            element={
              <ArticleDetail 
                category="personal" 
                backPath="/textos-pessoais" 
                backLabel="Voltar para Textos Pessoais" 
              />
            } 
          />
          <Route path="/alienacao-parental" element={<AlienacaoParental />} />
          <Route 
            path="/alienacao-parental/new" 
            element={
              <ProtectedRoute>
                <ManageArticle />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alienacao-parental/edit/:id" 
            element={
              <ProtectedRoute>
                <ManageArticle />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/alienacao-parental/:id" 
            element={
              <ArticleDetail 
                category="alienacao" 
                backPath="/alienacao-parental" 
                backLabel="Voltar para Alienação Parental" 
              />
            } 
          />
          <Route 
            path="/diario" 
            element={
              <ProtectedRoute>
                <Diario />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/diario/:id" 
            element={
              <ProtectedRoute>
                <ArticleDetail 
                  category="diario" 
                  backPath="/diario" 
                  backLabel="Voltar para Diário" 
                />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
