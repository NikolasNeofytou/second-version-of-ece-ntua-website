// Simple mock data to power placeholder academic pages (replace with real DB queries later).
export const departments = [
  { slug: 'computer-engineering', name: 'Computer Engineering', summary: 'Algorithms, systems, software, and hardware integration.' },
  { slug: 'telecommunications', name: 'Telecommunications', summary: 'Networks, wireless systems, signal processing and communication theory.' },
  { slug: 'power-systems', name: 'Power Systems', summary: 'Energy conversion, smart grids, and sustainable power technologies.' },
];

// Course mock data (subset of a typical ECE curriculum). Replace with real DB backed data later.
// Field meanings:
//  - type: CORE (compulsory) | ELECTIVE (student-selected)
//  - semester: 1..10 (or however curriculum is structured)
//  - prerequisites: array of course codes (coarse, not enforced in code yet)
export interface Course {
  code: string;
  title: string;
  credits: number; // ECTS
  semester: number;
  type: 'CORE' | 'ELECTIVE';
  prerequisites: string[];
  instructors: string[]; // names only (later map to faculty usernames)
  description: string;
  outcomes: string[]; // learning outcomes bullet points
}

export const courses: Course[] = [
  {
    code: 'ECE101',
    title: 'Introduction to Electrical & Computer Engineering',
    credits: 6,
    semester: 1,
    type: 'CORE',
    prerequisites: [],
    instructors: ['Staff'],
    description: 'Overview of the ECE discipline, subfields, professional ethics, and problem-solving methodologies.',
    outcomes: [
      'Differentiate major ECE sub-disciplines',
      'Explain the engineering design cycle',
      'Recognize ethical and societal impacts of technology'
    ]
  },
  {
    code: 'ECE102',
    title: 'Programming Fundamentals (C)',
    credits: 6,
    semester: 1,
    type: 'CORE',
    prerequisites: [],
    instructors: ['Dr. Jane Doe'],
    description: 'Introductory programming using C: control flow, data structures, modular design, and debugging.',
    outcomes: [
      'Write modular C programs using functions and headers',
      'Apply pointers and dynamic memory safely',
      'Use basic data structures (arrays, structs) effectively'
    ]
  },
  {
    code: 'ECE120',
    title: 'Discrete Mathematics for Computing',
    credits: 5,
    semester: 2,
    type: 'CORE',
    prerequisites: ['ECE102'],
    instructors: ['Prof. Alex Smith'],
    description: 'Logic, sets, functions, relations, combinatorics, graphs, and proof techniques relevant to computer engineering.',
    outcomes: [
      'Construct formal proofs (induction, contradiction)',
      'Analyze algorithm complexity using combinatorics',
      'Model systems with graphs and relations'
    ]
  },
  {
    code: 'ECE220',
    title: 'Data Structures & Algorithms',
    credits: 5,
    semester: 3,
    type: 'CORE',
    prerequisites: ['ECE102', 'ECE120'],
    instructors: ['Dr. Jane Doe'],
    description: 'Abstract data types, complexity analysis, trees, hash tables, priority queues, graphs, sorting and searching.',
    outcomes: [
      'Select appropriate data structures for problem constraints',
      'Implement and analyze asymptotic complexity of algorithms',
      'Apply graph algorithms to connectivity and path problems'
    ]
  },
  {
    code: 'ECE240',
    title: 'Circuit Analysis I',
    credits: 6,
    semester: 2,
    type: 'CORE',
    prerequisites: [],
    instructors: ['Staff'],
    description: 'Foundations of DC circuit analysis, network theorems, operational amplifiers, first-order transients.',
    outcomes: [
      'Apply KCL, KVL, and network theorems to solve circuits',
      'Analyze transient response of first-order circuits',
      'Model simple amplifier configurations'
    ]
  },
  {
    code: 'ECE310',
    title: 'Probability & Random Processes',
    credits: 5,
    semester: 4,
    type: 'CORE',
    prerequisites: ['ECE120'],
    instructors: ['Prof. Alex Smith'],
    description: 'Probability theory, random variables, expectations, distributions, and introduction to stochastic processes.',
    outcomes: [
      'Compute probabilities and expectations for common distributions',
      'Model engineering systems with random variables',
      'Interpret basic properties of random processes'
    ]
  },
  {
    code: 'ECE340',
    title: 'Signals & Systems',
    credits: 5,
    semester: 5,
    type: 'CORE',
    prerequisites: ['ECE310'],
    instructors: ['Staff'],
    description: 'Continuous and discrete-time signals, LTI systems, convolution, Fourier series and transforms, sampling.',
    outcomes: [
      'Characterize LTI system behavior in time and frequency domains',
      'Apply convolution and transform techniques',
      'Explain sampling theorem implications'
    ]
  },
  {
    code: 'ECE420',
    title: 'Embedded Systems Design',
    credits: 5,
    semester: 7,
    type: 'ELECTIVE',
    prerequisites: ['ECE220'],
    instructors: ['Dr. Jane Doe'],
    description: 'Microcontroller architecture, real-time constraints, interfacing, low-level optimization, and firmware reliability.',
    outcomes: [
      'Design interrupt-driven embedded applications',
      'Optimize memory and energy usage',
      'Interface sensors and communication peripherals'
    ]
  },
  {
    code: 'ECE450',
    title: 'Machine Learning Fundamentals',
    credits: 5,
    semester: 8,
    type: 'ELECTIVE',
    prerequisites: ['ECE220', 'ECE310'],
    instructors: ['Prof. Alex Smith'],
    description: 'Supervised learning, model evaluation, regularization, basic unsupervised techniques, and implementation principles.',
    outcomes: [
      'Evaluate model performance with appropriate metrics',
      'Mitigate overfitting using regularization',
      'Implement core ML algorithms from scratch'
    ]
  }
];

export const researchProjects = [
  { slug: 'edge-ai-labs', title: 'Edge AI Labs', area: 'Embedded Intelligence', blurb: 'Optimizing neural inference for constrained devices.' },
  { slug: 'smart-grid-optimizer', title: 'Smart Grid Optimizer', area: 'Energy Systems', blurb: 'Adaptive load balancing and predictive maintenance.' },
];

export const faculty = [
  { username: 'jdoe', name: 'Dr. Jane Doe', title: 'Associate Professor', department: 'Computer Engineering', interests: ['Distributed Systems', 'Databases'] },
  { username: 'asmith', name: 'Prof. Alex Smith', title: 'Professor', department: 'Telecommunications', interests: ['5G', 'Network Simulation'] },
];
