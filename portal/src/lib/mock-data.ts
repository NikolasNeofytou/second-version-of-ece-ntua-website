// Simple mock data to power placeholder academic pages (replace with real DB queries later).
export const departments = [
  { slug: 'computer-engineering', name: 'Computer Engineering', summary: 'Algorithms, systems, software, and hardware integration.' },
  { slug: 'telecommunications', name: 'Telecommunications', summary: 'Networks, wireless systems, signal processing and communication theory.' },
  { slug: 'power-systems', name: 'Power Systems', summary: 'Energy conversion, smart grids, and sustainable power technologies.' },
];

export const courses = [
  { code: 'ECE101', title: 'Introduction to Electrical & Computer Engineering', credits: 6 },
  { code: 'ECE220', title: 'Data Structures & Algorithms', credits: 5 },
  { code: 'ECE340', title: 'Signals & Systems', credits: 5 },
];

export const researchProjects = [
  { slug: 'edge-ai-labs', title: 'Edge AI Labs', area: 'Embedded Intelligence', blurb: 'Optimizing neural inference for constrained devices.' },
  { slug: 'smart-grid-optimizer', title: 'Smart Grid Optimizer', area: 'Energy Systems', blurb: 'Adaptive load balancing and predictive maintenance.' },
];

export const faculty = [
  { username: 'jdoe', name: 'Dr. Jane Doe', title: 'Associate Professor', department: 'Computer Engineering', interests: ['Distributed Systems', 'Databases'] },
  { username: 'asmith', name: 'Prof. Alex Smith', title: 'Professor', department: 'Telecommunications', interests: ['5G', 'Network Simulation'] },
];
