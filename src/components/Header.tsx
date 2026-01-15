import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Menu, X, LogOut } from 'lucide-react'; // Import LogOut icon
import { Button } from '@/components/ui/button'; // Import Button component

const navItems = [
  { path: '/', label: 'Início' },
  { path: '/textos-pessoais', label: 'Textos Pessoais' },
  { path: '/alienacao-parental', label: 'Alienação Parental' },
  { path: '/diario', label: 'Diário' }, // Removed protected: true
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('accessToken'); // Check for token

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-semibold text-foreground">
            Meus Escritos
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link text-sm font-medium ${
                  location.pathname === item.path ? 'text-foreground' : ''
                } ${item.protected && !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`} // Dim protected links if not authenticated
                onClick={(e) => {
                  if (item.protected && !isAuthenticated) {
                    e.preventDefault();
                    navigate('/login');
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Button variant="ghost" onClick={handleLogout} className="text-sm font-medium">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium ${
                    location.pathname === item.path
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  } ${item.protected && !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={(e) => {
                    if (item.protected && !isAuthenticated) {
                      e.preventDefault();
                      navigate('/login');
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Button variant="ghost" onClick={handleLogout} className="text-sm font-medium justify-start">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
