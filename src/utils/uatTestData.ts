/**
 * UAT Test Data Generator
 * Creates realistic test data for Jordan market testing
 */

export const uatTestData = {
  // Jordan Phone Numbers (Test Numbers)
  riders: [
    { name: 'أحمد محمود', phone: '+962791234567', email: 'ahmad.m@test.jo' },
    { name: 'Sarah Hassan', phone: '+962791234568', email: 'sarah.h@test.jo' },
    { name: 'محمد خالد', phone: '+962791234569', email: 'mohammad.k@test.jo' },
    { name: 'Layla Ahmad', phone: '+962791234570', email: 'layla.a@test.jo' },
    { name: 'عمر عبدالله', phone: '+962791234571', email: 'omar.a@test.jo' },
  ],

  drivers: [
    { 
      name: 'Khalid Ibrahim', 
      phone: '+962771234567', 
      email: 'khalid.i@driver.jo',
      licenseNumber: 'JO123456789',
      vehicle: 'Toyota Camry 2020'
    },
    { 
      name: 'فراس علي', 
      phone: '+962771234568', 
      email: 'firas.a@driver.jo',
      licenseNumber: 'JO987654321',
      vehicle: 'Hyundai Elantra 2021'
    },
  ],

  // Popular Amman Locations
  locations: {
    pickup: [
      { name: 'University of Jordan', coords: { lat: 32.0129, lng: 35.8720 } },
      { name: 'Abdali Mall', coords: { lat: 31.9641, lng: 35.9068 } },
      { name: 'City Mall', coords: { lat: 31.9913, lng: 35.8382 } },
      { name: 'Mecca Mall', coords: { lat: 31.9686, lng: 35.8383 } },
      { name: 'Queen Alia Airport', coords: { lat: 31.7226, lng: 35.9932 } },
      { name: 'Downtown Amman', coords: { lat: 31.9539, lng: 35.9106 } },
    ],
    destination: [
      { name: 'Rainbow Street', coords: { lat: 31.9539, lng: 35.9280 } },
      { name: 'Abdoun Circle', coords: { lat: 31.9452, lng: 35.8734 } },
      { name: 'Swefieh', coords: { lat: 31.9519, lng: 35.8623 } },
      { name: 'Wakalat Street', coords: { lat: 31.9553, lng: 35.9239 } },
      { name: 'Dabouq', coords: { lat: 31.9835, lng: 35.8297 } },
      { name: 'Shmeisani', coords: { lat: 31.9641, lng: 35.9068 } },
    ],
  },

  // Universities for Student Verification
  universities: [
    { name: 'University of Jordan', domain: 'ju.edu.jo', email: 'student@ju.edu.jo' },
    { name: 'Jordan University of Science and Technology', domain: 'just.edu.jo', email: 'student@just.edu.jo' },
    { name: 'Yarmouk University', domain: 'yu.edu.jo', email: 'student@yu.edu.jo' },
    { name: 'Hashemite University', domain: 'hu.edu.jo', email: 'student@hu.edu.jo' },
    { name: 'German Jordanian University', domain: 'gju.edu.jo', email: 'student@gju.edu.jo' },
  ],

  // Test Payment Cards (Stripe Test Cards)
  paymentCards: {
    success: {
      number: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User',
      description: 'Success - Payment will succeed'
    },
    decline: {
      number: '4000000000000002',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User',
      description: 'Decline - Card will be declined'
    },
    insufficientFunds: {
      number: '4000000000009995',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User',
      description: 'Insufficient Funds'
    },
    requiresAuthentication: {
      number: '4000002500003155',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User',
      description: '3D Secure - Will require authentication'
    },
  },

  // Promo Codes
  promoCodes: [
    { code: 'FIRST5FREE', discount: 5, currency: 'JOD', description: 'First ride free (up to 5 JOD)' },
    { code: 'WELCOME10', discount: 10, type: 'percentage', description: '10% off your first 3 rides' },
    { code: 'STUDENT20', discount: 20, type: 'percentage', description: '20% student discount' },
    { code: 'LAUNCH2026', discount: 15, type: 'percentage', description: 'Launch special - 15% off' },
  ],

  // Test Trips for Injection
  testTrips: [
    {
      pickup: 'University of Jordan',
      destination: 'Rainbow Street',
      distance: 8.5,
      duration: 22,
      price: 4.5,
      type: 'standard'
    },
    {
      pickup: 'Abdali Mall',
      destination: 'Abdoun Circle',
      distance: 6.2,
      duration: 18,
      price: 3.8,
      type: 'standard'
    },
    {
      pickup: 'City Mall',
      destination: 'Swefieh',
      distance: 4.1,
      duration: 12,
      price: 2.9,
      type: 'standard'
    },
    {
      pickup: 'Queen Alia Airport',
      destination: 'Downtown Amman',
      distance: 35.6,
      duration: 45,
      price: 18.5,
      type: 'luxury'
    },
  ],

  // NPS Survey Responses
  npsResponses: [
    { score: 10, reason: 'Excellent service! Driver was very professional.' },
    { score: 9, reason: 'Great app, easy to use. Will recommend to friends.' },
    { score: 8, reason: 'Good experience overall, driver was friendly.' },
    { score: 7, reason: 'Decent service, a bit expensive.' },
    { score: 6, reason: 'Average experience, nothing special.' },
    { score: 5, reason: 'Okay, but had to wait a long time for driver.' },
    { score: 4, reason: 'Not great, app was slow and buggy.' },
    { score: 3, reason: 'Disappointed, driver took wrong route.' },
    { score: 2, reason: 'Poor service, driver was rude.' },
    { score: 0, reason: 'Terrible experience, will not use again.' },
  ],

  // Campaign Templates
  campaignTemplates: [
    {
      name: 'New Rider - Day 0',
      audience: 'New Riders (Day 0)',
      title: 'Welcome to Wassel! 🎉',
      message: 'Your first ride is FREE (up to 5 JOD). Book now!',
      delay: 0,
    },
    {
      name: 'New Rider - Day 1',
      audience: 'New Riders (Day 1)',
      title: 'Ready for your next ride? 🚗',
      message: 'Use code WELCOME10 for 10% off your next 3 rides!',
      delay: 1440, // 24 hours
    },
    {
      name: 'Inactive Rider - Day 7',
      audience: 'Inactive Riders (7+ days)',
      title: 'We miss you! 💙',
      message: 'Come back and get 20% off your next ride with code COMEBACK20',
      delay: 10080, // 7 days
    },
    {
      name: 'New Driver - Day 0',
      audience: 'New Drivers (Day 0)',
      title: 'Welcome to Wassel Driver! 🎊',
      message: 'Complete 5 trips this week and earn a 50 JOD bonus!',
      delay: 0,
    },
    {
      name: 'High Performer',
      audience: 'Drivers with 4.8+ rating',
      title: 'You\'re a star! ⭐',
      message: 'Thanks for being awesome! Keep up the great work.',
      delay: 0,
    },
  ],

  // Test Issue Reports
  issueReports: {
    critical: [
      'Payment processing fails at checkout',
      'App crashes on trip completion',
      'Login OTP not received',
      'Cannot upload driver documents',
      'Google Maps not loading',
    ],
    high: [
      'Arabic text displays incorrectly (RTL issues)',
      'Student discount not applying',
      'Push notifications not received',
      'Trip history showing wrong data',
      'Driver earnings calculation incorrect',
    ],
    medium: [
      'Profile photo upload slow',
      'Map pin slightly off center',
      'Language switch requires refresh',
      'Minor UI alignment issues',
      'Slow loading on 3G network',
    ],
    low: [
      'Button text truncated on small screens',
      'Icon color slightly off brand',
      'Tooltip appears in wrong position',
      'Minor spelling error in Arabic',
      'Animation slightly jerky',
    ],
  },

  // Device Matrix for Testing
  devices: [
    { name: 'iPhone 14 Pro', os: 'iOS 17', browser: 'Safari', resolution: '1179x2556' },
    { name: 'iPhone 12', os: 'iOS 16', browser: 'Safari', resolution: '828x1792' },
    { name: 'Samsung Galaxy S23', os: 'Android 13', browser: 'Chrome', resolution: '1080x2340' },
    { name: 'Samsung Galaxy A54', os: 'Android 13', browser: 'Chrome', resolution: '1080x2400' },
    { name: 'Google Pixel 7', os: 'Android 13', browser: 'Chrome', resolution: '1080x2400' },
    { name: 'iPad Air', os: 'iOS 17', browser: 'Safari', resolution: '1640x2360' },
    { name: 'Desktop Chrome', os: 'Windows 11', browser: 'Chrome', resolution: '1920x1080' },
    { name: 'Desktop Safari', os: 'macOS', browser: 'Safari', resolution: '2560x1440' },
  ],

  // Network Conditions
  networkConditions: [
    { name: 'WiFi', download: 50000, upload: 20000, latency: 10 },
    { name: '4G LTE', download: 10000, upload: 5000, latency: 50 },
    { name: '3G', download: 1500, upload: 750, latency: 100 },
    { name: 'Slow 3G', download: 500, upload: 250, latency: 300 },
  ],
};

