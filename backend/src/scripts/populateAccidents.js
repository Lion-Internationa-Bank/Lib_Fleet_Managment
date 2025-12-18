import mongoose from 'mongoose';
import Accident from '../models/Accident.js';
import dotenv from 'dotenv';

dotenv.config();

// Generate random date within last 2 years
const getRandomDate = () => {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random date within specific range from accident date
const getDateAfter = (startDate, minDays, maxDays) => {
  const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date;
};

// Sample data for accidents
const sampleAccidents = [
  {
    plate_no: 'AA123A',
    accident_date: getRandomDate(),
    accident_place: 'Bole Road, Addis Ababa',
    driver_name: 'Tesfaye Bekele',
    damaged_part: 'Front bumper and headlights',
    accident_intensity: 'Low',
    date_notified_insurance: null,
    date_police_report: getRandomDate(),
    date_insurance_surveyor: null,
    date_auction: null,
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Police report filed',
    responsible_for_accident: '3rd Party',
    risk_base_price: 500000,
    old_age_contribution: 25000,
    total: 525000,
    action_taken: 'Reported to police and insurance company'
  },
  {
    plate_no: 'AA456B',
    accident_date: getRandomDate(),
    accident_place: 'Mexico Square, Addis Ababa',
    driver_name: 'Mulugeta Alemu',
    damaged_part: 'Right side panels',
    accident_intensity: 'Medium',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Vehicle in garage for repairs',
    responsible_for_accident: 'Bank',
    risk_base_price: 750000,
    old_age_contribution: 37500,
    total: 787500,
    action_taken: 'Insurance claim in process'
  },
  {
    plate_no: 'AB789C',
    accident_date: getRandomDate(),
    accident_place: 'Megenagna Junction',
    driver_name: 'Selamawit Haile',
    damaged_part: 'Front left side and engine',
    accident_intensity: 'Critical',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: getRandomDate(),
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Total loss - Awaiting auction',
    responsible_for_accident: '3rd Party',
    risk_base_price: 1200000,
    old_age_contribution: 60000,
    total: 1260000,
    action_taken: 'Insurance surveyor completed assessment'
  },
  {
    plate_no: 'ABC-123',
    accident_date: getRandomDate(),
    accident_place: 'Adama - Modjo Highway',
    driver_name: 'Tadesse Lemma',
    damaged_part: 'Complete body damage - Rollover',
    accident_intensity: 'Critical',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: getRandomDate(),
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Vehicle declared total loss',
    responsible_for_accident: 'Bank',
    risk_base_price: 1500000,
    old_age_contribution: 75000,
    total: 1575000,
    action_taken: 'Auction scheduled'
  },
  {
    plate_no: 'ABC-123456',
    accident_date: getRandomDate(),
    accident_place: 'Bahir Dar - Gondar Road',
    driver_name: 'Fatuma Ahmed',
    damaged_part: 'Front end and suspension',
    accident_intensity: 'High',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: getRandomDate(),
    current_situation: 'Repairs completed',
    responsible_for_accident: '3rd Party',
    risk_base_price: 850000,
    old_age_contribution: 42500,
    total: 892500,
    action_taken: 'Vehicle back in service'
  },
  {
    plate_no: 'ABC-1253',
    accident_date: getRandomDate(),
    accident_place: 'Mekelle City Center',
    driver_name: 'Yohannes Mekonnen',
    damaged_part: 'Left side doors',
    accident_intensity: 'Medium',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: null,
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Under repair',
    responsible_for_accident: '3rd Party',
    risk_base_price: 600000,
    old_age_contribution: 30000,
    total: 630000,
    action_taken: 'Awaiting insurance surveyor'
  },
  {
    plate_no: 'ABC-12533',
    accident_date: getRandomDate(),
    accident_place: 'Piassa, Addis Ababa',
    driver_name: 'Aster Getachew',
    damaged_part: 'Rear bumper',
    accident_intensity: 'Low',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: getRandomDate(),
    current_situation: 'Repaired and back in service',
    responsible_for_accident: 'Bank',
    risk_base_price: 450000,
    old_age_contribution: 22500,
    total: 472500,
    action_taken: 'Insurance claim settled'
  },
  {
    plate_no: 'ABC-163',
    accident_date: getRandomDate(),
    accident_place: 'Kazanchis, Addis Ababa',
    driver_name: 'Dawit Solomon',
    damaged_part: 'Front collision damage',
    accident_intensity: 'High',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Major repairs ongoing',
    responsible_for_accident: '3rd Party',
    risk_base_price: 900000,
    old_age_contribution: 45000,
    total: 945000,
    action_taken: 'Insurance approved repairs'
  },
  {
    plate_no: 'AC012D',
    accident_date: getRandomDate(),
    accident_place: 'Hawassa Lake Area',
    driver_name: 'Hiwot Birhanu',
    damaged_part: 'Front grille and hood',
    accident_intensity: 'Low',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: null,
    date_auction: null,
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Documentation in progress',
    responsible_for_accident: '3rd Party',
    risk_base_price: 550000,
    old_age_contribution: 27500,
    total: 577500,
    action_taken: 'Police report obtained'
  },
  {
    plate_no: 'AC012D',
    accident_date: getRandomDate(),
    accident_place: 'Dire Dawa Industrial Zone',
    driver_name: 'Kemal Hassan',
    damaged_part: 'Rollover damage - roof and sides',
    accident_intensity: 'Critical',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: getRandomDate(),
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Awaiting auction',
    responsible_for_accident: 'Bank',
    risk_base_price: 1300000,
    old_age_contribution: 65000,
    total: 1365000,
    action_taken: 'Vehicle declared total loss'
  },
  {
    plate_no: 'AD345E',
    accident_date: getRandomDate(),
    accident_place: 'Mexico, Addis Ababa',
    driver_name: 'Rahel Tsegaye',
    damaged_part: 'Front and rear collision',
    accident_intensity: 'Medium',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: getRandomDate(),
    current_situation: 'Repairs completed',
    responsible_for_accident: '3rd Party',
    risk_base_price: 700000,
    old_age_contribution: 35000,
    total: 735000,
    action_taken: 'Insurance claim processed'
  },
  {
    plate_no: 'AD345E',
    accident_date: getRandomDate(),
    accident_place: 'Sarbet, Addis Ababa',
    driver_name: 'Biniyam Assefa',
    damaged_part: 'Right side mirror and door',
    accident_intensity: 'Low',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: getRandomDate(),
    current_situation: 'Minor repairs done',
    responsible_for_accident: 'Bank',
    risk_base_price: 480000,
    old_age_contribution: 24000,
    total: 504000,
    action_taken: 'Quick repair completed'
  },
  {
    plate_no: 'AD345E',
    accident_date: getRandomDate(),
    accident_place: 'Gondar City',
    driver_name: 'Genet Mulatu',
    damaged_part: 'Multiple body panels',
    accident_intensity: 'High',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Extensive repairs ongoing',
    responsible_for_accident: '3rd Party',
    risk_base_price: 950000,
    old_age_contribution: 47500,
    total: 997500,
    action_taken: 'Insurance approved major repairs'
  },
  {
    plate_no: 'AE678F',
    accident_date: getRandomDate(),
    accident_place: '4 Kilo, Addis Ababa',
    driver_name: 'Elias Worku',
    damaged_part: 'Front bumper and lights',
    accident_intensity: 'Medium',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: null,
    date_auction: null,
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Assessment pending',
    responsible_for_accident: 'Bank',
    risk_base_price: 650000,
    old_age_contribution: 32500,
    total: 682500,
    action_taken: 'Initial documentation complete'
  },
  {
    plate_no: 'AF901G',
    accident_date: getRandomDate(),
    accident_place: 'Jimma Town',
    driver_name: 'Zewdu Nigussie',
    damaged_part: 'Total vehicle damage',
    accident_intensity: 'Critical',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: getRandomDate(),
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Auction scheduled',
    responsible_for_accident: '3rd Party',
    risk_base_price: 1400000,
    old_age_contribution: 70000,
    total: 1470000,
    action_taken: 'Vehicle to be auctioned'
  },
  {
    plate_no: 'AF901G',
    accident_date: getRandomDate(),
    accident_place: 'Leghar, Addis Ababa',
    driver_name: 'Meskerem Demissie',
    damaged_part: 'Rear bumper and tail lights',
    accident_intensity: 'Low',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: getRandomDate(),
    current_situation: 'Repairs completed',
    responsible_for_accident: 'Bank',
    risk_base_price: 420000,
    old_age_contribution: 21000,
    total: 441000,
    action_taken: 'Back in service'
  },
  {
    plate_no: 'AG234H',
    accident_date: getRandomDate(),
    accident_place: 'CMC, Addis Ababa',
    driver_name: 'Solomon Bekele',
    damaged_part: 'Underbody and wheel alignment',
    accident_intensity: 'Medium',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Suspension repairs',
    responsible_for_accident: '3rd Party',
    risk_base_price: 720000,
    old_age_contribution: 36000,
    total: 756000,
    action_taken: 'Repair work approved'
  },
  {
    plate_no: 'AG234H',
    accident_date: getRandomDate(),
    accident_place: 'Bole, Addis Ababa',
    driver_name: 'Almaz Tefera',
    damaged_part: 'Front end and radiator',
    accident_intensity: 'High',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Engine repairs ongoing',
    responsible_for_accident: 'Bank',
    risk_base_price: 1100000,
    old_age_contribution: 55000,
    total: 1155000,
    action_taken: 'Major repair in progress'
  },
  {
    plate_no: 'AH567I',
    accident_date: getRandomDate(),
    accident_place: 'Megenagna, Addis Ababa',
    driver_name: 'Fitsum Gebremedhin',
    damaged_part: 'Windshield and front glass',
    accident_intensity: 'Low',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: getRandomDate(),
    current_situation: 'Glass replacement done',
    responsible_for_accident: '3rd Party',
    risk_base_price: 580000,
    old_age_contribution: 29000,
    total: 609000,
    action_taken: 'Quick fix completed'
  },
  {
    plate_no: 'AH567I',
    accident_date: getRandomDate(),
    accident_place: 'Adama City',
    driver_name: 'Helen Abraham',
    damaged_part: 'Side impact damage',
    accident_intensity: 'Medium',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: getRandomDate(),
    current_situation: 'Repairs completed successfully',
    responsible_for_accident: 'Bank',
    risk_base_price: 680000,
    old_age_contribution: 34000,
    total: 714000,
    action_taken: 'Vehicle restored to service'
  },
  // Additional 10 accidents to reach 30 total
  {
    plate_no: 'AI890J',
    accident_date: getRandomDate(),
    accident_place: 'Bole Medhanealem, Addis Ababa',
    driver_name: 'Michael Tekle',
    damaged_part: 'Front left fender',
    accident_intensity: 'Low',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: null,
    date_auction: null,
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Assessment required',
    responsible_for_accident: '3rd Party',
    risk_base_price: 530000,
    old_age_contribution: 26500,
    total: 556500,
    action_taken: 'Initial report filed'
  },
  {
    plate_no: 'BJ123K',
    accident_date: getRandomDate(),
    accident_place: 'Saris, Addis Ababa',
    driver_name: 'Sara Mohammed',
    damaged_part: 'Complete electrical system',
    accident_intensity: 'High',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Electrical repairs',
    responsible_for_accident: 'Bank',
    risk_base_price: 820000,
    old_age_contribution: 41000,
    total: 861000,
    action_taken: 'Specialized repair ongoing'
  },
  {
    plate_no: 'BJ123K',
    accident_date: getRandomDate(),
    accident_place: 'Gotera, Addis Ababa',
    driver_name: 'Daniel Assefa',
    damaged_part: 'Transmission and drivetrain',
    accident_intensity: 'Critical',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: getRandomDate(),
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Mechanical total loss',
    responsible_for_accident: '3rd Party',
    risk_base_price: 1250000,
    old_age_contribution: 62500,
    total: 1312500,
    action_taken: 'Vehicle to be scrapped'
  },
  {
    plate_no: 'BJ456L',
    accident_date: getRandomDate(),
    accident_place: 'Kality, Addis Ababa',
    driver_name: 'Ruth Samuel',
    damaged_part: 'Passenger side doors',
    accident_intensity: 'Medium',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Door replacement',
    responsible_for_accident: 'Bank',
    risk_base_price: 590000,
    old_age_contribution: 29500,
    total: 619500,
    action_taken: 'Parts ordered'
  },
  {
    plate_no: 'BJ456L',
    accident_date: getRandomDate(),
    accident_place: 'Gurd Shola, Addis Ababa',
    driver_name: 'Yared Mekonnen',
    damaged_part: 'Braking system',
    accident_intensity: 'High',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Brake system overhaul',
    responsible_for_accident: '3rd Party',
    risk_base_price: 780000,
    old_age_contribution: 39000,
    total: 819000,
    action_taken: 'Safety repairs in progress'
  },
  {
    plate_no: 'BJ456L',
    accident_date: getRandomDate(),
    accident_place: 'Bole Airport Area',
    driver_name: 'Martha Girma',
    damaged_part: 'Minor scratches and dents',
    accident_intensity: 'Low',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: getRandomDate(),
    current_situation: 'Cosmetic repairs done',
    responsible_for_accident: 'Bank',
    risk_base_price: 470000,
    old_age_contribution: 23500,
    total: 493500,
    action_taken: 'Quick cosmetic fix'
  },
  {
    plate_no: 'BK789M',
    accident_date: getRandomDate(),
    accident_place: 'Merkato, Addis Ababa',
    driver_name: 'Samuel Bekele',
    damaged_part: 'Fuel system damage',
    accident_intensity: 'Critical',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: getRandomDate(),
    date_into_garage: null,
    date_out_garage: null,
    current_situation: 'Fire damage - total loss',
    responsible_for_accident: '3rd Party',
    risk_base_price: 1350000,
    old_age_contribution: 67500,
    total: 1417500,
    action_taken: 'Insurance settlement pending'
  },
  {
    plate_no: 'BK789M',
    accident_date: getRandomDate(),
    accident_place: 'Piazza, Addis Ababa',
    driver_name: 'Eden Tesfaye',
    damaged_part: 'Steering system',
    accident_intensity: 'Medium',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Steering repairs',
    responsible_for_accident: 'Bank',
    risk_base_price: 640000,
    old_age_contribution: 32000,
    total: 672000,
    action_taken: 'Critical repair ongoing'
  },
  {
    plate_no: 'BL012N',
    accident_date: getRandomDate(),
    accident_place: 'Semit, Addis Ababa',
    driver_name: 'Nathaniel Haile',
    damaged_part: 'Air conditioning system',
    accident_intensity: 'Low',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: getRandomDate(),
    current_situation: 'AC system repaired',
    responsible_for_accident: '3rd Party',
    risk_base_price: 510000,
    old_age_contribution: 25500,
    total: 535500,
    action_taken: 'Comfort system fixed'
  },
  {
    plate_no: 'BL012N',
    accident_date: getRandomDate(),
    accident_place: 'Bole Bulbula, Addis Ababa',
    driver_name: 'Lydia Yohannes',
    damaged_part: 'Complete interior damage',
    accident_intensity: 'High',
    date_notified_insurance: getRandomDate(),
    date_police_report: getRandomDate(),
    date_insurance_surveyor: getRandomDate(),
    date_auction: null,
    date_into_garage: getRandomDate(),
    date_out_garage: null,
    current_situation: 'Interior refurbishment',
    responsible_for_accident: 'Bank',
    risk_base_price: 890000,
    old_age_contribution: 44500,
    total: 934500,
    action_taken: 'Interior repair in progress'
  }
];

async function populateAccidents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lib_fms');
    console.log('Connected to MongoDB');

    // Optional: Clear existing data first
    await Accident.deleteMany({});
    console.log('Cleared existing accident data');

    // Insert sample data
    const result = await Accident.insertMany(sampleAccidents);
    console.log(`Successfully inserted ${result.length} accident records!`);
    
    // Display summary
    const intensitySummary = result.reduce((acc, accident) => {
      acc[accident.accident_intensity] = (acc[accident.accident_intensity] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nAccident Intensity Summary:');
    console.table(intensitySummary);
    
    const responsibilitySummary = result.reduce((acc, accident) => {
      acc[accident.responsible_for_accident] = (acc[accident.responsible_for_accident] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nResponsibility Summary:');
    console.table(responsibilitySummary);
    
    // Calculate average totals
    const totalSum = result.reduce((sum, accident) => sum + (accident.total || 0), 0);
    const averageTotal = totalSum / result.length;
    console.log(`\nAverage Total Value: ETB ${averageTotal.toFixed(2)}`);
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('Some accident records already exist. Skipping duplicates.');
    } else {
      console.error('Error inserting accident data:', error);
    }
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
populateAccidents();