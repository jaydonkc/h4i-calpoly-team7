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
    bio: "Four-time Olympian in carrying every grocery bag in one trip. Jaydon retired undefeated to teach clean technique, sensible progressions, and the art of looking casual after a very difficult set.",
  },
  {
    name: "Steven Mossman",
    headshot: "/images/coaches/steven-mossman.webp",
    specialties: "Barbell strength",
    bio: "Three-time world champion in picking things up and putting them down. Steven can identify an unracked plate from across the building and believes every good squat deserves a standing ovation.",
  },
  {
    name: "Francis Corpuz",
    headshot: "/images/coaches/francis-corpuz.png",
    specialties: "Mobility & cycling",
    bio: "Gold medalist in stretching before anyone else remembers to. Francis brings calm coaching, smooth transitions, and the rare ability to make a stationary bike feel like a scenic escape.",
  },
  {
    name: "Emi Okumoto",
    headshot: "/images/coaches/emi-okumoto.jpg",
    specialties: "Cardio & rhythm rides",
    bio: "Seven-time Tour de Living Room winner. Emi builds rides around big choruses, adjustable resistance, and the belief that the last interval deserves its own victory lap.",
  },
  {
    name: "Harold Huynh",
    headshot: "/images/coaches/harold-huynh.jpg",
    specialties: "HIIT & conditioning",
    bio: "Former captain of the national sprint-to-the-bus team. Harold makes tough intervals approachable, celebrates every finish, and has never once believed anyone who says they love burpees.",
  },
  {
    name: "Jacob Lee",
    headshot: "/images/coaches/jacob-lee.jpg",
    specialties: "Pilates & recovery",
    bio: "Reigning world champion of the extremely controlled sit-up. Jacob makes low-impact sessions feel surprisingly powerful and treats recovery like the main event it deserves to be.",
  },
] as const;
