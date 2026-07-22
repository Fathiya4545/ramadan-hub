import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import QuranPage from './pages/QuranPage';
import NamesPage from './pages/NamesPage';
import AzkarPage from './pages/AzkarPage';
import AboutPage from './pages/AboutPage';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quran" element={<QuranPage />} />
            <Route path="/names" element={<NamesPage />} />
            <Route path="/azkar" element={<AzkarPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
