// Admin-editable content for the public /careers page.
// Safe to import from both server and client components (no Node APIs).

export const CAREER_BENEFIT_ICONS = [
  'award',
  'building',
  'globe',
  'briefcase',
  'sparkles',
  'users',
  'graduation',
  'flask',
] as const;

export type CareerBenefitIcon = (typeof CAREER_BENEFIT_ICONS)[number];

export interface CareerBenefit {
  icon: CareerBenefitIcon;
  title: string;
  description: string;
}

export interface CareersPageContent {
  header: {
    badge: string;
    title: string;
    description: string;
  };
  contactEmail: string;
  contactLabel: string;
  tabs: {
    openingsLabel: string;
    portalLabel: string;
  };
  emptyState: {
    title: string;
    description: string;
    buttonLabel: string;
  };
  talentCallout: {
    badge: string;
    heading: string;
    description: string;
    buttonLabel: string;
  };
  jobDetail: {
    howToApplyTitle: string;
    howToApplySteps: string[];
  };
  applicationForm: {
    badge: string;
    heading: string;
    defaultJobTitle: string;
    experienceOptions: string[];
    domainOptions: string[];
    coverNotePlaceholder: string;
    submitLabel: string;
    successTitle: string;
    successMessage: string;
  };
  benefits: {
    heading: string;
    subheading: string;
    items: CareerBenefit[];
  };
}

// Wording from the original CUBE careers page (https://cubeiitm.org/career.html).
export const DEFAULT_CAREERS_PAGE: CareersPageContent = {
  header: {
    badge: 'Career',
    title: 'Career',
    description:
      'What sets us apart is what brings us together – a shared passion for solving business challenges through strategy, design, and engineering. We are the sum total of our team, their unique perspectives, capabilities, and our ability to collaborate from ideation to deployment.',
  },
  contactEmail: 'office@cubeiitm.org',
  contactLabel: 'Email',
  tabs: {
    openingsLabel: 'Openings',
    portalLabel: 'Apply',
  },
  emptyState: {
    title: 'No openings at present',
    description: '',
    buttonLabel: 'Send Your Resume',
  },
  talentCallout: {
    badge: '',
    heading: '',
    description: '',
    buttonLabel: '',
  },
  jobDetail: {
    howToApplyTitle: 'How to Apply',
    howToApplySteps: [
      'Click "Apply" below to open the application form.',
      'Fill in your details and upload your resume (PDF or DOCX, max 10MB).',
    ],
  },
  applicationForm: {
    badge: 'Apply',
    heading: 'Apply to CUBE',
    defaultJobTitle: 'General Application',
    experienceOptions: ['0-2 Years', '3-5 Years', '6-10 Years', '10+ Years'],
    domainOptions: [
      'Building & Construction',
      'Environment & Sustainability',
      'Smart Cities',
      'Urban Planning & Transportation',
      'CUBE Environmental Laboratory (CEL)',
    ],
    coverNotePlaceholder: 'Cover note (optional)',
    submitLabel: 'Submit Application',
    successTitle: 'Application Received',
    successMessage: 'Thank you for applying to CUBE.',
  },
  benefits: {
    heading: '',
    subheading: '',
    items: [],
  },
};

// Non-vertical units that also hire (CEL lab, administration).
export const EXTRA_CAREER_DEPARTMENTS = [
  'CUBE Environmental Laboratory (CEL)',
  'Admin & Operations',
];

export const DEFAULT_EMPLOYMENT_TYPES = [
  'Full-Time',
  'Full-Time Contract',
  'Part-Time',
  'Project Associate',
  'Project Engineer',
  'Project Scientist',
  'Research Fellow',
  'Consultant',
  'Visiting Expert',
  'Internship',
];

const uniq = (items: unknown[]) =>
  Array.from(
    new Set(items.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean))
  );

/**
 * Department choices for the admin job form: every published vertical
 * (as "<title> Vertical"), CEL and admin units, plus any department
 * already used by an existing job so older values remain selectable.
 */
