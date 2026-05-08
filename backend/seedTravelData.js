import mongoose from "mongoose";
import dotenv from "dotenv";
import Place from "./models/Place.js";
import Hotel from "./models/Hotel.js";
import Bus from "./models/Bus.js";

dotenv.config();

const imagePool = {
  mountain1: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
  mountain2: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
  mountain3: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=80",
  mountain4: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=80",
  beach1: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  beach2: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80",
  beach3: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1600&q=80",
  beach4: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1600&q=80",
  temple1: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=80",
  temple2: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80",
  historical1: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=80",
  historical2: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80",
  adventure1: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1600&q=80",
  adventure2: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1600&q=80",
  city1: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80",
  city2: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
  hotel1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
  hotel2: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=80",
  hotel3: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80",
  hotel4: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80",
  hotel5: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
  hotel6: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80",
  bus1: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80",
  bus2: "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=1600&q=80",
  bus3: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1600&q=80",
};

const placesSeed = [
  {
    name: "Manali",
    state: "Himachal Pradesh",
    category: "Hill Station",
    description: "A scenic Himalayan destination known for snow-capped peaks, pine forests, and river valleys.",
    imageUrl: imagePool.mountain1,
    popular: true,
    activities: ["Paragliding", "River Rafting", "Skiing", "Cafes"],
  },
  {
    name: "Shimla",
    state: "Himachal Pradesh",
    category: "Hill Station",
    description: "A charming hill capital with colonial architecture, mountain views, and cool weather year-round.",
    imageUrl: imagePool.mountain2,
    popular: true,
    activities: ["Mall Road Walk", "Toy Train", "Hiking", "Photography"],
  },
  {
    name: "Darjeeling",
    state: "West Bengal",
    category: "Hill Station",
    description: "Famous for tea gardens, Kanchenjunga views, and old-world mountain rail heritage.",
    imageUrl: imagePool.mountain3,
    popular: true,
    activities: ["Tea Estate Tour", "Sunrise Viewpoint", "Cable Car", "Local Markets"],
  },
  {
    name: "Munnar",
    state: "Kerala",
    category: "Hill Station",
    description: "A peaceful hill retreat filled with rolling tea estates, waterfalls, and misty mornings.",
    imageUrl: imagePool.mountain4,
    popular: true,
    activities: ["Tea Garden Walk", "Jeep Safari", "Waterfall Visit", "Trekking"],
  },
  {
    name: "Goa",
    state: "Goa",
    category: "Beach",
    description: "India's most popular coastal destination with beach life, nightlife, and Portuguese heritage.",
    imageUrl: imagePool.beach1,
    popular: true,
    activities: ["Beach Hopping", "Water Sports", "Nightlife", "Fort Visits"],
  },
  {
    name: "Varkala",
    state: "Kerala",
    category: "Beach",
    description: "A unique cliffside beach town with calm vibes, yoga retreats, and ocean sunsets.",
    imageUrl: imagePool.beach2,
    popular: false,
    activities: ["Cliff Walk", "Yoga", "Surfing", "Seafood"],
  },
  {
    name: "Puducherry",
    state: "Tamil Nadu",
    category: "Beach",
    description: "A French-influenced coastal town with colorful streets, cafes, and spiritual spaces.",
    imageUrl: imagePool.beach3,
    popular: true,
    activities: ["Promenade Walk", "Cafe Crawl", "Auroville", "Cycling"],
  },
  {
    name: "Gokarna",
    state: "Karnataka",
    category: "Beach",
    description: "A laid-back beach escape with scenic coastal trails and less crowded sands.",
    imageUrl: imagePool.beach4,
    popular: false,
    activities: ["Beach Trek", "Temple Visit", "Bonfire", "Sunset Points"],
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    category: "Temple",
    description: "One of the oldest living cities in the world, revered for ghats, rituals, and spiritual heritage.",
    imageUrl: imagePool.temple1,
    popular: true,
    activities: ["Ganga Aarti", "Boat Ride", "Temple Trail", "Street Food"],
  },
  {
    name: "Amritsar",
    state: "Punjab",
    category: "Temple",
    description: "A vibrant cultural city known for the Golden Temple and warm Punjabi hospitality.",
    imageUrl: imagePool.temple2,
    popular: true,
    activities: ["Golden Temple", "Wagah Border", "Punjabi Cuisine", "Market Walk"],
  },
  {
    name: "Jaipur",
    state: "Rajasthan",
    category: "Historical",
    description: "The Pink City featuring royal palaces, forts, and colorful bazaars.",
    imageUrl: imagePool.historical1,
    popular: true,
    activities: ["Fort Tour", "Palace Visit", "Shopping", "Heritage Walk"],
  },
  {
    name: "Hampi",
    state: "Karnataka",
    category: "Historical",
    description: "A UNESCO world heritage site filled with dramatic boulders and ancient temple ruins.",
    imageUrl: imagePool.historical2,
    popular: true,
    activities: ["Ruins Tour", "Cycling", "Sunrise Point", "Coracle Ride"],
  },
  {
    name: "Rishikesh",
    state: "Uttarakhand",
    category: "Adventure",
    description: "An adventure and wellness hub on the Ganges with rafting, bungee, and yoga.",
    imageUrl: imagePool.adventure1,
    popular: true,
    activities: ["River Rafting", "Bungee Jumping", "Yoga", "Cafe Hopping"],
  },
  {
    name: "Leh",
    state: "Ladakh",
    category: "Adventure",
    description: "High-altitude desert landscapes, mountain passes, and unforgettable road journeys.",
    imageUrl: imagePool.adventure2,
    popular: true,
    activities: ["Road Trip", "Monastery Visits", "ATV Ride", "Star Gazing"],
  },
  {
    name: "Udaipur",
    state: "Rajasthan",
    category: "Historical",
    description: "A romantic lake city known for royal architecture, waterfront views, and heritage stays.",
    imageUrl: imagePool.city1,
    popular: true,
    activities: ["Lake Cruise", "Palace Visit", "Cultural Show", "Food Tour"],
  },
  {
    name: "Coorg",
    state: "Karnataka",
    category: "Hill Station",
    description: "Coffee country with misty hills, plantations, and a relaxed countryside rhythm.",
    imageUrl: imagePool.city2,
    popular: true,
    activities: ["Coffee Estate Tour", "Waterfall", "Nature Walk", "Local Cuisine"],
  },
];

