import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import FileManager from './components/FileManager';

function AppContent() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <FileManager /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
