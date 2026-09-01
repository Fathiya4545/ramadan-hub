// Full Umrah and Hajj guides.
//
// Each step carries its own supplications with Arabic, transliteration and
// meaning, because a pilgrim reading this is usually trying to say the words
// correctly, not just recall the order of the rites.
//
// Rulings differ between the schools of fiqh, and accidental violations,
// illness and menstruation all have their own rulings — every page ends by
// telling the reader to confirm with a qualified scholar or their official
// guide rather than treating an app as the final authority.

export const umrahGuide = {
  key: 'umrah',
  title: 'Umrah',
  arabic: 'العُمْرَة',
  tagline: 'The lesser pilgrimage — performed at any time of year',
  intro:
    'Umrah may be performed at any time of the year. It consists of entering Ihram at the Miqat, Tawaf around the Ka‘bah, Sa‘i between Safa and Marwah, and shaving or shortening the hair.',
  steps: [
    {
      title: 'Prepare before the Miqat',
      bullets: [
        'Take a shower (ghusl).',
        'Clip the nails and remove unwanted body hair before making the intention.',
        'Men wear two clean Ihram cloths.',
        'Women wear normal modest Islamic clothing.',
        'Avoid applying perfume after entering Ihram.',
      ],
      note: 'A menstruating woman may enter Ihram and recite the Talbiyah, but waits until she is pure before performing Tawaf.',
    },
    {
      title: 'Make the intention at the Miqat',
      intro: 'The intention is made in the heart. The pilgrim may say:',
      duas: [
        {
          label: 'Intention for Umrah',
          arabic: 'لَبَّيْكَ عُمْرَةً',
          transliteration: 'Labbayka ‘Umrah',
          meaning: 'O Allah, I answer Your call to perform Umrah.',
        },
        {
          label: 'The Talbiyah',
          arabic:
            'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
          transliteration:
            'Labbayka Allahumma labbayk. Labbayka la sharika laka labbayk. Innal-hamda wan-ni‘mata laka wal-mulk. La sharika lak.',
          meaning:
            'Here I am, O Allah, here I am. You have no partner. All praise, blessings and sovereignty belong to You. You have no partner.',
        },
      ],
      note: 'Men recite the Talbiyah aloud; women recite it quietly enough to hear themselves.',
    },
    {
      title: 'Enter Al-Masjid Al-Haram',
      intro: 'Enter with the right foot and say:',
      duas: [
        {
          label: 'On entering the mosque',
          arabic: 'بِسْمِ اللهِ، اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
          transliteration: 'Bismillah. Allahumma salli ‘ala Muhammad. Allahumma iftah li abwaba rahmatik.',
          meaning:
            'In Allah’s name. O Allah, send blessings upon Muhammad. O Allah, open the doors of Your mercy for me.',
        },
      ],
      note: 'Stop reciting the Talbiyah when you begin Tawaf.',
    },
    {
      title: 'Perform Tawaf',
      bullets: [
        'Be in a state of wudu.',
        'Keep the Ka‘bah on your left.',
        'Begin at the Black Stone.',
        'Say “Allahu Akbar” when starting each round.',
        'Walk around the Ka‘bah seven times.',
        'Do not push or hurt people to reach the Black Stone.',
        'Men may uncover the right shoulder during this Tawaf, and walk briskly during the first three rounds when it is safe to do so.',
        'Women walk normally and remain fully covered.',
      ],
      intro: 'Between the Yemeni Corner and the Black Stone, say:',
      duas: [
        {
          label: 'Between the Yemeni Corner and the Black Stone',
          arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
          transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina ‘adhaban-nar.',
          meaning:
            'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
        },
      ],
      note: 'There is no required special du‘a for each round of Tawaf. You may read Qur’an, make personal du‘a, say dhikr, or ask Allah for forgiveness.',
    },
    {
      title: 'Pray after Tawaf',
      bullets: [
        'Cover both shoulders.',
        'Pray two rak‘ahs behind Maqam Ibrahim if possible.',
        'Do not block or disturb other pilgrims.',
        'Drink Zamzam and make du‘a.',
      ],
    },
    {
      title: 'Perform Sa‘i',
      intro: 'At Safa, recite once:',
      duas: [
        {
          label: 'At Safa',
          arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللهِ',
          transliteration: 'Inna As-Safa wal-Marwata min sha‘a’irillah.',
          meaning: 'Indeed, Safa and Marwah are among the symbols of Allah.',
        },
        {
          label: 'Facing the Qiblah',
          arabic: 'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ',
          transliteration: 'Allahu Akbar, Allahu Akbar, Allahu Akbar.',
          meaning: 'Allah is the Greatest, Allah is the Greatest, Allah is the Greatest.',
        },
        {
          label: 'Then say',
          arabic:
            'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
          transliteration:
            'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ‘ala kulli shay’in qadir.',
          meaning:
            'There is no god but Allah alone, without partner. His is the dominion and His is all praise, and He is capable of all things.',
        },
      ],
      afterDuas: 'Make a personal du‘a, and repeat the dhikr and du‘a three times. Then:',
      bullets: [
        'Walk from Safa to Marwah — this is round 1.',
        'Marwah to Safa is round 2.',
        'Continue until completing seven rounds.',
        'The seventh round ends at Marwah.',
        'Men may walk quickly between the green markers.',
        'Women walk normally.',
        'Make dhikr and personal du‘as while walking.',
      ],
    },
    {
      title: 'Cut the hair',
      bullets: [
        'Men shave the entire head, or shorten the hair from all parts of the head. Shaving is preferred.',
        'Women cut approximately 1–2 centimetres from the ends of their hair.',
      ],
      note: 'Umrah is now complete, and the restrictions of Ihram end.',
    },
  ],
  prohibitions: {
    intro: 'After making the intention for Hajj or Umrah, pilgrims must not:',
    general: [
      'Cut or intentionally remove hair',
      'Clip the fingernails or toenails',
      'Apply perfume to the body or clothing',
      'Have sexual intercourse or sexual contact',
      'Enter into a marriage contract',
      'Hunt land animals',
      'Argue, use obscene language, or commit sins',
      'Harm, push, or endanger other pilgrims',
    ],
    men: [
      'Do not cover the head with something fitted directly on it',
      'Do not wear shirts, trousers, underwear, or other fitted garments around the body or limbs',
    ],
    women: [
      'Do not wear a fitted niqab or gloves while in Ihram',
      'Do not expose the hair or body',
    ],
  },
  compensationNote:
    'Accidental actions, medical needs and violations can carry different rulings or compensation. Ask a qualified scholar or your official Hajj guide when this happens. The Qur’an commands pilgrims to complete Hajj and Umrah and explains some of the compensation rules.',
  sources: [
    { label: 'Official Nusuk Umrah guide', url: 'https://umrah.nusuk.sa/Journey' },
    { label: 'Qur’an 2:196–197', url: 'https://quran.com/al-baqarah/196-203' },
  ],
};

