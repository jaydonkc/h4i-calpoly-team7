// Shared gym locations and coach biographies.
export const gymLocations = [
  {
    name: "San Luis Obispo",
    region: "The Central Coast flagship",
    address: "1 Main Character Way, San Luis Obispo",
    hours: "Mon–Fri 7 AM–10 PM · Sat–Sun 8 AM–9 PM",
    vibe: "Big lifts, small-town energy, and a suspiciously competitive water fountain.",
  },
  {
    name: "Los Angeles",
    region: "The Sunset strength club",
    address: "24 Plot Armor Boulevard, Los Angeles",
    hours: "Mon–Fri 7 AM–10 PM · Sat–Sun 8 AM–9 PM",
    vibe: "Every set gets a dramatic soundtrack. Paparazzi must rerack their weights.",
  },
  {
    name: "San Francisco",
    region: "The Bay Area training lab",
    address: "404 Leg Day Lane, San Francisco",
    hours: "Mon–Fri 7 AM–10 PM · Sat–Sun 8 AM–9 PM",
    vibe: "Progressive overload, excellent coffee, and absolutely no pitch decks between sets.",
  },
] as const;

export const coaches = [
  {
    name: "Jaydon Chen",
    headshot: "/images/coaches/jaydon-chen.jpg",
    specialties: "Strength & functional fitness",
    bio: "Jaydon teaches strength and functional fitness. Come for the workout, stay because he said “one more set” three sets ago.",
  },
  {
    name: "Steven Mossman",
    headshot: "/images/coaches/steven-mossman.webp",
    specialties: "Barbell strength",
    bio: "Steven is your guy for squats, deadlifts, and bench press. He will spot you, but he will also ask why you skipped leg day.",
  },
  {
    name: "Francis Corpuz",
    headshot: "/images/coaches/francis-corpuz.png",
    specialties: "Mobility & cycling",
    bio: "Francis teaches mobility and cycling. If you make a noise every time you stand up, he would like a word.",
  },
  {
    name: "Emi Okumoto",
    headshot: "/images/coaches/emi-okumoto.jpg",
    specialties: "Cardio & rhythm rides",
    bio: "Emi runs cardio and rhythm rides. You can turn down the resistance, but she is not turning down the music.",
  },
  {
    name: "Harold Huynh",
    headshot: "/images/coaches/harold-huynh.jpg",
    specialties: "HIIT & conditioning",
    bio: "Harold teaches HIIT and conditioning. His idea of a break is a slightly easier exercise.",
  },
  {
    name: "Jacob Lee",
    headshot: "/images/coaches/jacob-lee.jpg",
    specialties: "Hot yoga",
    bio: "Jacob teaches hot yoga. Bring water, a towel, and realistic expectations about how good your balance is.",
  },
] as const;
