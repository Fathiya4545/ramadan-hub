import PilgrimageGuide from '../components/PilgrimageGuide';
import { umrahGuide } from '../data/pilgrimage';

export default function UmrahPage() {
  return <PilgrimageGuide guide={umrahGuide} />;
}
