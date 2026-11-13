export interface NavigationItem {
  title: string;
  href: string;
  badge?: string;
  description?: string;
  children?: {
    title: string;
    href: string;
    description?: string;
    icon?: string;
  }[];
}

export interface Vertical {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  longDescription: string;
  heroImage: string;
  icon: string;
  color: string;
  capabilities: string[];
  keyServices: {
    title: string;
    description: string;
    items?: string[];
  }[];
  projectCount: number;
}

export interface Project {
  slug: string;
  title: string;
  category: 'Building & Construction' | 'Environment & Sustainability' | 'Smart Cities' | 'Urban Planning & Transportation';
  location?: string;
  client?: string;
  status?: string;
  year?: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  scopeOfWork?: string[];
  objectives?: string[];
  methodology?: string[];
  outcomes?: string[];
  featured?: boolean;
  /** Fields taken from the original cubeiitm.org project pages */
  startDate?: string;
  endDate?: string;
  projectStatus?: string;
  keyHighlights?: string[];
  services?: string[];
  facts?: { label: string; value: string }[];
  bannerImage?: string;
}

export interface Leader {
  name: string;
  role: string;
  category: 'Board Member' | 'IIT Advisory Panel' | 'Executive';
  organization?: string;
  department?: string;
  image: string;
  bio?: string;
}

export interface TeamMember {
  id?: string;
  name: string;
  designation: string;
  department?: string;
  category?: string;
  image?: string;
  bio?: string;
  email?: string;
  phone?: string;
  age?: string;
  qualification?: string;
  experience?: string;
  employeeId?: string;
  joiningDate?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  status?: string;
}

export interface ClientPartner {
  name: string;
  category: 'Government' | 'Public Sector' | 'Private' | 'Academic' | 'Partner';
  logo: string;
  description?: string;
}

export interface CELService {
  id: string;
  title: string;
  category: 'Water' | 'Wastewater' | 'Solid Waste' | 'Specialized';
  parameters: string[];
  equipment: string[];
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  image?: string;
  content: string[];
}

export interface TenderItem {
  id: string;
  title: string;
  refNo: string;
  publishDate: string;
  closingDate: string;
  status: 'Active' | 'Closed' | 'Archive';
  description: string;
  downloadUrl?: string;
}

export interface CareerItem {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  qualifications: string[];
  deadline: string;
}