const hotelsSeed = [
  {
    name: "Cedar Peak Retreat",
    placeName: "Manali",
    city: "Manali",
    address: "Old Manali Road, Manali",
    description: "A warm mountain stay with valley-view rooms, bonfire evenings, and local cuisine.",
    images: [imagePool.hotel1, imagePool.hotel3],
    pricePerNight: 5400,
    rating: 4.5,
    numReviews: 286,
    amenities: ["wifi", "breakfast", "mountain_view", "parking"],
    roomsAvailable: 18,
    isPopular: true,
  },
  {
    name: "Snowline Grand Manali",
    placeName: "Manali",
    city: "Manali",
    address: "Hadimba Temple Lane, Manali",
    description: "Premium alpine property with spacious family suites and scenic decks.",
    images: [imagePool.hotel2, imagePool.hotel4],
    pricePerNight: 6800,
    rating: 4.6,
    numReviews: 194,
    amenities: ["wifi", "spa", "restaurant", "room_service"],
    roomsAvailable: 12,
    isPopular: true,
  },
  {
    name: "Ridge View Palace",
    placeName: "Shimla",
    city: "Shimla",
    address: "The Ridge Road, Shimla",
    description: "Classic hill property near the Ridge with cozy interiors and heritage vibes.",
    images: [imagePool.hotel5, imagePool.hotel1],
    pricePerNight: 6100,
    rating: 4.4,
    numReviews: 172,
    amenities: ["wifi", "heating", "restaurant", "city_view"],
    roomsAvailable: 20,
    isPopular: true,
  },
  {
    name: "Cloudberry Shimla Suites",
    placeName: "Shimla",
    city: "Shimla",
    address: "Jakhoo Hills, Shimla",
    description: "Modern suites with cedar wood interiors and panoramic mountain views.",
    images: [imagePool.hotel3, imagePool.hotel6],
    pricePerNight: 7300,
    rating: 4.7,
    numReviews: 143,
    amenities: ["wifi", "heating", "balcony", "breakfast"],
    roomsAvailable: 11,
    isPopular: false,
  },
  {
    name: "Tea Valley Residency",
    placeName: "Munnar",
    city: "Munnar",
    address: "Tea Estate Road, Munnar",
    description: "Overlooking tea gardens, this stay offers peaceful mornings and plantation walks.",
    images: [imagePool.hotel2, imagePool.hotel5],
    pricePerNight: 5900,
    rating: 4.5,
    numReviews: 221,
    amenities: ["wifi", "breakfast", "garden", "parking"],
    roomsAvailable: 16,
    isPopular: true,
  },
  {
    name: "Misty Munnar Retreat",
    placeName: "Munnar",
    city: "Munnar",
    address: "Devikulam Highway, Munnar",
    description: "A hillside escape with infinity viewpoints and curated local experiences.",
    images: [imagePool.hotel4, imagePool.hotel6],
    pricePerNight: 7600,
    rating: 4.6,
    numReviews: 130,
    amenities: ["wifi", "pool", "spa", "mountain_view"],
    roomsAvailable: 10,
    isPopular: false,
  },
  {
    name: "Blue Hills Manor",
    placeName: "Coorg",
    city: "Madikeri",
    address: "Raja Seat Road, Madikeri",
    description: "Elegant rooms, coffee estate trails, and sunset decks in a serene location.",
    images: [imagePool.hotel1, imagePool.hotel2],
    pricePerNight: 6500,
    rating: 4.4,
    numReviews: 110,
    amenities: ["wifi", "coffee_bar", "parking", "garden"],
    roomsAvailable: 14,
    isPopular: true,
  },
  {
    name: "Imperial Ooty Heights",
    placeName: "Coorg",
    city: "Madikeri",
    address: "Plantation Circle, Madikeri",
    description: "A luxury estate style stay with private balconies and farm-to-table meals.",
    images: [imagePool.hotel3, imagePool.hotel5],
    pricePerNight: 8200,
    rating: 4.8,
    numReviews: 96,
    amenities: ["wifi", "restaurant", "bonfire", "estate_view"],
    roomsAvailable: 8,
    isPopular: false,
  },
  {
    name: "SeaBreeze Goa Resort",
    placeName: "Goa",
    city: "Calangute",
    address: "Calangute Beach Road, Goa",
    description: "A lively beach resort with quick beach access, pool parties, and vibrant evenings.",
    images: [imagePool.hotel4, imagePool.hotel2],
    pricePerNight: 7200,
    rating: 4.3,
    numReviews: 318,
    amenities: ["wifi", "pool", "bar", "beach_access"],
    roomsAvailable: 22,
    isPopular: true,
  },
  {
    name: "Portuguese Courtyard Stay",
    placeName: "Goa",
    city: "Panaji",
    address: "Fontainhas, Panaji",
    description: "Boutique heritage stay inspired by old Portuguese architecture and design.",
    images: [imagePool.hotel6, imagePool.hotel1],
    pricePerNight: 6400,
    rating: 4.5,
    numReviews: 147,
    amenities: ["wifi", "breakfast", "heritage", "city_walk"],
    roomsAvailable: 9,
    isPopular: false,
  },
  {
    name: "Cliffline Varkala Suites",
    placeName: "Varkala",
    city: "Varkala",
    address: "North Cliff Road, Varkala",
    description: "A calm cliffside property perfect for yoga retreats and sunset views.",
    images: [imagePool.hotel3, imagePool.hotel4],
    pricePerNight: 5700,
    rating: 4.2,
    numReviews: 88,
    amenities: ["wifi", "yoga", "sea_view", "breakfast"],
    roomsAvailable: 13,
    isPopular: false,
  },
  {
    name: "Auro Coast Residency",
    placeName: "Puducherry",
    city: "Puducherry",
    address: "White Town Promenade, Puducherry",
    description: "French style rooms near the promenade with curated cultural city experiences.",
    images: [imagePool.hotel5, imagePool.hotel2],
    pricePerNight: 5600,
    rating: 4.4,
    numReviews: 132,
    amenities: ["wifi", "breakfast", "cycle_rental", "city_view"],
    roomsAvailable: 17,
    isPopular: true,
  },
  {
    name: "Sangam Heritage Varanasi",
    placeName: "Varanasi",
    city: "Varanasi",
    address: "Dashashwamedh Ghat Lane, Varanasi",
    description: "A spiritual riverside stay with guided ghat tours and cultural evenings.",
    images: [imagePool.hotel1, imagePool.hotel6],
    pricePerNight: 5000,
    rating: 4.3,
    numReviews: 204,
    amenities: ["wifi", "temple_tour", "restaurant", "river_view"],
    roomsAvailable: 15,
    isPopular: true,
  },
  {
    name: "Golden Arc Residency",
    placeName: "Amritsar",
    city: "Amritsar",
    address: "Heritage Street, Amritsar",
    description: "Modern comfort close to Golden Temple with family-friendly suites.",
    images: [imagePool.hotel2, imagePool.hotel3],
    pricePerNight: 4800,
    rating: 4.2,
    numReviews: 190,
    amenities: ["wifi", "parking", "restaurant", "family_rooms"],
    roomsAvailable: 21,
    isPopular: true,
  },
  {
    name: "Pink City Palace Inn",
    placeName: "Jaipur",
    city: "Jaipur",
    address: "MI Road, Jaipur",
    description: "A royal-inspired stay with rooftop dining and curated heritage trails.",
    images: [imagePool.hotel4, imagePool.hotel5],
    pricePerNight: 6900,
    rating: 4.5,
    numReviews: 267,
    amenities: ["wifi", "pool", "rooftop", "airport_pickup"],
    roomsAvailable: 19,
    isPopular: true,
  },
  {
    name: "Boulder Crest Hampi",
    placeName: "Hampi",
    city: "Hampi",
    address: "Virupapur Gaddi, Hampi",
    description: "A unique stone-and-earth themed stay near iconic ruins and viewpoints.",
    images: [imagePool.hotel6, imagePool.hotel3],
    pricePerNight: 4500,
    rating: 4.1,
    numReviews: 95,
    amenities: ["wifi", "bike_rental", "cafe", "sunset_view"],
    roomsAvailable: 12,
    isPopular: false,
  },
  {
    name: "Ganga Rapids Camp Retreat",
    placeName: "Rishikesh",
    city: "Rishikesh",
    address: "Shivpuri Riverside, Rishikesh",
    description: "Adventure-friendly riverside retreat near rafting start points and yoga hubs.",
    images: [imagePool.hotel1, imagePool.hotel4],
    pricePerNight: 5200,
    rating: 4.4,
    numReviews: 176,
    amenities: ["wifi", "campfire", "rafting_assist", "river_view"],
    roomsAvailable: 18,
    isPopular: true,
  },
  {
    name: "HighPass Leh Lodge",
    placeName: "Leh",
    city: "Leh",
    address: "Fort Road, Leh",
    description: "High-altitude comfort stay with warm hospitality and mountain panorama rooms.",
    images: [imagePool.hotel2, imagePool.hotel5],
    pricePerNight: 8400,
    rating: 4.7,
    numReviews: 122,
    amenities: ["wifi", "heating", "oxygen_support", "travel_desk"],
    roomsAvailable: 10,
    isPopular: true,
  },
  {
    name: "Lakefront Crown Udaipur",
    placeName: "Udaipur",
    city: "Udaipur",
    address: "Pichola Lake Road, Udaipur",
    description: "Lake-view luxury stay with elegant suites and cultural dinner experiences.",
    images: [imagePool.hotel3, imagePool.hotel6],
    pricePerNight: 9300,
    rating: 4.8,
    numReviews: 210,
    amenities: ["wifi", "pool", "lake_view", "spa"],
    roomsAvailable: 11,
    isPopular: true,
  },
  {
    name: "Cloudline Darjeeling House",
    placeName: "Darjeeling",
    city: "Darjeeling",
    address: "Mall Road Extension, Darjeeling",
    description: "A hill-top stay with tea valley views and warm wood interiors.",
    images: [imagePool.hotel4, imagePool.hotel1],
    pricePerNight: 6700,
    rating: 4.5,
    numReviews: 140,
    amenities: ["wifi", "breakfast", "tea_lounge", "mountain_view"],
    roomsAvailable: 13,
    isPopular: true,
  },
];

