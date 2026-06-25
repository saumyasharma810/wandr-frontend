// City name → [longitude, latitude] lookup for map pins.
// The backend doesn't return coordinates, so we resolve them client-side.
// City lookup is case-insensitive. Returns null if city is unknown.

type Coords = [number, number]; // [lng, lat]

const CITY_COORDS: Record<string, Coords> = {
  // Asia
  bangkok: [100.5018, 13.7563],
  "chiang mai": [98.9853, 18.7883],
  "ho chi minh city": [106.6297, 10.8231],
  saigon: [106.6297, 10.8231],
  hanoi: [105.8412, 21.0278],
  "kuala lumpur": [101.6869, 3.1390],
  singapore: [103.8198, 1.3521],
  bali: [115.1889, -8.4095],
  jakarta: [106.8456, -6.2088],
  tokyo: [139.6503, 35.6762],
  kyoto: [135.7681, 35.0116],
  osaka: [135.5023, 34.6937],
  seoul: [126.9780, 37.5665],
  beijing: [116.4074, 39.9042],
  shanghai: [121.4737, 31.2304],
  "hong kong": [114.1694, 22.3193],
  taipei: [121.5654, 25.0330],
  mumbai: [72.8777, 19.0760],
  delhi: [77.2090, 28.6139],
  "new delhi": [77.2090, 28.6139],
  kolkata: [88.3639, 22.5726],
  chennai: [80.2707, 13.0827],
  bangalore: [77.5946, 12.9716],
  kathmandu: [85.3240, 27.7172],
  colombo: [79.8612, 6.9271],
  dhaka: [90.4125, 23.8103],
  islamabad: [73.0479, 33.6844],
  karachi: [67.0011, 24.8607],
  lahore: [74.3587, 31.5204],
  kabul: [69.2075, 34.5553],
  tehran: [51.3890, 35.6892],
  dubai: [55.2708, 25.2048],
  "abu dhabi": [54.3773, 24.4539],
  muscat: [58.5922, 23.5880],
  doha: [51.5310, 25.2854],
  riyadh: [46.6753, 24.6877],
  amman: [35.9106, 31.9522],
  beirut: [35.4960, 33.8886],
  jerusalem: [35.2137, 31.7683],
  "tel aviv": [34.7818, 32.0853],
  istanbul: [28.9784, 41.0082],
  ankara: [32.8597, 39.9334],
  tbilisi: [44.8015, 41.6938],
  yerevan: [44.5136, 40.1872],
  baku: [49.8671, 40.4093],
  tashkent: [69.2401, 41.2995],
  almaty: [76.9286, 43.2220],

  // Europe
  london: [-0.1276, 51.5074],
  paris: [2.3522, 48.8566],
  berlin: [13.4050, 52.5200],
  amsterdam: [4.9041, 52.3676],
  rome: [12.4964, 41.9028],
  milan: [9.1900, 45.4654],
  venice: [12.3155, 45.4408],
  florence: [11.2558, 43.7696],
  barcelona: [2.1734, 41.3851],
  madrid: [3.7038, 40.4168],
  lisbon: [-9.1393, 38.7223],
  porto: [-8.6291, 41.1579],
  prague: [14.4378, 50.0755],
  vienna: [16.3738, 48.2082],
  budapest: [19.0402, 47.4979],
  warsaw: [21.0122, 52.2297],
  krakow: [19.9450, 50.0647],
  athens: [23.7275, 37.9838],
  thessaloniki: [22.9444, 40.6401],
  sofia: [23.3219, 42.6977],
  bucharest: [26.1025, 44.4268],
  belgrade: [20.4489, 44.7866],
  zagreb: [15.9819, 45.8150],
  ljubljana: [14.5058, 46.0569],
  dubrovnik: [18.0944, 42.6507],
  split: [16.4402, 43.5081],
  stockholm: [18.0686, 59.3293],
  oslo: [10.7522, 59.9139],
  copenhagen: [12.5683, 55.6761],
  helsinki: [24.9384, 60.1699],
  reykjavik: [-21.9426, 64.1466],
  edinburgh: [-3.1883, 55.9533],
  dublin: [-6.2603, 53.3498],
  brussels: [4.3517, 50.8503],
  zurich: [8.5417, 47.3769],
  geneva: [6.1432, 46.2044],
  bern: [7.4474, 46.9480],
  munich: [11.5820, 48.1351],
  hamburg: [9.9937, 53.5511],
  frankfurt: [8.6821, 50.1109],
  cologne: [6.9603, 50.9333],
  moscow: [37.6173, 55.7558],
  "saint petersburg": [30.3158, 59.9343],
  riga: [24.1052, 56.9496],
  tallinn: [24.7536, 59.4370],
  vilnius: [25.2797, 54.6872],
  minsk: [27.5615, 53.9045],
  kyiv: [30.5238, 50.4501],
  lviv: [24.0297, 49.8397],

  // Africa
  cairo: [31.2357, 30.0444],
  marrakech: [-7.9811, 31.6295],
  marrakesh: [-7.9811, 31.6295],
  fes: [-5.0078, 34.0181],
  casablanca: [-7.5898, 33.5731],
  tunis: [10.1815, 36.8065],
  algiers: [3.0588, 36.7538],
  tripoli: [13.1913, 32.8872],
  nairobi: [36.8219, -1.2921],
  addis: [38.7578, 8.9806],
  "addis ababa": [38.7578, 8.9806],
  kampala: [32.5825, 0.3476],
  dar: [39.2083, -6.7924],
  "dar es salaam": [39.2083, -6.7924],
  lagos: [3.3792, 6.5244],
  accra: [-0.2057, 5.6037],
  abuja: [7.3986, 9.0765],
  dakar: [-17.4441, 14.7167],
  capetown: [18.4241, -33.9249],
  "cape town": [18.4241, -33.9249],
  johannesburg: [28.0473, -26.2041],
  zanzibar: [39.3587, -6.1659],
  kigali: [30.0619, -1.9441],

  // Americas
  "new york": [-74.0059, 40.7128],
  "new york city": [-74.0059, 40.7128],
  nyc: [-74.0059, 40.7128],
  "los angeles": [-118.2437, 34.0522],
  "san francisco": [-122.4194, 37.7749],
  chicago: [-87.6298, 41.8781],
  miami: [-80.1918, 25.7617],
  "las vegas": [-115.1398, 36.1699],
  seattle: [-122.3321, 47.6062],
  boston: [-71.0589, 42.3601],
  washington: [-77.0369, 38.9072],
  "washington dc": [-77.0369, 38.9072],
  toronto: [-79.3832, 43.6532],
  montreal: [-73.5673, 45.5017],
  vancouver: [-123.1207, 49.2827],
  "mexico city": [-99.1332, 19.4326],
  cdmx: [-99.1332, 19.4326],
  guadalajara: [-103.3496, 20.6597],
  "oaxaca de juarez": [-96.7266, 17.0732],
  oaxaca: [-96.7266, 17.0732],
  havana: [-82.3666, 23.1136],
  "san jose": [-84.0907, 9.9281],
  "panama city": [-79.5197, 8.9936],
  bogota: [-74.0721, 4.7110],
  medellin: [-75.5636, 6.2442],
  cartagena: [-75.4832, 10.3910],
  lima: [-77.0428, -12.0464],
  cusco: [-71.9675, -13.5319],
  quito: [-78.4678, -0.1807],
  "buenos aires": [-58.3816, -34.6037],
  montevideo: [-56.1882, -34.9011],
  santiago: [-70.6693, -33.4489],
  "sao paulo": [-46.6333, -23.5505],
  rio: [-43.1729, -22.9068],
  "rio de janeiro": [-43.1729, -22.9068],
  salvador: [-38.5108, -12.9714],

  // Oceania
  sydney: [151.2093, -33.8688],
  melbourne: [144.9631, -37.8136],
  brisbane: [153.0260, -27.4698],
  perth: [115.8605, -31.9505],
  auckland: [174.7633, -36.8485],
  wellington: [174.7762, -41.2865],
  christchurch: [172.6362, -43.5321],
  "queenstown nz": [168.6626, -45.0312],
};

export function getCityCoords(city: string): Coords | null {
  const key = city.toLowerCase().trim();
  return CITY_COORDS[key] ?? null;
}

// Static lookup first, Mapbox geocoding as fallback for cities not in CITY_COORDS.
export async function resolveCityCoords(city: string): Promise<Coords | null> {
  const staticCoords = getCityCoords(city);
  if (staticCoords) return staticCoords;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?types=place&limit=1&access_token=${token}`
    );
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    return [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
  } catch {
    return null;
  }
}
