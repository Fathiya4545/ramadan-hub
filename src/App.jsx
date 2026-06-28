import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import PrayerTimes from './components/PrayerTimes';
import VerseOfDay from './components/VerseOfDay';
import MosqueFinder from './components/MosqueFinder';
import CommunityEvents from './components/CommunityEvents';
import Footer from './components/Footer';

function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <PrayerTimes />
      <VerseOfDay />
      <MosqueFinder />
      <CommunityEvents />
      <Footer />
    </div>
  );
}

export default App;
