import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import HomePage from './pages/HomePage';
import QuranPage from './pages/QuranPage';
import NamesPage from './pages/NamesPage';
import AzkarPage from './pages/AzkarPage';
import AboutPage from './pages/AboutPage';
import CalendarPage from './pages/CalendarPage';
import ParentsPage from './pages/ParentsPage';
import TodayPage from './pages/TodayPage';
import EventsPage from './pages/EventsPage';
import MediaPage from './pages/MediaPage';
import SleepPage from './pages/SleepPage';
import IstighfarPage from './pages/IstighfarPage';
import UmrahPage from './pages/UmrahPage';
import HajjPage from './pages/HajjPage';

function App() {
  return (
    <ThemeProvider>
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
              <Route path="/parents" element={<ParentsPage />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/sleep" element={<SleepPage />} />
            <Route path="/istighfar-counter" element={<IstighfarPage />} />
            <Route path="/umrah" element={<UmrahPage />} />
            <Route path="/hajj" element={<HajjPage />} />
            </Routes>
            <Footer />
          <InstallPrompt />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
