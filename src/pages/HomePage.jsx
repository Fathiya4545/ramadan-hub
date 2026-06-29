import Hero from '../components/Hero';
import Features from '../components/Features';
import PrayerTimes from '../components/PrayerTimes';
import QiblaFinder from '../components/QiblaFinder';
import VerseOfDay from '../components/VerseOfDay';
import SleepStories from '../components/SleepStories';
import MosqueFinder from '../components/MosqueFinder';
import CommunityEvents from '../components/CommunityEvents';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <PrayerTimes />
      <QiblaFinder />
      <VerseOfDay />
      <SleepStories />
      <MosqueFinder />
      <CommunityEvents />
    </>
  );
}
