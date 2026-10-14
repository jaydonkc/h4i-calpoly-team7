export const gymLocations = [
  { name: "San Luis Obispo", region: "California", hours: "Mon-Fri: 7AM-10PM, Sun/Sat: 8AM-9PM" },
  { name: "Los Angeles", region: "California", hours: "Mon-Fri: 7AM-10PM, Sun/Sat: 8AM-9PM" },
  { name: "San Francisco", region: "California", hours: "Mon-Fri: 7AM-10PM, Sun/Sat: 8AM-9PM" },
] as const;

export const coachHeadshots: Readonly<Record<string, string>> = {
  "Jaydon Chen": "/images/coaches/jaydon-chen.jpg",
  "Steven Mossman": "/images/coaches/steven-mossman.webp",
  "Francis Corpuz": "/images/coaches/francis-corpuz.png",
  "Emi Okumoto": "/images/coaches/emi-okumoto.jpg",
  "Harold Huynh": "/images/coaches/harold-huynh.jpg",
  "Jacob Lee": "/images/coaches/jacob-lee.jpg",
};
