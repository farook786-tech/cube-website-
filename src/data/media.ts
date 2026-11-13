// Media section content taken from the original CUBE website (https://cubeiitm.org/).
// Events are posts from the original news page (https://cubeiitm.org/news.html); their
// descriptions are the original sentences. Fields the original does not state are left
// out rather than guessed. Gallery images are the photos shown in the "Media" and
// "Life at CUBE" sections of the original homepage, which carry no captions.

const NEWS_IMG = '/images/media/news/original/';

export interface CubeEvent {
  title: string;
  date: string;
  location?: string;
  category: string;
  image: string;
  description: string;
  highlights?: string[];
}

export const cubeEvents: CubeEvent[] = [
  {
    title: '7th Annual General Meeting',
    date: '', // not stated on the original site
    category: 'Annual General Meeting',
    image: NEWS_IMG + 'newsnew4.jpg',
    description:
      'The 7th Annual General Meeting at CUBE marked a significant milestone, with board members recognizing the team’s exceptional dedication and impact.',
  },
  {
    title: 'Bhoomi Pooja for New Residential Complex',
    date: '09/02/2025',
    location: 'Jigani Village, Bangalore',
    category: 'Project Milestone',
    image: NEWS_IMG + 'newsnew3.jpg',
    description:
      'CUBE is delighted to announce the successful Bhoomi Pooja for a new residential complex in Jigani Village, Bangalore in association with UDPL. This ceremonial milestone marks the commencement of the project.',
  },
  {
    title: 'MoU Signing with Uppuluri Developers Private Limited (UDPL)',
    date: '04/02/2025',
    category: 'MoU Signing',
    image: NEWS_IMG + 'newsnew2.jpg',
    description:
      'The MoU was formally signed by Major General Padmanaban Lakshmanan, CEO of CUBE, and Mr. Manilal Chalasani, Director of UDPL.',
  },
  {
    title: 'Regional Conclave of Namma School Namma Ooru Palli (NSNOP)',
    date: '21/01/2025',
    category: 'Conclave',
    image: NEWS_IMG + 'newsnew.jpg',
    description:
      'CUBE recently presented a report on the impactful projects completed under the Namma School Namma Ooru Palli (NSNOP) initiative of the Government of Tamil Nadu at the Regional Conclave of NSNOP.',
  },
];

/** Photos from the "Media" section of the original homepage. */
export const mediaGalleryImages: string[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
  (n) => `/images/media/news/news_news${n}.jpg`
);

/** Photos from the "Life at CUBE" section of the original homepage. */
export const lifeAtCubeImages: string[] = [
  '/images/life-at-cube/about_life.jpg',
  '/images/life-at-cube/about_life1.jpg',
  '/images/life-at-cube/about_life2.jpg',
];
