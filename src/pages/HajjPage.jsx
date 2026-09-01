import PilgrimageGuide from '../components/PilgrimageGuide';
import { hajjGuide } from '../data/pilgrimage';

export default function HajjPage() {
  return <PilgrimageGuide guide={hajjGuide} />;
}
