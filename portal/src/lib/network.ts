export interface UserProfile {
  id: string;
  name: string;
  avatar?: string; // future
  year: number; // academic year (1-5)
  interests: string[];
  skills: string[];
  bio?: string;
  availability?: string; // e.g. "Looking for lab partner"
}

// Temporary in-memory dataset (replace with DB/API later)
export const sampleProfiles: UserProfile[] = [
  {
    id: 'u1',
    name: 'Eleni Papadopoulou',
    year: 3,
    interests: ['Embedded', 'VLSI'],
    skills: ['C', 'Verilog', 'Arduino'],
    bio: 'Interested in low-power design and open hardware projects.',
    availability: 'Looking for lab partner'
  },
  {
    id: 'u2',
    name: 'Giorgos Nikolaidis',
    year: 2,
    interests: ['Web', 'AI'],
    skills: ['TypeScript', 'React', 'Python'],
    bio: 'Building side projects with Next.js and experimenting with LLMs.'
  },
  {
    id: 'u3',
    name: 'Maria Ioannou',
    year: 4,
    interests: ['Signal Processing', 'ML'],
    skills: ['Python', 'NumPy', 'MATLAB'],
    bio: 'DSP + ML enthusiast. Open to research collaborations.'
  },
  {
    id: 'u4',
    name: 'Andreas Kostas',
    year: 5,
    interests: ['Networks', 'Security'],
    skills: ['Go', 'Rust', 'Linux'],
    bio: 'Exploring secure routing protocols.'
  }
];

export interface ProfileFilter {
  q?: string;
  year?: number;
  interest?: string;
}

export function filterProfiles(list: UserProfile[], filter: ProfileFilter): UserProfile[] {
  return list.filter(p => {
    if (filter.year && p.year !== filter.year) return false;
    if (filter.interest && !p.interests.includes(filter.interest)) return false;
    if (filter.q) {
      const q = filter.q.toLowerCase();
      const hay = [p.name, p.bio, ...p.interests, ...p.skills].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function extractYears(list: UserProfile[]): number[] {
  return Array.from(new Set(list.map(p => p.year))).sort((a,b)=>a-b);
}

export function extractInterests(list: UserProfile[]): string[] {
  return Array.from(new Set(list.flatMap(p => p.interests))).sort();
}
