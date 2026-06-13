import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { MapPin, BarChart2, LogIn, LogOut, UserPlus, User } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import DetailPage from './pages/DetailPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyOccurrencesPage from './pages/MyOccurrencesPage';

function Navbar() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-100'
    }`;

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-400 text-lg flex-shrink-0">
          <MapPin className="w-5 h-5" />
          <span className="hidden sm:inline">Urban Data Hub</span>
          <span className="sm:hidden">UDH</span>
        </Link>

        <nav className="flex items-center gap-5">
          <NavLink to="/" className={linkClass} end>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Ocorrências</span>
            </span>
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </span>
          </NavLink>
          {user && (
            <NavLink to="/minha-conta" className={linkClass}>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Minha Conta</span>
              </span>
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden md:flex items-center gap-1.5 text-sm text-gray-300 font-medium">
                {user.name.split(' ')[0]}
                {user.isAdmin && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 border border-gray-600 hover:bg-gray-700 text-gray-300 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 border border-gray-600 hover:bg-gray-700 text-gray-300 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
              <Link
                to="/cadastro"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Cadastrar</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registrar" element={<RegisterPage />} />
          <Route path="/ocorrencias/:id" element={<DetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<SignupPage />} />
          <Route path="/minha-conta" element={<MyOccurrencesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