// Helper functions
export const generateRandomTrip = () => {
  const pickupIndex = Math.floor(Math.random() * uatTestData.locations.pickup.length);
  const destIndex = Math.floor(Math.random() * uatTestData.locations.destination.length);
  
  return {
    pickup: uatTestData.locations.pickup[pickupIndex],
    destination: uatTestData.locations.destination[destIndex],
    timestamp: new Date().toISOString(),
  };
};

export const generateRandomNPS = () => {
  const index = Math.floor(Math.random() * uatTestData.npsResponses.length);
  return uatTestData.npsResponses[index];
};

export const getTestRider = (index: number = 0) => {
  return uatTestData.riders[index % uatTestData.riders.length];
};

export const getTestDriver = (index: number = 0) => {
  return uatTestData.drivers[index % uatTestData.drivers.length];
};

export const formatJordanPhone = (phone: string) => {
// Convert to Jordan format: +962 79 123 4567
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('962')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

export const calculateTripPrice = (distance: number, type: 'standard' | 'luxury' | 'xl' = 'standard') => {
  const baseRates = {
    standard: { base: 1.5, perKm: 0.35 },
    luxury: { base: 3.0, perKm: 0.65 },
    xl: { base: 2.5, perKm: 0.55 },
  };

  const rate = baseRates[type];
  const price = rate.base + (distance * rate.perKm);
  
  return {
    base: rate.base,
    distance: distance,
    distanceFee: distance * rate.perKm,
    total: Math.round(price * 100) / 100,
    currency: 'JOD',
  };
};

export const applyDiscount = (price: number, discountType: 'student' | 'loyalty' | 'promo', tier?: string) => {
  const discounts = {
    student: 0.20, // 20%
    loyalty: {
      bronze: 0.05, // 5%
      silver: 0.10, // 10%
      gold: 0.15, // 15%
    },
    promo: 0.10, // 10%
  };

  let discount = 0;
  
  if (discountType === 'student') {
    discount = price * discounts.student;
  } else if (discountType === 'loyalty' && tier) {
    discount = price * (discounts.loyalty[tier as keyof typeof discounts.loyalty] || 0);
  } else if (discountType === 'promo') {
    discount = price * discounts.promo;
  }

  return {
    original: price,
    discount: Math.round(discount * 100) / 100,
    final: Math.round((price - discount) * 100) / 100,
    currency: 'JOD',
  };
};

export const generateTestSessionData = () => {
  return {
    sessionId: `UAT-${Date.now()}`,
    startTime: new Date().toISOString(),
    environment: 'staging',
    baseUrl: window.location.origin,
    testData: uatTestData,
  };
};

export default uatTestData;
