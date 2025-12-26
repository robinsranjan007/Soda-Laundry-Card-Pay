 
const CONFIG = {
  // Static machine inventory
  machines: {
    washers: [
      { soda_id: 21, size: 20, category: "S" },
      { soda_id: 22, size: 20, category: "S" },
      { soda_id: 23, size: 20, category: "S" },
      { soda_id: 24, size: 20, category: "S" },

      { soda_id: 41, size: 40, category: "M" },
      { soda_id: 42, size: 40, category: "M" },
      { soda_id: 43, size: 40, category: "M" },
      { soda_id: 44, size: 40, category: "M" },

      { soda_id: 61, size: 60, category: "L" },
      { soda_id: 62, size: 60, category: "L" },
      { soda_id: 63, size: 60, category: "L" },
    ],
    dryers: [
      // Top Dryers
      { soda_id: 1, location: "top" },
      { soda_id: 3, location: "top" },
      { soda_id: 5, location: "top" },
      { soda_id: 7, location: "top" },
      { soda_id: 9, location: "top" },

      // Bottom Dryers
      { soda_id: 2, location: "bottom" },
      { soda_id: 4, location: "bottom" },
      { soda_id: 6, location: "bottom" },
      { soda_id: 8, location: "bottom" },
      { soda_id: 10, location: "bottom" },
    ],
  },

  cycles: {
    large_washer_cycle: [
      {
        id: "cyc_1",
        name: "NORMAL",
        price: 1300, // $13.00
        duration: "22 min",
        temperatures: [
          { id: "temp_cold", name: "COLD" },
          { id: "temp_warm", name: "WARM" },
          { id: "temp_hot", name: "HOT" },
        ],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
      {
        id: "cyc_3",
        name: "DELICATE",
        price: 1300, // $13.00
        duration: "18 min",
        temperatures: [
          { id: "temp_cold", name: "COLD" },
          { id: "temp_warm", name: "WARM" },
          { id: "temp_hot", name: "HOT" },
        ],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
      {
        id: "cyc_9",
        name: "BEDDING",
        price: 1400, // $14.00
        duration: "35 min",
        temperatures: [
          { id: "temp_cold", name: "COLD" },
          { id: "temp_warm", name: "WARM" },
          { id: "temp_hot", name: "HOT" },
        ],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
      {
        id: "cyc_15",
        name: "DEEP CLEAN",
        price: 1500, // $15.00
        duration: "44 min",
        temperatures: [{ id: "temp_hot", name: "HOT" }],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
    ],

    medium_washer_cycle: [
      {
        id: "cyc_1",
        name: "NORMAL",
        price: 850, // $8.50
        duration: "22 min",
        temperatures: [
          { id: "temp_cold", name: "COLD" },
          { id: "temp_warm", name: "WARM" },
          { id: "temp_hot", name: "HOT" },
        ],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
      {
        id: "cyc_3",
        name: "DELICATE",
        price: 850, // $8.50
        duration: "18 min",
        temperatures: [
          { id: "temp_cold", name: "COLD" },
          { id: "temp_warm", name: "WARM" },
          { id: "temp_hot", name: "HOT" },
        ],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
      {
        id: "cyc_9",
        name: "BEDDING",
        price: 1050, // $10.50
        duration: "35 min",
        temperatures: [
          { id: "temp_cold", name: "COLD" },
          { id: "temp_warm", name: "WARM" },
          { id: "temp_hot", name: "HOT" },
        ],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
      {
        id: "cyc_15",
        name: "DEEP CLEAN",
        price: 1050, // $10.50
        duration: "44 min",
        temperatures: [{ id: "temp_hot", name: "HOT" }],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
    ],

    small_washer_cycle: [
      {
        id: "cyc_1",
        name: "NORMAL",
        price: 500, // $5.00
        duration: "22 min",
        temperatures: [
          { id: "temp_cold", name: "COLD" },
          { id: "temp_warm", name: "WARM" },
          { id: "temp_hot", name: "HOT" },
        ],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
      {
        id: "cyc_3",
        name: "DELICATE",
        price: 500, // $5.00
        duration: "18 min",
        temperatures: [
          { id: "temp_cold", name: "COLD" },
          { id: "temp_warm", name: "WARM" },
          { id: "temp_hot", name: "HOT" },
        ],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
      {
        id: "cyc_9",
        name: "BEDDING",
        price: 525, // $5.25
        duration: "35 min",
        temperatures: [
          { id: "temp_cold", name: "COLD" },
          { id: "temp_warm", name: "WARM" },
          { id: "temp_hot", name: "HOT" },
        ],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
      {
        id: "cyc_15",
        name: "DEEP CLEAN",
        price: 500, // $5.00
        duration: "44 min",
        temperatures: [{ id: "temp_hot", name: "HOT" }],
        extraOptions: [
          { id: "prewash", name: "Pre-wash", price: 25, duration: 5 },
          {
            id: "prewash_rinse",
            name: "Pre-wash + Extra-Rinse",
            price: 50,
            duration: 10,
          },
        ],
      },
    ],

    dryer_cycles: [
    {
        id: "cyc_high",
        name: "High",
        durations: [
            { minutes: 36, price: 300 },
            { minutes: 42, price: 350 },
            { minutes: 48, price: 400 },
            { minutes: 54, price: 450 },
            { minutes: 60, price: 500 }
        ],
        extraOptions: [
            { id: "reverse_tumble", name: "Reverse Tumble", price: 100 }
        ]
    },
    {
        id: "cyc_medium",
        name: "Medium",
        durations: [
            { minutes: 36, price: 300 },
            { minutes: 42, price: 350 },
            { minutes: 48, price: 400 },
            { minutes: 54, price: 450 },
            { minutes: 60, price: 500 }
        ],
        extraOptions: [
            { id: "reverse_tumble", name: "Reverse Tumble", price: 100 }
        ]
    },
    {
        id: "cyc_low",
        name: "Low",
        durations: [
            { minutes: 36, price: 300 },
            { minutes: 42, price: 350 },
            { minutes: 48, price: 400 },
            { minutes: 54, price: 450 },
            { minutes: 60, price: 500 }
        ],
        extraOptions: [
            { id: "reverse_tumble", name: "Reverse Tumble", price: 100 }
        ]
    },
    {
        id: "cyc_delicate",
        name: "Delicate",
        durations: [
            { minutes: 36, price: 300 },
            { minutes: 42, price: 350 },
            { minutes: 48, price: 400 },
            { minutes: 54, price: 450 },
            { minutes: 60, price: 500 }
        ],
        extraOptions: [
            { id: "reverse_tumble", name: "Reverse Tumble", price: 100 }
        ]
    },
    {
        id: "cyc_noheat",
        name: "No heat",
        durations: [
            { minutes: 36, price: 300 },
            { minutes: 42, price: 350 },
            { minutes: 48, price: 400 },
            { minutes: 54, price: 450 },
            { minutes: 60, price: 500 }
        ],
        extraOptions: [
            { id: "reverse_tumble", name: "Reverse Tumble", price: 100 }
        ]
    }
]
  },
};


function getMachineType(machineId) {
    const washer = CONFIG.machines.washers.find(m => m.soda_id === parseInt(machineId));
    if (washer) return { type: 'washer', machine: washer };
    
    const dryer = CONFIG.machines.dryers.find(m => m.soda_id === parseInt(machineId));
    if (dryer) return { type: 'dryer', machine: dryer };
    
    return null;
}

function getCyclesForMachine(machineCategory) {
    if (machineCategory === 'L') {
        return CONFIG.cycles.large_washer_cycle;
    } else if (machineCategory === 'M') {
        return CONFIG.cycles.medium_washer_cycle;   
    } else if (machineCategory === 'S') {
        return CONFIG.cycles.small_washer_cycle;
    }
    return CONFIG.cycles.dryer_cycles;
}