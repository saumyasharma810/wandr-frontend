// Mock data uses the same enum values as the backend API.
// Only used on the public landing page preview; all authenticated pages fetch live data.

import { VibeTag, TravelStyle, BudgetLevel } from "./types";

export type { VibeTag, TravelStyle, BudgetLevel };

export type MockTrip = {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string;
  vibe: VibeTag;
  notes: string;
  travel_style: TravelStyle;
  budget_level: BudgetLevel;
  companions: string;
  highlights: string[];
};

export const MOCK_TRIPS: MockTrip[] = [
  {
    id: "1",
    city: "Bangkok",
    country: "Thailand",
    lat: 13.7563,
    lng: 100.5018,
    date: "2024-03-15",
    vibe: "loved_it",
    notes:
      "The temples at golden hour were unlike anything I'd imagined. Wat Pho in the early morning, before the crowds, felt almost sacred. Street food on Khao San Road at midnight — pad see ew standing up at a cart, sweating pleasantly.",
    travel_style: "solo",
    budget_level: "backpacker",
    companions: "Solo",
    highlights: ["Wat Pho", "Floating markets", "Chatuchak weekend market"],
  },
  {
    id: "2",
    city: "Lisbon",
    country: "Portugal",
    lat: 38.7223,
    lng: -9.1393,
    date: "2023-09-20",
    vibe: "loved_it",
    notes:
      "Lisbon has this quality of light that makes everything look slightly melancholic and beautiful at the same time. Pastéis de nata at the original Pastéis de Belém, still warm, dusted with cinnamon.",
    travel_style: "couple",
    budget_level: "mid",
    companions: "Couple",
    highlights: ["Alfama district", "Belém tower", "LX Factory"],
  },
  {
    id: "3",
    city: "Tbilisi",
    country: "Georgia",
    lat: 41.6938,
    lng: 44.8015,
    date: "2024-05-08",
    vibe: "loved_it",
    notes:
      "Tbilisi is still secret enough to feel discovered. Natural wine, churchkhela, sulphur baths. The Georgians are perhaps the most generous people I have met.",
    travel_style: "solo",
    budget_level: "backpacker",
    companions: "Solo",
    highlights: ["Old town balconies", "Sulphur baths", "Narikala fortress"],
  },
];

export const MOCK_CHAT: Array<{ id: string; role: "user" | "assistant"; content: string; citations?: string[] }> = [
  {
    id: "m1",
    role: "user",
    content: "Best street food neighbourhoods in Bangkok?",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Yaowarat (Chinatown) is the obvious answer — grilled oyster omelettes and shark fin soup stalls that have been there for decades. But if you want less tourist density, try Sukhumvit Soi 38 in the evenings: pad thai, mango sticky rice, boat noodles all within 50 metres. Chatuchak weekend market has a whole section of vendors that's genuinely local and chronically underrated.",
    citations: ["Bangkok", "Thailand"],
  },
  {
    id: "m3",
    role: "user",
    content: "Is Tbilisi safe for solo travel?",
  },
  {
    id: "m4",
    role: "assistant",
    content:
      "Very. Georgia consistently ranks among the safest countries in Europe for solo travellers. Petty crime is low, locals are famously hospitable, and the old town is walkable at any hour. The one practical note: traffic is chaotic — cross streets carefully. For solo women, the same rules apply as anywhere, but nothing about Tbilisi specifically stands out as a concern.",
    citations: ["Tbilisi", "Georgia"],
  },
  {
    id: "m5",
    role: "user",
    content: "Lisbon or Porto — which should I do first?",
  },
  {
    id: "m6",
    role: "assistant",
    content:
      "Do Lisbon first. It's bigger, more varied, and sets the cultural baseline — azulejos, pastel de nata, fado. Once you have that context, Porto reads as a more concentrated, slightly rougher version of the same soul, which makes it more interesting. If you only have time for one: Porto, but that's a different question.",
    citations: ["Lisbon", "Portugal"],
  },
];

export const VIBE_CONFIG: Record<
  VibeTag,
  { label: string; bg: string; text: string; dot: string; mapColor: string; mapColorLight: string; mapColorDark: string }
> = {
  loved_it: {
    label: "Loved it",
    bg: "#FFF3DC",
    text: "#9A6B00",
    dot: "#C9A84C",
    mapColor: "#C9A84C",
    mapColorLight: "#ECD47E",
    mapColorDark: "#8A6D28",
  },
  mixed: {
    label: "Mixed",
    bg: "#FFF0E0",
    text: "#8A5500",
    dot: "#C4873B",
    mapColor: "#C4873B",
    mapColorLight: "#E0AA68",
    mapColorDark: "#7A5018",
  },
  never_again: {
    label: "Never again",
    bg: "#FDEAEA",
    text: "#8A3535",
    dot: "#B5696A",
    mapColor: "#B5696A",
    mapColorLight: "#D49490",
    mapColorDark: "#7A3838",
  },
  neutral: {
    label: "Neutral",
    bg: "#EEF1F4",
    text: "#4A6070",
    dot: "#8C9BAA",
    mapColor: "#8C9BAA",
    mapColorLight: "#B8C4CE",
    mapColorDark: "#5A6B7A",
  },
};