export const hajjGuide = {
  key: 'hajj',
  title: 'Hajj',
  arabic: 'الحَجّ',
  tagline: 'The fifth pillar — performed in Dhul-Hijjah',
  intro:
    'This guide follows Hajj Tamattu‘, the common form for pilgrims travelling from outside Makkah. The pilgrim performs Umrah, cuts the hair, leaves Ihram, and waits until the eighth day of Dhul-Hijjah.',
  steps: [
    {
      title: 'Before the days of Hajj',
      bullets: [
        'Perform Umrah.',
        'Cut the hair.',
        'Leave Ihram.',
        'Wait until the eighth day of Dhul-Hijjah.',
      ],
    },
    {
      title: 'Day 1 — 8 Dhul-Hijjah: Mina',
      bullets: [
        'Enter Ihram again from your current location.',
        'Recite the Talbiyah frequently.',
        'Travel to Mina.',
        'Pray Dhuhr, Asr, Maghrib, Isha, and the next Fajr in Mina.',
        'The four-rak‘ah prayers are shortened to two, but prayers are not normally combined in Mina.',
      ],
      intro: 'Make the intention for Hajj:',
      duas: [
        {
          label: 'Intention for Hajj',
          arabic: 'لَبَّيْكَ حَجًّا',
          transliteration: 'Labbayka Hajjan',
          meaning: 'O Allah, I answer Your call to perform Hajj.',
        },
      ],
    },
    {
      title: 'Day 2 — 9 Dhul-Hijjah: Arafah',
      bullets: [
        'Travel to Arafah after sunrise.',
        'Pray Dhuhr and Asr shortened and combined.',
        'Remain within Arafah until sunset.',
        'Make sincere du‘a, repent, remember Allah, and ask for forgiveness.',
      ],
      intro: 'A recommended dhikr is:',
      duas: [
        {
          label: 'Dhikr at Arafah',
          arabic:
            'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
          transliteration:
            'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ‘ala kulli shay’in qadir.',
          meaning:
            'There is no god but Allah alone, without partner. His is the dominion and His is all praise, and He is capable of all things.',
        },
      ],
      note: 'Standing at Arafah is an essential pillar of Hajj.',
    },
    {
      title: 'Night of 9 Dhul-Hijjah: Muzdalifah',
      intro: 'After sunset:',
      bullets: [
        'Leave Arafah calmly.',
        'Travel to Muzdalifah.',
        'Pray Maghrib and Isha together.',
        'Spend the night in Muzdalifah.',
        'Pray Fajr, and make dhikr and du‘a.',
        'Collect small pebbles for the Jamarat.',
      ],
      note: 'People who are elderly, sick or vulnerable, and those caring for them, may have special allowances.',
    },
    {
      title: 'Day 3 — 10 Dhul-Hijjah: Eid Day',
      intro: 'Perform these actions:',
      ordered: [
        'Throw seven pebbles at Jamarat Al-Aqabah.',
        'Say “Allahu Akbar” with each pebble.',
        'Offer the required sacrifice for Hajj Tamattu‘.',
        'Shave or shorten the hair.',
        'Leave most Ihram restrictions.',
        'Travel to Makkah and perform Tawaf Al-Ifadah.',
        'Perform Sa‘i between Safa and Marwah.',
      ],
      note: 'Sexual relations remain prohibited until Tawaf Al-Ifadah and the required rites for complete release from Ihram are finished.',
    },
    {
      title: 'Days 4–6 — 11, 12 and possibly 13 Dhul-Hijjah',
      intro: 'Stay in Mina and throw seven pebbles at each Jamarah, in order:',
      ordered: ['Small Jamarah', 'Middle Jamarah', 'Large Jamarah'],
      bullets: [
        'Say “Allahu Akbar” with every pebble.',
        'Make du‘a after the small and middle Jamarah.',
        'Do not stop for du‘a after the large Jamarah.',
      ],
      note: 'A pilgrim may leave Mina on the 12th before sunset, or remain through the 13th.',
    },
    {
      title: 'Farewell Tawaf',
      intro: 'Before leaving Makkah:',
      bullets: [
        'Perform seven rounds of Tawaf Al-Wada‘.',
        'This should be the final major act in Makkah.',
        'Menstruating and postpartum women are excused from the Farewell Tawaf.',
      ],
    },
  ],
  prohibitions: {
    intro: 'The Ihram prohibitions apply throughout. After making the intention, pilgrims must not:',
    general: [
      'Cut or intentionally remove hair',
      'Clip the fingernails or toenails',
      'Apply perfume to the body or clothing',
      'Have sexual intercourse or sexual contact',
      'Enter into a marriage contract',
      'Hunt land animals',
      'Argue, use obscene language, or commit sins',
      'Harm, push, or endanger other pilgrims',
    ],
    men: [
      'Do not cover the head with something fitted directly on it',
      'Do not wear shirts, trousers, underwear, or other fitted garments around the body or limbs',
    ],
    women: [
      'Do not wear a fitted niqab or gloves while in Ihram',
      'Do not expose the hair or body',
    ],
  },
  compensationNote:
    'Accidental actions, medical needs and violations can carry different rulings or compensation. Ask a qualified scholar or your official Hajj guide when this happens.',
  sources: [
    { label: 'Saudi Ministry of Hajj and Umrah', url: 'https://haj.gov.sa/en/Hajj' },
    { label: 'Qur’an 2:196–197', url: 'https://quran.com/al-baqarah/196-203' },
  ],
};

export const guides = [umrahGuide, hajjGuide];
