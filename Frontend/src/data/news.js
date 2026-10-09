import { photos } from './photos.js'

const hashtag = (name) => ({
  label: `#${name}`,
  href: `https://www.facebook.com/hashtag/${name.toLowerCase()}`,
})

const UIPM = { label: 'UIPM · World Pentathlon', href: 'https://www.facebook.com/WorldPentathlon' }

export const featured = {
  heading: 'Gayani Dassanayake carries Sri Lanka’s pentathlon story to Nagoya',
  tag: 'Asian Games · Modern Pentathlon',
  title: 'From Dematapelessa to Nagoya: a national champion on the Asian stage',
  image: photos.gayaniAsianGames,
  body: [
    'Raised in Dematapelessa, Ampara, Gayani joined the Sri Lanka Air Force at 18 through her swimming ability and began competing as a full-time athlete with its aquatics team. She became National Triathlon Champion in 2016, then National Modern Pentathlon-Triathle Champion in 2019.',
    'After winning the 2025 National Modern Pentathlon Championship in Bandaragama, she represented Sri Lanka at the 2025 World Cup in Egypt, the 2025 Asian Championships in Japan, and the 2026 World Championship in China. Her 2025 performances secured direct qualification for the 2026 Asian Games.',
    'In Nagoya, Gayani placed 28th overall, ahead of competitors from Kuwait, Malaysia, Thailand, and Kyrgyzstan. She was the only woman representing South Asia in the modern pentathlon field, a milestone for Sri Lankan sport and women athletes.',
  ],
  meta: '20th Asian Games · Nagoya, Japan',
  stat: { value: '28th', label: 'overall in Nagoya' },
  links: [
    { label: 'UIPM', href: 'https://www.facebook.com/WorldPentathlon' },
    { label: 'NOC Sri Lanka', href: 'https://www.facebook.com/OlympicLK' },
    { label: 'Youth & Sports', href: 'https://www.facebook.com/moys.srilanka' },
  ],
  milestones: [
    {
      tag: '2016',
      title: 'National Triathlon Champion',
      body: 'Gayani’s national title marked an early milestone in her competitive career.',
    },
    {
      tag: '2019',
      title: 'National Modern Pentathlon-Triathle Champion',
      body: 'She continued her progress across the federation’s national competitions.',
    },
    {
      tag: '2025 · Bandaragama',
      title: 'National Modern Pentathlon Champion',
      body: 'The title preceded her appearances at the World Cup, Asian Championships, World Championship, and Asian Games.',
    },
  ],
}

/*
 * News stories, newest first. `lead` is always shown; `body` + `links` sit behind "Read more".
 * body blocks: { type: 'h4' | 'p', text } or { type: 'list', items: [{ strong, text }] }
 * (list item `text` starts with its own spacing/punctuation, e.g. ', UIPM-certified…').
 */
