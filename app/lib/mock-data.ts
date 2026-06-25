// Mock data uses the same enum values as the backend API, and the same
// nested Trip + TripStop shape (see new_trip_format.md).
// Only used on the public landing page preview and guest-mode fallbacks;
// all authenticated pages fetch live data.

import { VibeTag, TravelStyle, BudgetLevel, TripPublic, TripStopPublic } from "./types";

export type { VibeTag, TravelStyle, BudgetLevel };

// Mock stops carry lat/lng directly since they're hand-authored — real
// stops resolve coordinates via lib/geocode.ts instead. trip_id/created_at
// are server-assigned fields with no bearing on the mock preview UI.
export type MockTripStop = Omit<TripStopPublic, "trip_id" | "created_at"> & { lat: number; lng: number };
export type MockTrip = Omit<TripPublic, "stops"> & { stops: MockTripStop[] };

export const MOCK_TRIPS: MockTrip[] = [
  // 1 country, 3 cities
  {
    id: 1,
    user_id: 0,
    created_at: "2024-03-15",
    title: "Two weeks in Thailand",
    start_date: "2024-03-15",
    end_date: "2024-03-29",
    travel_style: "solo",
    budget_level: "backpacker",
    is_public: false,
    countries: ["Thailand"],
    stops: [
      {
        id: 101,
        city: "Bangkok",
        country: "Thailand",
        lat: 13.7563,
        lng: 100.5018,
        arrival_date: "2024-03-15",
        departure_date: "2024-03-20",
        vibe: "loved_it",
        notes:
          "The temples at golden hour were unlike anything I'd imagined. Wat Pho in the early morning, before the crowds, felt almost sacred. Street food on Khao San Road at midnight — pad see ew standing up at a cart, sweating pleasantly.",
        highlight: "Wat Pho at sunrise",
        lowlight: "The midday heat on Khao San Road",
        would_return: true,
        order: 0,
      },
      {
        id: 102,
        city: "Chiang Mai",
        country: "Thailand",
        lat: 18.7883,
        lng: 98.9853,
        arrival_date: "2024-03-20",
        departure_date: "2024-03-25",
        vibe: "loved_it",
        notes:
          "Slower than Bangkok in every good way. Mornings at the night-bazaar streets gone quiet, motorbiking up to Doi Suthep before the heat set in, lanterns over the moat during a temple festival.",
        highlight: "Doi Suthep at sunrise",
        lowlight: "Smoky season haze over the mountains",
        would_return: true,
        order: 1,
      },
      {
        id: 103,
        city: "Phuket",
        country: "Thailand",
        lat: 7.8804,
        lng: 98.3923,
        arrival_date: "2024-03-25",
        departure_date: "2024-03-29",
        vibe: "mixed",
        notes:
          "Beautiful water, but the strip near Patong felt like a different country entirely — built for a kind of tourism I'd just spent two weeks avoiding. Worth it for one quiet beach day on Railay though.",
        highlight: "A near-empty cove reached only by longtail boat",
        lowlight: "Patong at night",
        would_return: false,
        order: 2,
      },
    ],
  },
  // 1 country, 1 city
  {
    id: 2,
    user_id: 0,
    created_at: "2023-09-20",
    title: "Lisbon in autumn",
    start_date: "2023-09-20",
    end_date: "2023-09-27",
    travel_style: "couple",
    budget_level: "mid",
    is_public: false,
    countries: ["Portugal"],
    stops: [
      {
        id: 104,
        city: "Lisbon",
        country: "Portugal",
        lat: 38.7223,
        lng: -9.1393,
        arrival_date: "2023-09-20",
        departure_date: "2023-09-27",
        vibe: "loved_it",
        notes:
          "Lisbon has this quality of light that makes everything look slightly melancholic and beautiful at the same time. Pastéis de nata at the original Pastéis de Belém, still warm, dusted with cinnamon.",
        highlight: "Pastéis de Belém, still warm",
        lowlight: "The Alfama hills in the heat",
        would_return: true,
        order: 0,
      },
    ],
  },
  // 3 countries, 1 city each — the Caucasus loop
  {
    id: 3,
    user_id: 0,
    created_at: "2024-05-08",
    title: "The Caucasus loop",
    start_date: "2024-05-08",
    end_date: "2024-05-20",
    travel_style: "solo",
    budget_level: "backpacker",
    is_public: false,
    countries: ["Georgia", "Armenia", "Azerbaijan"],
    stops: [
      {
        id: 105,
        city: "Tbilisi",
        country: "Georgia",
        lat: 41.6938,
        lng: 44.8015,
        arrival_date: "2024-05-08",
        departure_date: "2024-05-12",
        vibe: "loved_it",
        notes:
          "Tbilisi is still secret enough to feel discovered. Natural wine, churchkhela, sulphur baths. The Georgians are perhaps the most generous people I have met.",
        highlight: "Sulphur baths in the old town",
        lowlight: null,
        would_return: true,
        order: 0,
      },
      {
        id: 106,
        city: "Yerevan",
        country: "Armenia",
        lat: 40.1872,
        lng: 44.5136,
        arrival_date: "2024-05-12",
        departure_date: "2024-05-16",
        vibe: "loved_it",
        notes:
          "Mount Ararat hanging over the city on a clear morning is something I wasn't prepared for. Cascade Complex at sunset, brandy that wasn't on any list I'd researched, and a quietness that felt earned rather than empty.",
        highlight: "Ararat visible from the Cascade at dawn",
        lowlight: "Limited late-night transit options",
        would_return: true,
        order: 1,
      },
      {
        id: 107,
        city: "Baku",
        country: "Azerbaijan",
        lat: 40.4093,
        lng: 49.8671,
        arrival_date: "2024-05-16",
        departure_date: "2024-05-20",
        vibe: "mixed",
        notes:
          "The Old City against the Flame Towers at night is genuinely striking. But the contrast with the rest of the trip was sharp — glossier, more curated, less of the texture I'd come to the Caucasus for.",
        highlight: "Old City walls lit up at night",
        lowlight: "Felt more staged than lived-in",
        would_return: false,
        order: 2,
      },
    ],
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
