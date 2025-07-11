const mockLocations = [
  {
    city: 'Delhi',
    country: 'IN',
    latitude: 28.6139,
    longitude: 77.2090
  },
  {
    city: 'Mumbai',
    country: 'IN',
    latitude: 19.0760,
    longitude: 72.8777
  },
  {
    city: 'Bangalore',
    country: 'IN',
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    city: 'Chennai',
    country: 'IN',
    latitude: 13.0827,
    longitude: 80.2707
  }
];

const getMockGeoLocation = () => {
  const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
  return {
    ...location,
    timestamp: new Date(),
    accuracy: Math.floor(Math.random() * 100) + 50 // Random accuracy between 50-150 meters
  };
};

module.exports = getMockGeoLocation;