export const stories = [
  {
    id: 'isiwaruna-nagoya',
    tag: 'Asian Games · Men’s Individual',
    title: 'Isiwaruna De Silva in action in Semi-final B',
    lead: 'Sri Lanka’s Isiwaruna De Silva competed in Semi-final B of the Men’s Individual modern pentathlon at the 20th Asian Games Aichi-Nagoya 2026.',
    body: [],
    links: [
      hashtag('TeamSriLanka'),
      hashtag('NOCSriLanka'),
      hashtag('AsianGames2026'),
      hashtag('ModernPentathlon'),
    ],
    images: [photos.isiwarunaObstacle, photos.isiwarunaFencing],
  },
  {
    id: 'national-championship-2025',
    tag: 'National Championship · 13 September 2025',
    title: 'Minister of Sports attends the National Pentathlon Championship',
    lead: 'It was a great honor for the Modern Pentathlon Federation of Sri Lanka to welcome the Hon. Minister of Sports to the National Pentathlon Championship, held at Pearl Bay Amusement Park on 13 September 2025.',
    body: [],
    links: [UIPM],
    images: [
      photos.national2025Medals,
      photos.national2025Shooting,
      photos.national2025Running,
      photos.national2025Group,
    ],
  },
  {
    id: 'uipm-ccp-2025',
    tag: 'Coaching · 27–31 May 2025',
    title: 'UIPM Coaches Certification Course – Level 1 successfully concluded',
    lead: 'The Modern Pentathlon Federation of Sri Lanka proudly hosted the UIPM Coaches Certification Programme (Level 1), a significant milestone in developing coaching standards for modern pentathlon in Sri Lanka.',
    body: [
      { type: 'h4', text: 'With thanks to our partners' },
      {
        type: 'list',
        items: [
          {
            strong: 'Mr. Liu Shen-Hung',
            text: ', UIPM-certified facilitator, with accommodation generously provided by Cinnamon Grand Colombo.',
          },
          { strong: 'UIPM and AMPC', text: ' for their financial support and global leadership.' },
          { strong: 'Football House', text: ' for hosting the main course.' },
          { strong: 'Department of Sports Development', text: ' for providing training facilities.' },
          { strong: 'Julian Bolling Swimming Academy', text: ' for specialized swimming training.' },
        ],
      },
      {
        type: 'p',
        text: 'This collaboration between international organizations and local sports institutions supports the continued development of modern pentathlon in Sri Lanka. Thank you to all participating coaches for your enthusiasm and dedication in shaping the future of the sport.',
      },
    ],
    links: [
      UIPM,
      hashtag('PentathlonSriLanka'),
      hashtag('UIPM'),
      hashtag('AMPC'),
      hashtag('SportsDevelopment'),
      hashtag('SriLankaSports'),
    ],
    images: [
      photos.ccp2025Whiteboard,
      photos.ccp2025GroupActivity,
      photos.ccp2025RunningDrills,
      photos.ccp2025Pool,
    ],
  },
  {
    id: 'bali-2023',
    tag: 'International debut · 2–5 November 2023',
    title: 'Sri Lankan athletes make their mark in Bali',
    lead: 'Sri Lankan athletes made their debut at the UIPM Biathle/Triathle World Championships in Bali, Indonesia, competing against experienced teams from around the world. Their performances marked an important step for the sport in Sri Lanka, just six years after its introduction.',
    body: [
      { type: 'h4', text: 'Results in Bali' },
      {
        type: 'list',
        items: [
          {
            strong: 'Arusha Hettiarachchi, Under 19:',
            text: ' fourth in Triathle and fifth in Biathle. He finished the Triathle just nine seconds short of bronze.',
          },
          {
            strong: 'Oshada Isiwaruna De Silva, Senior Men:',
            text: ' eighth in Triathle and seventh in Biathle.',
          },
          { strong: 'Ruwansiri Silva, Senior:', text: ' 13th in Triathle and ninth in Biathle.' },
          {
            strong: 'Team leader:',
            text: ' former athlete and modern pentathlon coach Ms. Piumi Krishanthi.',
          },
        ],
      },
      {
        type: 'p',
        text: 'The team’s debut showed the progress made in building an international pathway for Sri Lankan athletes and laid a foundation for the federation’s continued development of the sport.',
      },
    ],
    links: [
      UIPM,
      hashtag('SriLankanAthletes'),
      hashtag('UIPMBiathleTriathleChampionship2023'),
      hashtag('MPFSL'),
      hashtag('TeamSriLanka'),
    ],
    images: [photos.bali2023Results],
  },
  {
    id: 'uipm-ccp-2023',
    tag: 'Coaching · 23–27 January 2023',
    title: 'UIPM CCP Level 1 coaching programme expands Sri Lanka’s coaching base',
    lead: 'The Modern Pentathlon Federation of Sri Lanka successfully conducted a UIPM Coaches Certification Programme (CCP) Level 1 course from 23 to 27 January 2023. UIPM’s Ms. Carina Vicente (Portugal) led the programme, which brought together 15 coaches from across the country.',
    body: [
      { type: 'h4', text: 'Programme partners' },
      {
        type: 'list',
        items: [
          { strong: 'UIPM:', text: ' main sponsor and international programme partner.' },
          { strong: 'Cinnamon Hotels & Resorts:', text: ' official hotel partner.' },
          { strong: 'Department of Sports Development:', text: ' co-sponsor.' },
        ],
      },
      {
        type: 'p',
        text: 'MPFSL’s vision was to bring more coaches into modern pentathlon and build a strong coaching base for the next generation of athletes. The federation thanked all stakeholders for supporting the development of the sport in Sri Lanka.',
      },
    ],
    links: [
      UIPM,
      { label: 'Cinnamon Hotels & Resorts', href: 'https://www.facebook.com/cinnamonhotels' },
      { label: 'MPFSL', href: 'https://www.facebook.com/slmpf' },
      hashtag('ModernPentathlon'),
      hashtag('SriLankaSports'),
    ],
    images: [
      photos.ccp2023WarmUp,
      photos.ccp2023DrillDemo,
      photos.ccp2023GroupPhoto,
      photos.ccp2023RunningDrills,
    ],
  },
]