export function buildDepartmentOptions(verticals: any[] = [], careers: any[] = []): string[] {
  const fromVerticals = verticals
    .filter((v) => v && v.status !== 'archived' && v.status !== 'draft')
    .map((v) => (typeof v.title === 'string' && v.title.trim() ? `${v.title.trim()} Vertical` : ''));
  return uniq([...fromVerticals, ...EXTRA_CAREER_DEPARTMENTS, ...careers.map((c) => c?.department)]);
}

export function buildEmploymentTypeOptions(careers: any[] = []): string[] {
  return uniq([...DEFAULT_EMPLOYMENT_TYPES, ...careers.map((c) => c?.employmentType)]);
}

const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);

const strList = (v: unknown, fallback: string[]) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : fallback;

/**
 * Merge stored (possibly partial / older-shaped) content over the defaults so
 * the public page always has every field it needs.
 */
export function resolveCareersPage(stored: unknown): CareersPageContent {
  const s = (stored && typeof stored === 'object' ? stored : {}) as any;
  const d = DEFAULT_CAREERS_PAGE;

  const benefitItems = Array.isArray(s.benefits?.items)
    ? s.benefits.items
        .filter((b: any) => b && typeof b === 'object')
        .map((b: any) => ({
          icon: (CAREER_BENEFIT_ICONS as readonly string[]).includes(b.icon) ? b.icon : 'award',
          title: str(b.title, ''),
          description: str(b.description, ''),
        }))
    : d.benefits.items;

  return {
    header: {
      badge: str(s.header?.badge, d.header.badge),
      title: str(s.header?.title, d.header.title),
      description: str(s.header?.description, d.header.description),
    },
    contactEmail: str(s.contactEmail, d.contactEmail),
    contactLabel: str(s.contactLabel, d.contactLabel),
    tabs: {
      openingsLabel: str(s.tabs?.openingsLabel, d.tabs.openingsLabel),
      portalLabel: str(s.tabs?.portalLabel, d.tabs.portalLabel),
    },
    emptyState: {
      title: str(s.emptyState?.title, d.emptyState.title),
      description: str(s.emptyState?.description, d.emptyState.description),
      buttonLabel: str(s.emptyState?.buttonLabel, d.emptyState.buttonLabel),
    },
    talentCallout: {
      badge: str(s.talentCallout?.badge, d.talentCallout.badge),
      heading: str(s.talentCallout?.heading, d.talentCallout.heading),
      description: str(s.talentCallout?.description, d.talentCallout.description),
      buttonLabel: str(s.talentCallout?.buttonLabel, d.talentCallout.buttonLabel),
    },
    jobDetail: {
      howToApplyTitle: str(s.jobDetail?.howToApplyTitle, d.jobDetail.howToApplyTitle),
      howToApplySteps: strList(s.jobDetail?.howToApplySteps, d.jobDetail.howToApplySteps),
    },
    applicationForm: {
      badge: str(s.applicationForm?.badge, d.applicationForm.badge),
      heading: str(s.applicationForm?.heading, d.applicationForm.heading),
      defaultJobTitle: str(s.applicationForm?.defaultJobTitle, d.applicationForm.defaultJobTitle),
      experienceOptions: strList(s.applicationForm?.experienceOptions, d.applicationForm.experienceOptions),
      domainOptions: strList(s.applicationForm?.domainOptions, d.applicationForm.domainOptions),
      coverNotePlaceholder: str(s.applicationForm?.coverNotePlaceholder, d.applicationForm.coverNotePlaceholder),
      submitLabel: str(s.applicationForm?.submitLabel, d.applicationForm.submitLabel),
      successTitle: str(s.applicationForm?.successTitle, d.applicationForm.successTitle),
      successMessage: str(s.applicationForm?.successMessage, d.applicationForm.successMessage),
    },
    benefits: {
      heading: str(s.benefits?.heading, d.benefits.heading),
      subheading: str(s.benefits?.subheading, d.benefits.subheading),
      items: benefitItems,
    },
  };
}