const busesSeed = [
  {
    operatorName: "Himalaya Express",
    busType: "AC Sleeper",
    origin: "Delhi",
    destination: "Manali",
    dayOffset: 1,
    departureHour: 20,
    departureMinute: 0,
    durationMinutes: 780,
    pricePerSeat: 1599,
    totalSeats: 36,
    availableSeats: 30,
    images: [imagePool.bus1, imagePool.bus2],
  },
  {
    operatorName: "Northern Wheels",
    busType: "Volvo Multi-Axle",
    origin: "Delhi",
    destination: "Shimla",
    dayOffset: 1,
    departureHour: 21,
    departureMinute: 30,
    durationMinutes: 540,
    pricePerSeat: 1299,
    totalSeats: 42,
    availableSeats: 34,
    images: [imagePool.bus1, imagePool.bus3],
  },
  {
    operatorName: "Mountain Trails",
    busType: "AC Seater",
    origin: "Chandigarh",
    destination: "Manali",
    dayOffset: 2,
    departureHour: 22,
    departureMinute: 15,
    durationMinutes: 510,
    pricePerSeat: 999,
    totalSeats: 40,
    availableSeats: 31,
    images: [imagePool.bus2, imagePool.bus3],
  },
  {
    operatorName: "Tea Garden Travels",
    busType: "AC Sleeper",
    origin: "Kochi",
    destination: "Munnar",
    dayOffset: 1,
    departureHour: 6,
    departureMinute: 45,
    durationMinutes: 300,
    pricePerSeat: 749,
    totalSeats: 30,
    availableSeats: 24,
    images: [imagePool.bus1, imagePool.bus2],
  },
  {
    operatorName: "Western Coastline",
    busType: "Volvo Multi-Axle",
    origin: "Mumbai",
    destination: "Goa",
    dayOffset: 1,
    departureHour: 19,
    departureMinute: 30,
    durationMinutes: 690,
    pricePerSeat: 1399,
    totalSeats: 44,
    availableSeats: 35,
    images: [imagePool.bus1, imagePool.bus3],
  },
  {
    operatorName: "Konkan Fastline",
    busType: "AC Sleeper",
    origin: "Pune",
    destination: "Goa",
    dayOffset: 2,
    departureHour: 20,
    departureMinute: 0,
    durationMinutes: 570,
    pricePerSeat: 1199,
    totalSeats: 36,
    availableSeats: 29,
    images: [imagePool.bus2, imagePool.bus3],
  },
  {
    operatorName: "Coastal Breeze",
    busType: "AC Seater",
    origin: "Bengaluru",
    destination: "Gokarna",
    dayOffset: 1,
    departureHour: 21,
    departureMinute: 45,
    durationMinutes: 510,
    pricePerSeat: 899,
    totalSeats: 40,
    availableSeats: 32,
    images: [imagePool.bus1, imagePool.bus2],
  },
  {
    operatorName: "Royal Rajasthan Lines",
    busType: "Volvo Multi-Axle",
    origin: "Delhi",
    destination: "Jaipur",
    dayOffset: 1,
    departureHour: 8,
    departureMinute: 0,
    durationMinutes: 330,
    pricePerSeat: 799,
    totalSeats: 44,
    availableSeats: 38,
    images: [imagePool.bus1, imagePool.bus3],
  },
  {
    operatorName: "Desert Crown Travels",
    busType: "AC Sleeper",
    origin: "Jaipur",
    destination: "Udaipur",
    dayOffset: 2,
    departureHour: 22,
    departureMinute: 0,
    durationMinutes: 420,
    pricePerSeat: 899,
    totalSeats: 34,
    availableSeats: 28,
    images: [imagePool.bus2, imagePool.bus1],
  },
  {
    operatorName: "Heritage Connector",
    busType: "AC Seater",
    origin: "Bengaluru",
    destination: "Hampi",
    dayOffset: 1,
    departureHour: 23,
    departureMinute: 0,
    durationMinutes: 510,
    pricePerSeat: 849,
    totalSeats: 38,
    availableSeats: 31,
    images: [imagePool.bus3, imagePool.bus2],
  },
  {
    operatorName: "Spiritual Route",
    busType: "AC Sleeper",
    origin: "Lucknow",
    destination: "Varanasi",
    dayOffset: 1,
    departureHour: 22,
    departureMinute: 30,
    durationMinutes: 420,
    pricePerSeat: 899,
    totalSeats: 34,
    availableSeats: 26,
    images: [imagePool.bus1, imagePool.bus3],
  },
  {
    operatorName: "Punjab Connect",
    busType: "Volvo Multi-Axle",
    origin: "Delhi",
    destination: "Amritsar",
    dayOffset: 2,
    departureHour: 21,
    departureMinute: 0,
    durationMinutes: 500,
    pricePerSeat: 1099,
    totalSeats: 42,
    availableSeats: 36,
    images: [imagePool.bus2, imagePool.bus1],
  },
  {
    operatorName: "River Rapids Coach",
    busType: "AC Seater",
    origin: "Delhi",
    destination: "Rishikesh",
    dayOffset: 1,
    departureHour: 6,
    departureMinute: 0,
    durationMinutes: 330,
    pricePerSeat: 649,
    totalSeats: 40,
    availableSeats: 34,
    images: [imagePool.bus1, imagePool.bus2],
  },
  {
    operatorName: "Himalayan Pass",
    busType: "Semi Sleeper",
    origin: "Srinagar",
    destination: "Leh",
    dayOffset: 3,
    departureHour: 5,
    departureMinute: 30,
    durationMinutes: 900,
    pricePerSeat: 1999,
    totalSeats: 30,
    availableSeats: 22,
    images: [imagePool.bus3, imagePool.bus2],
  },
  {
    operatorName: "South Peaks Transport",
    busType: "AC Seater",
    origin: "Bengaluru",
    destination: "Coorg",
    dayOffset: 1,
    departureHour: 7,
    departureMinute: 0,
    durationMinutes: 360,
    pricePerSeat: 699,
    totalSeats: 40,
    availableSeats: 30,
    images: [imagePool.bus2, imagePool.bus1],
  },
  {
    operatorName: "Nilgiri Link",
    busType: "AC Sleeper",
    origin: "Bengaluru",
    destination: "Ooty",
    dayOffset: 2,
    departureHour: 22,
    departureMinute: 15,
    durationMinutes: 420,
    pricePerSeat: 949,
    totalSeats: 36,
    availableSeats: 27,
    images: [imagePool.bus1, imagePool.bus3],
  },
  {
    operatorName: "Coastal Tamil Lines",
    busType: "AC Seater",
    origin: "Chennai",
    destination: "Puducherry",
    dayOffset: 1,
    departureHour: 9,
    departureMinute: 15,
    durationMinutes: 190,
    pricePerSeat: 499,
    totalSeats: 42,
    availableSeats: 35,
    images: [imagePool.bus2, imagePool.bus3],
  },
  {
    operatorName: "Kerala Coast Rider",
    busType: "AC Seater",
    origin: "Kochi",
    destination: "Varkala",
    dayOffset: 1,
    departureHour: 14,
    departureMinute: 20,
    durationMinutes: 260,
    pricePerSeat: 599,
    totalSeats: 40,
    availableSeats: 33,
    images: [imagePool.bus1, imagePool.bus2],
  },
];

