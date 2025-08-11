"use client";
import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { CourseFilters } from './CourseFilters';

// Example flows for integrated master (replace with real data as needed)
const flows = [
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    description: 'Courses and electives focused on AI, machine learning, and data science.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'circuits',
    name: 'Circuits & Systems',
    description: 'Integrated circuits, analog/digital systems, and hardware design.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'networks',
    name: 'Networks & Security',
    description: 'Networking, cybersecurity, and distributed systems.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'robotics',
    name: 'Robotics & Automation',
    description: 'Robotics, control systems, and automation engineering.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  },
];

export type CourseLike = { code: string; title: string; credits: number; semester: number; type: 'CORE' | 'ELECTIVE' };

interface Props { courses: CourseLike[]; pageSize?: number }

  // Display flows in a grid with AI-generated images
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Integrated Master Flows</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {flows.map(flow => (
          <div key={flow.id} className="relative rounded-xl overflow-hidden shadow-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <img src={flow.image} alt={flow.name} className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="relative z-10 p-6 flex flex-col h-48 justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-accent)] drop-shadow-sm">{flow.name}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2 line-clamp-3">{flow.description}</p>
              </div>
              <Link href={`/flows/${flow.id}`} className="mt-4 inline-block px-4 py-1 rounded bg-[var(--color-accent)] text-white text-xs font-semibold shadow hover:bg-[var(--color-accent-alt)] transition">View Flow</Link>
            </div>
          </div>
        ))}
      </div>
      {/* ...existing course table and pagination below... */}
      <div className="mt-10">
        <CourseFilters courses={courses} onFilter={()=>{}} />
        {/* ...existing code for course table and pagination... */}
      </div>
    </div>
  );
