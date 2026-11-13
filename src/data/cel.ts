import { CELService } from '@/types';

// Text below is taken from the original CEL website (cube-el.org, archived copy)
// and the CEL block on the original cubeiitm.org homepage.
export const celOverview: {
  title: string;
  subtitle: string;
  description: string;
  aboutParagraphs: string[];
  servicesSummary: string;
  serviceCategories: string[];
  location: string;
  phone: string;
  email: string;
  facilities: string[];
  testingServices: CELService[];
} = {
  title: 'CUBE Environmental Laboratory (CEL)',
  subtitle: 'A Commitment to Accuracy & Quality',
  description:
    'CEL is a full-service environmental testing laboratory fostered by Tamil Nadu Pollution Control Board and IIT Madras.',
  aboutParagraphs: [
    'CEL is a full-service environmental testing laboratory fostered by Tamil Nadu Pollution Control Board and IIT Madras. Equipped with state-of-the-art equipment, we offer a wide range of analytical, testing and consultancy services across water, waste water and solid waste to municipal, industrial, household and private concerns.',
    'At CEL, compliance is a way of life. As your partner in problem-solving, we adopt stringent quality control and safety measures to provide scientifically sound results that are compliant with national regulations.',
  ],
  servicesSummary:
    'CEL’s offerings are classified under five service categories namely, Analysis & Testing, Inspection & Audits, Consulting & Advisory, Research & Development and Training & Capacity Building. CEL’s exhaustive line up of Analysis and Testing services range from basic parameters like pH, turbidity to advanced parameters like COD & trace heavy metals. CEL can assist prospective clients in multiple ways right from periodic regulatory testing and customised testing to comprehensive environmental audits and management plans along with catering to any training and capacity building requirements.',
  serviceCategories: [
    'Analysis & Testing',
    'Inspection & Audit',
    'Consultancy & Advisory',
    'Capacity Building & Training',
    'Research & Development',
  ],
  location: 'Module No.6C, 6th Floor, Phase II Building, IIT Madras Research Park, Kanagam Road, Taramani, Chennai 600 113.',
  phone: '044 6121 0915',
  email: 'cel@cubeiitm.org',
  // Testing areas shown on the original CEL homepage.
  facilities: ['Soil', 'Waste Water', 'Water for Construction', 'Solid Waste', 'Water', 'Water for Swimming Pool'],
  // Fallback only: the live list comes from the CMS store (celServices).
  // The original names these testing areas without further detail, so
  // parameters/equipment are left empty rather than invented.
  testingServices: [
    { id: 'soil', title: 'Soil', category: 'Specialized', description: '', parameters: [], equipment: [] },
    { id: 'waste-water', title: 'Waste Water', category: 'Wastewater', description: '', parameters: [], equipment: [] },
    { id: 'water-for-construction', title: 'Water for Construction', category: 'Water', description: '', parameters: [], equipment: [] },
    { id: 'solid-waste', title: 'Solid Waste', category: 'Solid Waste', description: '', parameters: [], equipment: [] },
    { id: 'water', title: 'Water', category: 'Water', description: '', parameters: [], equipment: [] },
    { id: 'water-for-swimming-pool', title: 'Water for Swimming Pool', category: 'Water', description: '', parameters: [], equipment: [] },
  ],
};
