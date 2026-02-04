const farmsData = [
  {
    id: 1,
    farmerName: "rajaram mane",
    crop: "Soybean",
    location: "Kolhapur",
    polygon: [
      [16.71041949368174, 74.19363319596657],
      [16.710327084514432, 74.1952216044626],
      [16.711843943078215, 74.1953183725529],
      [16.711936352245523, 74.19372996405687],
    ],
    // Phase 1: New fields for satellite monitoring & insurance
    area: 2.5, // hectares
    cropType: "Soybean (JS 335 variety)",
    sowingDate: new Date("2025-07-15"),
    expectedHarvestDate: new Date("2025-11-10"),
    baselineNDVI: 0.75, // healthy crop NDVI baseline
    insuranceValue: 250000, // ₹2,50,000
    contactInfo: {
      phone: "+91-9876543210",
      aadhar: "1234-5678-9012",
    },
    // Phase 2: Administrative Hierarchy
    administrativeData: {
      state: "Maharashtra",
      district: "Kolhapur",
      tehsil: "Shahuwadi",
      village: "Nesari",
      pincode: "416213",
    },
  },
  {
    id: 2,
    farmerName: "sarjerao mane",
    crop: "Soybean",
    location: "Kolhapur",
    polygon: [
      [16.70675768111585, 74.1954133774293],
      [16.706917258109986, 74.19693387169205],
      [16.708369261640176, 74.19676676748122],
      [16.70820968464604, 74.19524627321847],
    ],
    area: 3.2,
    cropType: "Soybean (JS 335 variety)",
    sowingDate: new Date("2025-07-18"),
    expectedHarvestDate: new Date("2025-11-12"),
    baselineNDVI: 0.72,
    insuranceValue: 320000,
    contactInfo: {
      phone: "+91-9876543211",
      aadhar: "1234-5678-9013",
    },
    administrativeData: {
      state: "Maharashtra",
      district: "Kolhapur",
      tehsil: "Shahuwadi",
      village: "Nesari",
      pincode: "416213",
    },
  },
  {
    id: 3,
    farmerName: "vishal rane",
    crop: "Soybean",
    location: "Kolhapur",
    polygon: [
      [16.705457645706318, 74.19502180148767],
      [16.705394796848662, 74.19635331376927],
      [16.706666331099562, 74.19641912719568],
      [16.706729179957218, 74.19508761491409],
    ],
    area: 1.8,
    cropType: "Soybean (MAUS 71 variety)",
    sowingDate: new Date("2025-07-12"),
    expectedHarvestDate: new Date("2025-11-05"),
    baselineNDVI: 0.78,
    insuranceValue: 180000,
    contactInfo: {
      phone: "+91-9876543212",
      aadhar: "1234-5678-9014",
    },
    administrativeData: {
      state: "Maharashtra",
      district: "Kolhapur",
      tehsil: "Radhanagari",
      village: "Kasba Walva",
      pincode: "416211",
    },
  },
  {
    id: 4,
    farmerName: "Ramesh Patil",
    crop: "Soybean",
    location: "Kolhapur",
    polygon: [
      [16.71107749556177, 74.19392821373813],
      [16.711000149224745, 74.19589600094011],
      [16.712879297363575, 74.19597699568925],
      [16.7129566437006, 74.19400920848727],
    ],
    area: 4.0,
    cropType: "Soybean (JS 335 variety)",
    sowingDate: new Date("2025-07-20"),
    expectedHarvestDate: new Date("2025-11-15"),
    baselineNDVI: 0.74,
    insuranceValue: 400000,
    contactInfo: {
      phone: "+91-9876543213",
      aadhar: "1234-5678-9015",
    },
    administrativeData: {
      state: "Maharashtra",
      district: "Kolhapur",
      tehsil: "Karveer",
      village: "Nigave",
      pincode: "416207",
    },
  },
];

export const getFarms = () => farmsData;

export default farmsData;