const buildDateTime = (dayOffset, hour, minute) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const seedPlaces = async () => {
  const placesByName = new Map();
  let created = 0;
  let updated = 0;

  for (const place of placesSeed) {
    const filter = { name: place.name, state: place.state };
    const existing = await Place.findOne(filter);

    if (existing) {
      Object.assign(existing, place);
      await existing.save();
      placesByName.set(place.name, existing);
      updated += 1;
    } else {
      const createdPlace = await Place.create(place);
      placesByName.set(place.name, createdPlace);
      created += 1;
    }
  }

  return { placesByName, created, updated };
};

const seedHotels = async (placesByName) => {
  let created = 0;
  let updated = 0;

  for (const hotel of hotelsSeed) {
    const place = placesByName.get(hotel.placeName);

    if (!place) {
      console.warn(`Skipping hotel ${hotel.name}: place ${hotel.placeName} not found`);
      continue;
    }

    const payload = {
      name: hotel.name,
      place: place._id,
      location: {
        city: hotel.city,
        state: place.state,
        country: "India",
      },
      address: hotel.address,
      description: hotel.description,
      images: hotel.images,
      pricePerNight: hotel.pricePerNight,
      rating: hotel.rating,
      numReviews: hotel.numReviews,
      amenities: hotel.amenities,
      roomsAvailable: hotel.roomsAvailable,
      isPopular: hotel.isPopular,
    };

    const existing = await Hotel.findOne({ name: hotel.name });

    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      updated += 1;
    } else {
      await Hotel.create(payload);
      created += 1;
    }
  }

  return { created, updated };
};

