// Every federation photo in one place, so news and other sections can share them.
// The files are in public/images/news/, so stories saved in the database can point to them too.
const news = (file) => `/images/news/${file}`

export const photos = {
  gayaniAsianGames: {
    src: news('gayani-asian-games-2026.jpg'),
    alt: 'Asian Games 2026 poster celebrating Gayani Dassanayake’s 28th-place finish in modern pentathlon for Sri Lanka',
  },
  isiwarunaObstacle: {
    src: news('isiwaruna-obstacle-course.jpg'),
    alt: 'Isiwaruna De Silva competing on an obstacle course at Aichi-Nagoya 2026',
  },
  isiwarunaFencing: {
    src: news('isiwaruna-fencing.jpg'),
    alt: 'Isiwaruna De Silva fencing an opponent in the Men’s Individual semifinal',
  },
  national2025Medals: {
    src: news('national-2025-medals.jpg'),
    alt: 'Athletes receive medals at the 2025 National Pentathlon Championship',
  },
  national2025Shooting: {
    src: news('national-2025-shooting.jpg'),
    alt: 'Athletes take part in the shooting discipline at Pearl Bay',
  },
  national2025Running: {
    src: news('national-2025-running.jpg'),
    alt: 'Young athletes compete in a running event at the championship',
  },
  national2025Group: {
    src: news('national-2025-group.jpg'),
    alt: 'Athletes, officials, and guests gather at the 2025 National Pentathlon Championship',
  },
  ccp2025Whiteboard: {
    src: news('ccp-2025-whiteboard.jpg'),
    alt: 'UIPM facilitator leading a coaches course session at a whiteboard',
  },
  ccp2025GroupActivity: {
    src: news('ccp-2025-group-activity.jpg'),
    alt: 'Coaches taking part in a UIPM group activity about event roles',
  },
  ccp2025RunningDrills: {
    src: news('ccp-2025-running-drills.jpg'),
    alt: 'Athletes practising running drills in an indoor sports hall',
  },
  ccp2025Pool: {
    src: news('ccp-2025-pool.jpg'),
    alt: 'Coaches and athletes gathered in a swimming pool during specialized training',
  },
  bali2023Results: {
    src: news('bali-2023-results.jpg'),
    alt: 'UIPM Biathle and Triathle World Championships Bali 2023 results infographic for Sri Lankan athletes',
  },
  ccp2023WarmUp: {
    src: news('ccp-2023-warm-up.jpg'),
    alt: 'Coaches and athletes warm up together outdoors during the January 2023 UIPM Level 1 course',
  },
  ccp2023DrillDemo: {
    src: news('ccp-2023-drill-demo.jpg'),
    alt: 'UIPM facilitator Carina Vicente demonstrates a running drill to a coach',
  },
  ccp2023GroupPhoto: {
    src: news('ccp-2023-group-photo.jpg'),
    alt: 'Carina Vicente and Sri Lankan coaches pose in front of the UIPM Level 1 course presentation',
  },
  ccp2023RunningDrills: {
    src: news('ccp-2023-running-drills.jpg'),
    alt: 'Coaches practise running drills outdoors during the certification programme',
  },
}
