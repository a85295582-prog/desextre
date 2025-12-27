import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Catalog } from './components/Catalog';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { useTheme } from './hooks/useTheme';


// Função que remove elementos flutuantes com estilos específicos
const removeFloating = () => {
  document.querySelectorAll('[style^="position: fixed"][style*="bottom: 1rem"][style*="z-index: 2147483647"]').forEach(el => el.remove());
};

// Executa a função imediatamente ao carregar
removeFloating();

// Observa mudanças no DOM e reaplica a função se novos elementos forem adicionados
const observer = new MutationObserver(removeFloating);
observer.observe(document.body, { childList: true, subtree: true })



function AppContent() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const { user, loading } = useAuth();
  useTheme();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-extreme-green-500"></div>
      </div>
    );
  }

  if (isAdminRoute) {
    if (!user) {
      return <AdminLogin />;
    }
    return <AdminPanel onBackClick={() => setIsAdminRoute(false)} />;
  }

  return <Catalog onAdminClick={() => setIsAdminRoute(true)} showAdminButton={true} />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
