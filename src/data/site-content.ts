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
    bio: "Really buff.",
  },
  {
    name: "Steven Mossman",
    headshot: "/images/coaches/steven-mossman.webp",
    specialties: "Barbell strength",
    bio: "Really strong.",
  },
  {
    name: "Francis Corpuz",
    headshot: "/images/coaches/francis-corpuz.png",
    specialties: "Mobility & cycling",
    bio: "Really flexible.",
  },
  {
    name: "Emi Okumoto",
    headshot: "/images/coaches/emi-okumoto.jpg",
    specialties: "Cardio & rhythm rides",
    bio: "Really fast.",
  },
  {
    name: "Harold Huynh",
    headshot: "/images/coaches/harold-huynh.jpg",
    specialties: "HIIT & conditioning",
    bio: "Really fit.",
  },
  {
    name: "Jacob Lee",
    headshot: "/images/coaches/jacob-lee.jpg",
    specialties: "Hot yoga",
    bio: "Really flexible.",
  },
] as const;
