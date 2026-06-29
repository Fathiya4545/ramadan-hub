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

export const reciters = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', bitrate: 128, hasFullSurahAudio: true, hasAudio: true, image: alafasyImg },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahmaan As-Sudais', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: sudaisImg },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', bitrate: 64, hasFullSurahAudio: false, hasAudio: true, image: null },
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
