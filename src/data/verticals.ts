import { Vertical } from '@/types';

/** A list block shown under an expertise card on the original site (e.g. "Highlights"). */
export interface VerticalServiceGroup {
  heading: string;
  items: string[];
}

export type VerticalWithGroups = Omit<Vertical, 'keyServices'> & {
  keyServices: (Vertical['keyServices'][number] & { groups?: VerticalServiceGroup[] })[];
};

// Text below is taken from the original site (cubeiitm.org vertical pages).
// `tagline` is empty and `projectCount` is 0 because the original has neither;
// pages hide those fields when empty.
export const verticals: VerticalWithGroups[] = [
  {
    id: 'building-construction',
    slug: 'building-construction',
    title: 'Building & Construction',
    shortTitle: 'Buildings',
    tagline: '',
    description:
      'Buildings & Construction are two major challenges of rapidly urbanizing India. Encouraging adoption of hybrid rapid construction technologies for mass housing, usage of latest construction & project management systems and main streaming the use of innovative construction materials that converge on economy as well as sustainability are the focus of the B&C vertical at CUBE.',
    longDescription:
      'Buildings & Construction are two major challenges of rapidly urbanizing India. Encouraging adoption of hybrid rapid construction technologies for mass housing, usage of latest construction & project management systems and main streaming the use of innovative construction materials that converge on economy as well as sustainability are the focus of the B&C vertical at CUBE.\n\nThe B&C vertical is ideally placed to promote and implement smart, affordable & sustainable solutions to deliver projects that work effectively & seamlessly.',
    heroImage: '/images/projects/building-construction/about_building.jpg',
    icon: 'Building2',
    color: 'from-blue-600 to-indigo-700',
    projectCount: 0,
    capabilities: [
      'Design & Engineering',
      'Project Management Consultancy',
      'Quality Assurance Services',
      'Advanced Construction Technologies',
      'Training & Research',
    ],
    keyServices: [
      {
        title: 'TPQA - Expertise',
        description: '',
        groups: [
          {
            heading: 'Highlights',
            items: [
              'Services across 15 states',
              'Plot coverage over 10,000 Acres',
              'Built-up Area of over 50 Mil Sqft',
              'Value of over Rs. 25000 Cr',
            ],
          },
          {
            heading: 'Construction Technologies',
            items: [
              'Conventional : RCC Framed Structure',
              'Steel & Composite Structures',
              'MIVAN Construction',
              'Tunnel Form Technology',
              'Precast Prefab Concrete Construction System',
              '3D Volumetric',
              'Light Gauge Steel Structures',
              'Expanded Polystyrene Core System',
              'Factory Made Fast Track Modular Building System',
              'Sandwich Panel System',
              '‘Stay In Place’ Form Work Systems',
              'Glass Fibre Gypsum Panel System',
            ],
          },
        ],
      },
      {
        title: 'Structural Audit – Expertise',
        description: '',
        groups: [
          {
            heading: 'Services',
            items: [
              'Structural Health Inspection & Monitoring',
              'Repair, Rehabilitation & Retrofitting',
              'Forensics Analysis',
            ],
          },
          {
            heading: 'Highlights',
            items: ['Over 35 Projects', 'Built-up Area 10 Mil Sqft', 'Over 300 structures and 10,000 units'],
          },
          {
            heading: 'Technologies',
            items: [
              'Conventional : RCC Framed Structure',
              'Steel & Composite Structures',
              'MIVAN Construction',
              'Precast Prefab Concrete Construction System',
            ],
          },
        ],
      },
      {
        title: 'Design & Engineering - Expertise',
        description: '',
        groups: [
          {
            heading: 'Domains',
            items: [
              'Soil Investigation. 10 No.',
              'Architectural Design. 15 No.',
              'Structural Design. 40 No.',
              'MEP Design. 15 No.',
              'Structural Vetting. 50 No.',
            ],
          },
          {
            heading: 'Highlights',
            items: [
              'Master Planning for over 2000 Acres',
              'Built-up Area of over 20 Mil Sqft',
              '50,000 dwelling units',
              'Value of over Rs. 5000 Cr',
            ],
          },
          {
            heading: 'Construction Technologies',
            items: [
              'Conventional : RCC Framed Structure',
              'Steel & Composite Structures',
              'MIVAN Construction',
              'Tunnel Form Technology',
              'Precast Prefab Concrete Construction System',
            ],
          },
        ],
      },
      {
        title: 'Project Management Consultancy - Expertise',
        description: '',
        groups: [
          {
            heading: 'Domains',
            items: ['Residential Projects', 'Industrial Projects', 'Institutional Projects', 'Infrastructure Projects'],
          },
          {
            heading: 'Highlights',
            items: ['Built-up Area of over 1.5 Mil Sqft', '5000 dwelling units', 'Value of over Rs. 500 Cr'],
          },
          {
            heading: 'Construction Technologies',
            items: ['Conventional : RCC Framed Structure', 'Steel & Composite Structures', 'MIVAN Construction'],
          },
        ],
      },
    ],
  },
  {
    id: 'environment-sustainability',
    slug: 'environment-sustainability',
    title: 'Environment & Sustainability',
    shortTitle: 'Environment',
    tagline: '',
    description:
      'The E&S vertical at CUBE, with its state of the art laboratory is involved in efforts to develop innovative and cost-effective solutions to treating effluents, managing solid waste, purifying air and recycling water.',
    longDescription:
      'We live in an increasingly urbanized world. It faces significant environmental challenges today due to ruthless, relentless & non-sustainable exploitation of environment by human race. While Urbanization is inevitable, the challenge in the coming years is to do so sensitively, keeping sustainability at the core of all development. Maintaining air & water quality, minimizing carbon emissions & reducing our environmental footprint while we continue to create jobs and industries are the significant problems that we face.\n\nThe E&S vertical at CUBE, with its state of the art laboratory is involved in efforts to develop innovative and cost-effective solutions to treating effluents, managing solid waste, purifying air and recycling water.',
    heroImage: '/images/projects/environment-sustainability/about_environment.jpg',
    icon: 'Leaf',
    color: 'from-teal-600 to-emerald-700',
    projectCount: 0,
    capabilities: [
      'CUBE Environment Laboratory',
      'Environment Management',
      'Quality Assurance & Audits',
      'Sustainable Technologies',
      'Design & Engineering',
      'Project Management',
      'Training & Research',
    ],
    keyServices: [],
  },
  {
    id: 'smart-cities',
    slug: 'smart-cities',
    title: 'Smart Cities',
    shortTitle: 'Smart Cities',
    tagline: '',
    description:
      'Cities today stand at the crossroads of a major paradigm shift. The challenge today is to incorporate the sociological, environmental and technological challenges in to one comprehensive system.',
    longDescription:
      'Cities today stand at the crossroads of a major paradigm shift. The challenge today is to incorporate the sociological, environmental and technological challenges in to one comprehensive system. The city’s developmental goals therefore, must respond to not just the current needs of the society but the future also.\n\nThe SMART vertical focuses on all the three aspects, in developing solutions that are holistic socio culturally, technologically and environmentally while employing design thinking & analytics to arrive at a wholesome approach to urban development, be it the supply of basic infrastructure, or data and analytics driven decision making for cities.',
    heroImage: '/images/projects/smart-cities/about_smart-city.jpg',
    icon: 'Cpu',
    color: 'from-cyan-600 to-blue-700',
    projectCount: 0,
    capabilities: [],
    keyServices: [],
  },
  {
    id: 'urban-planning-transportation',
    slug: 'urban-planning-transportation',
    title: 'Urban Planning & Transportation',
    shortTitle: 'Urban Planning',
    tagline: '',
    description:
      'Cities are Networks. The quality of life in a city depends upon the efficiency and efficacy of these networks which in turn are dependent on appropriate planning & policy interventions.',
    longDescription:
      'Cities are Networks. The quality of life in a city depends upon the efficiency and efficacy of these networks which in turn are dependent on appropriate planning & policy interventions. Optimizing the design of carrying infrastructure such as roads as well as developing data and technology driven solutions to optimize movement across public & private forms of transport are critical challenges.\n\nThe UPT vertical at CUBE is ideally poised to do so, with focus on the varied, multi sectoral and multidimensional aspects of urban issues and transportation planning.',
    heroImage: '/images/projects/urban-planning/about_upt-pro2.jpg',
    icon: 'Compass',
    color: 'from-amber-600 to-orange-700',
    projectCount: 0,
    capabilities: [
      'Urban Planning & Mobility',
      'Infrastructure',
      'Advanced Investigative Surveys',
      'Project Management',
      'Urban Design & Heritage Conservation',
      'Training & Research',
    ],
    keyServices: [],
  },
];
