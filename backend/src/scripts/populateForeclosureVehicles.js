// scripts/populateForeclosureVehicles.js

import mongoose from 'mongoose';
import ForeclosureVehicle from '../models/ForeclosureVehicle.js';

const sampleForeclosures = [
  {
    plate_no: 'ET12345',
    property_owner: 'Abebe Kebede',
    lender_branch: 'Addis Ababa Main Branch',
    parking_place: 'Head Office Parking',
    date_into: new Date('2025-01-15'),
    date_out: new Date('2025-03-20'),
  },
  {
    plate_no: 'AA67890',
    property_owner: 'Mulugeta Tesfaye',
    lender_branch: 'Bole Branch',
    parking_place: 'Bole Medhanealem Yard',
    date_into: new Date('2025-02-10'),
    date_out: null,
  },
  {
    plate_no: 'ET98765',
    property_owner: 'Selamawit Haile',
    lender_branch: 'Merkato Branch',
    parking_place: 'Merkato Secured Lot',
    date_into: new Date('2025-03-05'),
    date_out: new Date('2025-06-12'),
  },
  {
    plate_no: 'AD11223',
    property_owner: 'Tadesse Lemma',
    lender_branch: 'Adama Branch',
    parking_place: 'Adama Regional Yard',
    date_into: new Date('2025-01-20'),
    date_out: null,
  },
  {
    plate_no: 'BH33445',
    property_owner: 'Fatuma Ahmed',
    lender_branch: 'Bahir Dar Branch',
    parking_place: 'Bahir Dar PFMD Lot',
    date_into: new Date('2025-04-18'),
    date_out: new Date('2025-07-25'),
  },
  {
    plate_no: 'MK55667',
    property_owner: 'Yohannes Mekonnen',
    lender_branch: 'Mekelle Branch',
    parking_place: 'Mekelle Secured Area',
    date_into: new Date('2025-05-02'),
    date_out: null,
  },
  {
    plate_no: 'AA77889',
    property_owner: 'Aster Getachew',
    lender_branch: 'Piassa Branch',
    parking_place: 'Head Office Parking',
    date_into: new Date('2025-06-10'),
    date_out: new Date('2025-09-15'),
  },
  {
    plate_no: 'ET99000',
    property_owner: 'Dawit Solomon',
    lender_branch: 'Kazanchis Branch',
    parking_place: 'Kazanchis Yard',
    date_into: new Date('2025-07-22'),
    date_out: null,
  },
  {
    plate_no: 'HB22334',
    property_owner: 'Hiwot Birhanu',
    lender_branch: 'Hawassa Branch',
    parking_place: 'Hawassa Parking Zone',
    date_into: new Date('2025-08-05'),
    date_out: new Date('2025-11-10'),
  },
  {
    plate_no: 'DR44556',
    property_owner: 'Kemal Hassan',
    lender_branch: 'Dire Dawa Branch',
    parking_place: 'Dire Dawa Secured Lot',
    date_into: new Date('2025-09-14'),
    date_out: null,
  },
  {
    plate_no: 'AA66778',
    property_owner: 'Rahel Tsegaye',
    lender_branch: 'Mexico Branch',
    parking_place: 'Mexico Yard',
    date_into: new Date('2025-10-01'),
    date_out: new Date('2025-12-05'),
  },
  {
    plate_no: 'ET88990',
    property_owner: 'Biniyam Assefa',
    lender_branch: 'Sarbet Branch',
    parking_place: 'Head Office Parking',
    date_into: new Date('2025-10-20'),
    date_out: null,
  },
  {
    plate_no: 'GM11223',
    property_owner: 'Genet Mulatu',
    lender_branch: 'Gondar Branch',
    parking_place: 'Gondar PFMD Area',
    date_into: new Date('2025-11-08'),
    date_out: null,
  },
  {
    plate_no: 'AA33445',
    property_owner: 'Elias Worku',
    lender_branch: '4 Kilo Branch',
    parking_place: '4 Kilo Secured Lot',
    date_into: new Date('2025-11-25'),
    date_out: null,
  },
  {
    plate_no: 'JH55667',
    property_owner: 'Zewdu Nigussie',
    lender_branch: 'Jimma Branch',
    parking_place: 'Jimma Parking Zone',
    date_into: new Date('2025-12-01'),
    date_out: null,
  },
  {
    plate_no: 'ET77889',
    property_owner: 'Meskerem Demissie',
    lender_branch: 'Leghar Branch',
    parking_place: 'Leghar Yard',
    date_into: new Date('2025-12-10'),
    date_out: null,
  },
  {
    plate_no: 'AA99000',
    property_owner: 'Solomon Bekele',
    lender_branch: 'CMC Branch',
    parking_place: 'CMC Secured Area',
    date_into: new Date('2025-07-15'),
    date_out: new Date('2025-10-20'),
  },
  {
    plate_no: 'BH22334',
    property_owner: 'Almaz Tefera',
    lender_branch: 'Bole Branch',
    parking_place: 'Bole Medhanealem Yard',
    date_into: new Date('2025-08-30'),
    date_out: null,
  },
  {
    plate_no: 'MK44556',
    property_owner: 'Fitsum Gebremedhin',
    lender_branch: 'Megenagna Branch',
    parking_place: 'Megenagna Lot',
    date_into: new Date('2025-09-20'),
    date_out: new Date('2025-12-12'),
  },
  {
    plate_no: 'AD66778',
    property_owner: 'Helen Abraham',
    lender_branch: 'Adama Branch',
    parking_place: 'Adama Regional Yard',
    date_into: new Date('2025-11-15'),
    date_out: null,
  },
];

async function populateForeclosureVehicles() {
  try {
    // Optional: Clear existing data first (comment out if you want to keep old data)
    // await ForeclosureVehicle.deleteMany({});

    const result = await ForeclosureVehicle.insertMany(sampleForeclosures);
    console.log(`Successfully inserted ${result.length} foreclosure vehicles!`);
    console.log('Sample data ready for testing your reports.');
  } catch (error) {
    if (error.code === 11000) {
      console.log('Some vehicles already exist (duplicate plate_no). Skipping duplicates.');
    } else {
      console.error('Error inserting data:', error);
    }
  } finally {
    mongoose.connection.close();
  }
}

populateForeclosureVehicles();