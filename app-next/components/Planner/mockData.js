const mockData = {
  attractions: [
    {
      id: "louvre",
      name: "Louvre Museum",
      image: "https://picsum.photos/seed/louvre/400/300",
    },
    {
      id: "eiffel",
      name: "Eiffel Tower",
      image: "https://picsum.photos/seed/eiffel/400/300",
    },
    {
      id: "sainte-chapelle",
      name: "Sainte-Chapelle",
      image: "https://picsum.photos/seed/sainte/400/300",
    },
    {
      id: "orsay",
      name: "Musée d'Orsay",
      image: "https://picsum.photos/seed/orsay/400/300",
    },
  ],
  accommodations: [
    {
      id: 101,
      name: "Hotel de Louvre",
      // price in whole dollars for mock data UI
      price: 250,
      // price in minor units (cents) to match API shape
      price_per_night_minor: 25000,
      image: "https://picsum.photos/seed/hotellouvre/400/300",
    },
    {
      id: 102,
      name: "Le Citizen Hotel",
      price: 180,
      price_per_night_minor: 18000,
      image: "https://picsum.photos/seed/citizen/400/300",
    },
    {
      id: 103,
      name: "Generator Paris",
      price: 45,
      price_per_night_minor: 4500,
      image: "https://picsum.photos/seed/generator/400/300",
    },
  ],
  flights: [
    {
      id: 201,
      name: "Air France AF123",
      // price per passenger in whole dollars
      price: 450,
      // cents-equivalent for API
      price_minor: 45000,
      details: "Departs 8:00 AM, Arrives 10:30 AM",
    },
    {
      id: 202,
      name: "Delta DL456",
      price: 480,
      price_minor: 48000,
      details: "Departs 11:00 AM, Arrives 1:45 PM",
    },
    {
      id: 203,
      name: "United UA789",
      price: 430,
      price_minor: 43000,
      details: "Departs 9:30 PM, Arrives 11:55 PM",
    },
  ],
};

export default mockData;
