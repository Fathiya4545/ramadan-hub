import alafasyImg from '../assets/shekh Mashari.JPG';
import sudaisImg from '../assets/Abdurrahmaan As-Sudais .JPG';
import husaryImg from '../assets/Mahmoud Khalil Al-Husary JPG.JPG';
import abdulsamadImg from '../assets/Abdul Basit Abdul Samad.JPG';
import shaatreeImg from '../assets/Abu Bakr Ash-Shaatree.JPG';
import hudhaifyImg from '../assets/Ali Al-Hudhaify — hudhaify.JPG';
import shuraymImg from '../assets/Saood Ash-Shuraym — shuraym..JPG';
import basfarImg from '../assets/Abdullah Basfar.JPG';
import ajamyImg from '../assets/Ahmed ibn Ali Al-Ajamy .JPG';
import abdirahmanImg from '../assets/Abdirahman Ali Sufi.JPG';
import noreenImg from '../assets/Noreen Mohamed Siddiq.JPG';
import omarHishamImg from '../assets/Omar Al Hisham.JPG';
import maherImg from '../assets/Maher Al Mueaqly.JPG';

// Surahs with a verified, working recording in the public archive for this reciter.
// The rest aren't published anywhere yet, so we show "not available" instead of failing silently.
const OMAR_HISHAM_AVAILABLE_SURAHS = new Set([
  1, 12, 14, 16, 17, 18, 19, 20, 22, 25, 32, 36, 40, 44, 49, 50, 51, 52, 53, 54,
  55, 56, 58, 59, 61, 62, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79,
  80, 81, 82, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
  101, 102, 103, 104, 105, 106, 107, 109, 110, 111, 112, 113, 114,
]);

export const reciters = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', bitrate: 128, hasFullSurahAudio: true, hasAudio: true, image: alafasyImg },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahmaan As-Sudais', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: sudaisImg },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: maherImg },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: husaryImg },
  { id: 'ar.abdulsamad', name: 'Abdul Basit Abdul Samad', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: abdulsamadImg },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: shaatreeImg },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: hudhaifyImg },
  { id: 'ar.saoodshuraym', name: 'Saood Ash-Shuraym', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: shuraymImg },
  { id: 'ar.abdullahbasfar', name: 'Abdullah Basfar', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: basfarImg },
  { id: 'ar.ahmedajamy', name: 'Ahmed ibn Ali Al-Ajamy', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: ajamyImg },
  {
    id: 'abdirahman-ali-sufi',
    name: 'Abdirahman Ali Sufi',
    bitrate: null,
    hasFullSurahAudio: true,
    hasAudio: true,
    image: abdirahmanImg,
    customFullSurahUrl: (surahNumber) =>
      `https://download.quranicaudio.com/quran/abdurrashid_sufi/${String(surahNumber).padStart(3, '0')}.mp3`,
  },
  {
    id: 'noreen-mohammed-siddiq',
    name: 'Noreen Mohammed Siddiq',
    bitrate: null,
    hasFullSurahAudio: true,
    hasAudio: true,
    image: noreenImg,
    customFullSurahUrl: (surahNumber) =>
      `https://ia803201.us.archive.org/8/items/noreen-sedeeq/${String(surahNumber).padStart(3, '0')}.mp3`,
  },
  {
    id: 'omar-hisham-al-arabi',
    name: 'Omar Hisham Al Arabi',
    bitrate: null,
    hasFullSurahAudio: true,
    hasAudio: true,
    image: omarHishamImg,
    availableSurahs: OMAR_HISHAM_AVAILABLE_SURAHS,
    customFullSurahUrl: (surahNumber) =>
      `https://archive.org/download/Omar-Hisham/${String(surahNumber).padStart(3, '0')}.mp3`,
  },
];

export function ayahAudioUrl(reciter, globalAyahNumber) {
  return `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/${reciter.id}/${globalAyahNumber}.mp3`;
}

export function fullSurahAudioUrl(reciter, surahNumber) {
  if (reciter.customFullSurahUrl) {
    return reciter.customFullSurahUrl(surahNumber);
  }
  return `https://cdn.islamic.network/quran/audio-surah/${reciter.bitrate}/${reciter.id}/${surahNumber}.mp3`;
}