const seedBuses = async () => {
  let created = 0;
  let updated = 0;

  for (const bus of busesSeed) {
    const departureTime = buildDateTime(bus.dayOffset, bus.departureHour, bus.departureMinute);
    const arrivalTime = new Date(departureTime.getTime() + bus.durationMinutes * 60 * 1000);

    const payload = {
      operatorName: bus.operatorName,
      busType: bus.busType,
      origin: bus.origin,
      destination: bus.destination,
      departureTime,
      arrivalTime,
      pricePerSeat: bus.pricePerSeat,
      totalSeats: bus.totalSeats,
      availableSeats: bus.availableSeats,
      images: bus.images,
    };

    const existing = await Bus.findOne({
      operatorName: bus.operatorName,
      busType: bus.busType,
      origin: bus.origin,
      destination: bus.destination,
    });

    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      updated += 1;
    } else {
      await Bus.create(payload);
      created += 1;
    }
  }

  return { created, updated };
};

const seedTravelData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Add it to backend/.env before seeding.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for travel data seeding...");

    const { placesByName, created: placesCreated, updated: placesUpdated } = await seedPlaces();
    const { created: hotelsCreated, updated: hotelsUpdated } = await seedHotels(placesByName);
    const { created: busesCreated, updated: busesUpdated } = await seedBuses();

    console.log("\nSeed complete:");
    console.log(`Places  -> created: ${placesCreated}, updated: ${placesUpdated}`);
    console.log(`Hotels  -> created: ${hotelsCreated}, updated: ${hotelsUpdated}`);
    console.log(`Buses   -> created: ${busesCreated}, updated: ${busesUpdated}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedTravelData();
