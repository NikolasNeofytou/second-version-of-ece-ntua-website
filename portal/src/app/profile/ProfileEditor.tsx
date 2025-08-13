"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useMemo } from 'react';
import Card from '@/components/Card';
import Cropper from 'react-easy-crop';
const avatarVariants = [
  '/default-avatar.svg',
  '/default-avatar-geometric-1.svg',
  '/default-avatar-geometric-2.svg',
  '/default-avatar-geometric-3.svg',
  '/default-avatar-geometric-4.svg',
  '/default-avatar-circuit.svg',
  '/default-avatar-lightning.svg',
  // keep only existing assets to avoid 404s
];
const bannerVariants = [
  '/default-banner.svg',
  '/default-banner-waveform.svg',
  '/default-banner-transformer.svg'
];
import Tag from '@/components/Tag';

interface FormState {
  year?: number;
  bio?: string;
  interests: string;
  skills: string;
  visibility: 'PUBLIC' | 'STUDENTS' | 'PRIVATE';
  avatarUrl?: string;
  bannerUrl?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  bioVisibility?: 'PUBLIC' | 'STUDENTS' | 'PRIVATE';
  interestsVisibility?: 'PUBLIC' | 'STUDENTS' | 'PRIVATE';
  skillsVisibility?: 'PUBLIC' | 'STUDENTS' | 'PRIVATE';
  yearVisibility?: 'PUBLIC' | 'STUDENTS' | 'PRIVATE';
  avatarVisibility?: 'PUBLIC' | 'STUDENTS' | 'PRIVATE';
  bannerVisibility?: 'PUBLIC' | 'STUDENTS' | 'PRIVATE';
}

interface ProfileEditorProps {
  editing: boolean;               // whether the form is visible (edit mode)
  onEditingChange(next: boolean): void; // callback to toggle edit mode
  username: string | null; // current user's username for share link
}

export default function ProfileEditor({ editing, onEditingChange, username }: ProfileEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FormState>({ interests: '', skills: '', visibility: 'PUBLIC' });
  const [statusMsg, setStatusMsg] = useState('');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [dragOver, setDragOver] = useState<'none'|'avatar'|'banner'>('none');
  const [cropOpen, setCropOpen] = useState(false);
  const [cropKind, setCropKind] = useState<'avatar'|'banner'|null>(null);
  const [cropSrc, setCropSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  function openCrop(kind: 'avatar'|'banner') {
    const src = kind === 'avatar' ? state.avatarUrl : state.bannerUrl;
    if (!src) return;
    setCropKind(kind);
    setCropSrc(src);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropOpen(true);
  }
  async function applyCrop() {
    if (!cropKind || !cropSrc || !croppedAreaPixels) { setCropOpen(false); return; }
    try {
      const out = await getCroppedImg(cropSrc, croppedAreaPixels);
      setState(s => cropKind === 'avatar' ? { ...s, avatarUrl: out } : { ...s, bannerUrl: out });
    } catch { /* ignore */ }
    setCropOpen(false);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (active && data.profile) {
          setState({
            year: data.profile.year ?? undefined,
            bio: data.profile.bio ?? '',
            interests: (data.profile.interests || []).join(', '),
            skills: (data.profile.skills || []).join(', '),
            visibility: data.profile.visibility || 'PUBLIC',
            avatarUrl: data.profile.avatarUrl || '',
            bannerUrl: data.profile.bannerUrl || '',
            bioVisibility: data.profile.bioVisibility || 'PUBLIC',
            interestsVisibility: data.profile.interestsVisibility || 'PUBLIC',
            skillsVisibility: data.profile.skillsVisibility || 'PUBLIC',
            yearVisibility: data.profile.yearVisibility || 'PUBLIC',
            avatarVisibility: data.profile.avatarVisibility || 'PUBLIC',
            bannerVisibility: data.profile.bannerVisibility || 'PUBLIC'
          });
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setStatusMsg('');
    try {
      const payload = {
        year: state.year ? Number(state.year) : undefined,
        bio: state.bio?.trim() || undefined,
        interests: state.interests.split(',').map(s=>s.trim()).filter(Boolean),
        skills: state.skills.split(',').map(s=>s.trim()).filter(Boolean),
  visibility: state.visibility,
  avatarUrl: state.avatarUrl?.trim() || undefined,
  bannerUrl: state.bannerUrl?.trim() || undefined
      };
      const vis = {
        bioVisibility: state.bioVisibility,
        interestsVisibility: state.interestsVisibility,
        skillsVisibility: state.skillsVisibility,
        yearVisibility: state.yearVisibility,
        avatarVisibility: state.avatarVisibility,
        bannerVisibility: state.bannerVisibility
      };
      Object.assign(payload, vis);
      const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setStatusMsg('Saved');
      // Notify other components (e.g., completeness banner) to refresh
      window.dispatchEvent(new Event('profile:saved'));
      // After successful save, collapse edit mode after a short delay so user sees status
      setTimeout(() => onEditingChange(false), 600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }
  const interestList = useMemo(() => state.interests.split(',').map(s=>s.trim()).filter(Boolean), [state.interests]);
  const skillList = useMemo(() => state.skills.split(',').map(s=>s.trim()).filter(Boolean), [state.skills]);
  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl animate-pulse" aria-hidden>
        <div className="relative w-full h-32 rounded-md overflow-hidden border border-[var(--color-border)]" style={{ background: 'var(--skeleton)' }} />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-md h-28" style={{ background: 'var(--skeleton)' }} />
          <div className="rounded-md h-28" style={{ background: 'var(--skeleton)' }} />
          <div className="rounded-md h-28" style={{ background: 'var(--skeleton)' }} />
        </div>
      </div>
    );
  }

  if (!editing) {
    // Helper to render limited tags with +N more
    const renderTagList = (items: string[], tone: 'interest' | 'skill') => {
      const limit = 10;
      const visible = items.slice(0, limit);
      const hidden = items.length - visible.length;
      return (
        <div className="flex flex-wrap gap-2 min-h-10">
          {visible.length ? visible.map(v => <Tag key={v} tone={tone}>{v}</Tag>) : <span className="text-[10px] text-[var(--color-text-secondary)]">No {tone === 'interest' ? 'interests' : 'skills'} yet.</span>}
          {hidden > 0 && (
            <span className="text-[10px] px-2 py-1 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]">+{hidden} more</span>
          )}
        </div>
      );
    };

    const bio = (state.bio || '').trim();
    const bioShort = bio.length > 240 && !bioExpanded ? bio.slice(0, 240) + '…' : bio || 'No bio yet.';

    return (
      <div className="space-y-6 max-w-3xl" aria-live="polite">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4 text-xs flex-1">
            <div className="relative w-full h-32 rounded-md overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              {state.bannerUrl ? (
                <img src={state.bannerUrl} alt="Banner" className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-text-secondary)]">No banner</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-full border-2 border-[var(--color-surface)] overflow-hidden bg-[var(--color-surface-alt)] shadow">
                {state.avatarUrl ? (
                  <img src={state.avatarUrl} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-[var(--color-text-secondary)]">No avatar</div>
                )}
              </div>
            </div>
            <div className="pt-8">
              <div className="flex gap-4 flex-wrap">
                <div><span className="uppercase tracking-wide text-[10px] text-[var(--color-text-secondary)]">Year</span><p className="font-medium mt-0.5">{state.year ?? '—'}</p></div>
                <div><span className="uppercase tracking-wide text-[10px] text-[var(--color-text-secondary)]">Visibility</span><p className="font-medium mt-0.5">{state.visibility}</p></div>
              </div>
              <div className="flex gap-3 mt-4">
                {state.linkedin && <a href={state.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs underline hover:text-[var(--color-accent)]">LinkedIn</a>}
                {state.github && <a href={state.github} target="_blank" rel="noopener noreferrer" className="text-xs underline hover:text-[var(--color-accent)]">GitHub</a>}
                {state.website && <a href={state.website} target="_blank" rel="noopener noreferrer" className="text-xs underline hover:text-[var(--color-accent)]">Website</a>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEditingChange(true)} className="btn-primary text-xs self-start">Edit Profile</button>
            {username && <a href={`/u/${username}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 rounded-sm border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition">Public View</a>}
            {username && (
              <button
                type="button"
                className="text-xs px-3 py-1 rounded-sm border border-[var(--color-accent)] bg-[var(--color-surface)] hover:bg-[var(--color-accent)] hover:text-white transition"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
                  setShareCopied(true);
                  window.setTimeout(() => setShareCopied(false), 1200);
                }}
                aria-label="Copy public profile link"
              >{shareCopied ? 'Copied!' : 'Share Profile'}</button>
            )}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3 reveal-up">
          <Card className="md:col-span-2" title="About" interactive={false}>
            <div className="text-xs leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap min-h-16">
              {bioShort}
            </div>
            {bio.length > 240 && (
              <button type="button" onClick={() => setBioExpanded(v => !v)} className="text-[10px] underline mt-2 self-start">
                {bioExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </Card>
          <Card title="Snapshot" interactive={false}>
            <ul className="text-[10px] space-y-1 text-[var(--color-text-secondary)]">
              <li>Profile visibility: <span className="font-medium text-[var(--color-text-primary)]">{state.visibility}</span></li>
              <li>Interests: <span className="font-medium text-[var(--color-text-primary)]">{interestList.length}</span></li>
              <li>Skills: <span className="font-medium text-[var(--color-text-primary)]">{skillList.length}</span></li>
            </ul>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 reveal-up">
          <Card title="Interests" interactive={false}>
            {renderTagList(interestList, 'interest')}
          </Card>
          <Card title="Skills" interactive={false}>
            {renderTagList(skillList, 'skill')}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl" aria-describedby="profile-status" noValidate>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Edit Profile</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => onEditingChange(false)} disabled={saving} className="text-xs px-3 py-1 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-xs disabled:opacity-50">{saving? 'Saving...':'Save'}</button>
        </div>
      </div>
  <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <span>Year</span>
          <input type="number" min={1} max={10} value={state.year ?? ''} onChange={e=> setState(s=> ({...s, year: e.target.value? Number(e.target.value): undefined}))} className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>LinkedIn</span>
          <input type="url" value={state.linkedin || ''} onChange={e=> setState(s=> ({...s, linkedin: e.target.value}))} placeholder="https://linkedin.com/in/username" className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>GitHub</span>
          <input type="url" value={state.github || ''} onChange={e=> setState(s=> ({...s, github: e.target.value}))} placeholder="https://github.com/username" className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>Website</span>
          <input type="url" value={state.website || ''} onChange={e=> setState(s=> ({...s, website: e.target.value}))} placeholder="https://yourwebsite.com" className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)]" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>Visibility</span>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={()=>setState(s=>({...s, visibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.visibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'}`}>Public</button>
            <button type="button" onClick={()=>setState(s=>({...s, visibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.visibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'}`}>Private</button>
          </div>
        </label>
      </div>
      <details className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-4">
        <summary className="cursor-pointer text-xs font-medium select-none">Privacy & Field Visibility</summary>
        <div className="grid gap-4 sm:grid-cols-3 text-xs">
          <label className="flex flex-col gap-1">
            <span>Year Visibility</span>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setState(s=>({...s, yearVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.yearVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Public</button>
              <button type="button" onClick={()=>setState(s=>({...s, yearVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.yearVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Private</button>
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span>Bio Visibility</span>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setState(s=>({...s, bioVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.bioVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Public</button>
              <button type="button" onClick={()=>setState(s=>({...s, bioVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.bioVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Private</button>
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span>Avatar Visibility</span>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setState(s=>({...s, avatarVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.avatarVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Public</button>
              <button type="button" onClick={()=>setState(s=>({...s, avatarVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.avatarVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Private</button>
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span>Banner Visibility</span>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setState(s=>({...s, bannerVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.bannerVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Public</button>
              <button type="button" onClick={()=>setState(s=>({...s, bannerVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.bannerVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Private</button>
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span>Interests Visibility</span>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setState(s=>({...s, interestsVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.interestsVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Public</button>
              <button type="button" onClick={()=>setState(s=>({...s, interestsVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.interestsVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Private</button>
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span>Skills Visibility</span>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setState(s=>({...s, skillsVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.skillsVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Public</button>
              <button type="button" onClick={()=>setState(s=>({...s, skillsVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.skillsVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Private</button>
            </div>
          </label>
        </div>
        <p className="text-[10px] text-[var(--color-text-secondary)]">Private fields are excluded from completeness scoring.</p>
      </details>
      <div className="rounded-md border border-[var(--color-border)] p-4 bg-[var(--color-surface)] space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-xs">
            <span>Avatar</span>
            <div
              className={`flex gap-2 mt-2 items-center rounded-sm ${dragOver==='avatar' ? 'outline outline-2 outline-[var(--color-accent)]/50' : ''}`}
              onDragOver={(e)=>{e.preventDefault(); setDragOver('avatar');}}
              onDragLeave={()=> setDragOver('none')}
              onDrop={(e)=>{
                e.preventDefault(); setDragOver('none');
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = ev => setState(s => ({ ...s, avatarUrl: ev.target?.result as string }));
                  reader.readAsDataURL(file);
                }
              }}
            >
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = ev => {
                    setState(s => ({ ...s, avatarUrl: ev.target?.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }} className="text-xs" />
              {avatarVariants.map(url => (
                <button type="button" key={url} onClick={()=>setState(s=>({...s, avatarUrl: url}))} className={`rounded-full border-2 ${state.avatarUrl===url ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'} w-10 h-10 overflow-hidden bg-[var(--color-surface-alt)]`}>
                  <img src={url} alt="avatar variant" className="object-cover w-full h-full" />
                </button>
              ))}
              <button type="button" onClick={()=>setState(s=>({...s, avatarUrl: avatarVariants[Math.floor(Math.random()*avatarVariants.length)]}))} className="px-2 py-1 rounded border border-[var(--color-accent)] text-xs ml-2">Shuffle</button>
              <button type="button" disabled={!state.avatarUrl} onClick={()=>openCrop('avatar')} className="px-2 py-1 rounded border border-[var(--color-border)] text-xs ml-2 disabled:opacity-50">Crop</button>
            </div>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span>Avatar Visibility</span>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setState(s=>({...s, avatarVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.avatarVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Public</button>
              <button type="button" onClick={()=>setState(s=>({...s, avatarVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.avatarVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Private</button>
            </div>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span>Banner</span>
            <div
              className={`flex gap-2 mt-2 items-center rounded-sm ${dragOver==='banner' ? 'outline outline-2 outline-[var(--color-accent)]/50' : ''}`}
              onDragOver={(e)=>{e.preventDefault(); setDragOver('banner');}}
              onDragLeave={()=> setDragOver('none')}
              onDrop={(e)=>{
                e.preventDefault(); setDragOver('none');
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = ev => setState(s => ({ ...s, bannerUrl: ev.target?.result as string }));
                  reader.readAsDataURL(file);
                }
              }}
            >
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = ev => {
                    setState(s => ({ ...s, bannerUrl: ev.target?.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }} className="text-xs" />
              {bannerVariants.map(url => (
                <button type="button" key={url} onClick={()=>setState(s=>({...s, bannerUrl: url}))} className={`rounded border-2 ${state.bannerUrl===url ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'} w-24 h-10 overflow-hidden bg-[var(--color-surface-alt)]`}>
                  <img src={url} alt="banner variant" className="object-cover w-full h-full" />
                </button>
              ))}
              <button type="button" onClick={()=>setState(s=>({...s, bannerUrl: bannerVariants[Math.floor(Math.random()*bannerVariants.length)]}))} className="px-2 py-1 rounded border border-[var(--color-accent)] text-xs ml-2">Shuffle</button>
              <button type="button" disabled={!state.bannerUrl} onClick={()=>openCrop('banner')} className="px-2 py-1 rounded border border-[var(--color-border)] text-xs ml-2 disabled:opacity-50">Crop</button>
            </div>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span>Banner Visibility</span>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={()=>setState(s=>({...s, bannerVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.bannerVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Public</button>
              <button type="button" onClick={()=>setState(s=>({...s, bannerVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.bannerVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]'}`}>Private</button>
            </div>
          </label>
        </div>
        <div className="flex gap-4 items-start">
          <div className="relative w-48 h-24 rounded-md overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            {state.bannerUrl ? <img src={state.bannerUrl} alt="Banner preview" className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-text-secondary)]">Banner preview</div>}
          </div>
          <div className="w-16 h-16 rounded-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            {state.avatarUrl ? <img src={state.avatarUrl} alt="Avatar preview" className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-text-secondary)]">Avatar</div>}
          </div>
        </div>
      </div>
      <label className="flex flex-col gap-1 text-xs">
        <span>Bio</span>
  <textarea value={state.bio} onChange={e=> setState(s=> ({...s, bio: e.target.value}))} rows={4} maxLength={1000} className="px-2 py-1 rounded-sm bg-[var(--color-surface)] border border-[var(--color-border)] resize-y" />
  <span className="text-[9px] text-[var(--color-text-secondary)] self-end">{(state.bio?.length||0)}/1000</span>
      </label>
  <TagEditor label="Interests" value={state.interests} onChange={v=> setState(s=> ({...s, interests: v}))} placeholder="Add an interest" tone="interest" />
      <div className="flex flex-col gap-1 text-xs max-w-sm">
        <span>Interests Visibility</span>
        <div className="flex gap-2 mt-1">
          <button type="button" onClick={()=>setState(s=>({...s, interestsVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.interestsVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'}`}>Public</button>
          <button type="button" onClick={()=>setState(s=>({...s, interestsVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.interestsVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'}`}>Private</button>
        </div>
      </div>
  <TagEditor label="Skills" value={state.skills} onChange={v=> setState(s=> ({...s, skills: v}))} placeholder="Add a skill" tone="skill" />
      <div className="flex flex-col gap-1 text-xs max-w-sm">
        <span>Skills Visibility</span>
        <div className="flex gap-2 mt-1">
          <button type="button" onClick={()=>setState(s=>({...s, skillsVisibility: 'PUBLIC'}))} className={`px-2 py-1 rounded border text-xs ${state.skillsVisibility==='PUBLIC' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'}`}>Public</button>
          <button type="button" onClick={()=>setState(s=>({...s, skillsVisibility: 'PRIVATE'}))} className={`px-2 py-1 rounded border text-xs ${state.skillsVisibility==='PRIVATE' ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]'}`}>Private</button>
        </div>
      </div>
      {/* Live preview */}
      <div className="rounded-md border border-[var(--color-border)] p-4 bg-[var(--color-surface)] space-y-3">
        <h3 className="text-sm font-semibold tracking-wide">Live Preview</h3>
        <div className="relative w-full h-28 rounded-md overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          {state.bannerUrl ? (
            <img src={state.bannerUrl} alt="Banner preview" className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--color-text-secondary)]">Banner</div>
          )}
          <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-full border-2 border-[var(--color-surface)] overflow-hidden bg-[var(--color-surface-alt)] shadow">
            {state.avatarUrl ? (
              <img src={state.avatarUrl} alt="Avatar preview" className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[9px] text-[var(--color-text-secondary)]">Avatar</div>
            )}
          </div>
        </div>
        <div className="pt-6 text-[10px] text-[var(--color-text-secondary)]">
          <span>Bio: </span>
          <span className="text-[var(--color-text-primary)]">{(state.bio || '').slice(0, 120) || '—'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {interestList.slice(0,6).map(i => <Tag key={i} tone="interest">{i}</Tag>)}
          {skillList.slice(0,6).map(s => <Tag key={s} tone="skill">{s}</Tag>)}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {error && <span className="text-[10px] text-[var(--color-error)]">{error}</span>}
        {statusMsg && <span id="profile-status" className="text-[10px] text-[var(--color-success)]" aria-live="polite">{statusMsg}</span>}
      </div>
      {/* Cropper Modal */}
      {cropOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setCropOpen(false)} />
          <div className="relative z-10 w-[90vw] max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-md p-4 space-y-3">
            <h3 className="text-sm font-semibold">Crop {cropKind === 'avatar' ? 'Avatar' : 'Banner'}</h3>
            <div className="relative w-full h-[50vh] bg-[var(--color-surface-alt)] rounded-sm overflow-hidden">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropKind === 'avatar' ? 1 : 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels)=> setCroppedAreaPixels(areaPixels)}
                objectFit="cover"
              />
            </div>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e=> setZoom(parseFloat(e.target.value))} className="w-full" />
              <span className="text-[10px] text-[var(--color-text-secondary)]">{zoom.toFixed(1)}x</span>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={()=>setCropOpen(false)} className="text-xs px-3 py-1 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)]">Cancel</button>
              <button type="button" onClick={applyCrop} className="btn-primary text-xs">Apply</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

interface TagEditorProps {
  label: string;
  value: string; // comma string
  onChange(v: string): void;
  placeholder?: string;
  tone: 'interest' | 'skill';
}

function TagEditor({ label, value, onChange, placeholder, tone }: TagEditorProps) {
  const items = value.split(',').map(s=>s.trim()).filter(Boolean);
  const [input, setInput] = useState('');
  function addCurrent() {
    const v = input.trim();
    if (!v) return;
    if (items.includes(v)) { setInput(''); return; }
    onChange([...items, v].join(', '));
    setInput('');
  }
  function remove(item: string) {
    onChange(items.filter(i=> i!==item).join(', '));
  }
  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addCurrent(); }
    if (e.key === 'Backspace' && !input && items.length) {
      onChange(items.slice(0,-1).join(', '));
    }
  }
  return (
    <div className="flex flex-col gap-1 text-xs">
      <span className="font-medium">{label}</span>
      <div className="flex flex-wrap gap-2 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] p-2 min-h-12">
        {items.map(it => (
          <button key={it} type="button" onClick={()=>remove(it)} className="group focus:outline-none">
            <Tag tone={tone} seed={it}>{it}<span className="ml-1 text-[8px] opacity-50 group-hover:opacity-100">×</span></Tag>
          </button>
        ))}
        <input
          value={input}
          onChange={e=> setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={addCurrent}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-[10px] placeholder:text-[var(--color-text-secondary)]"
        />
      </div>
      <p className="text-[9px] text-[var(--color-text-secondary)]">Press Enter to add. Click a chip to remove.</p>
    </div>
  );
}

// Canvas-based crop export
async function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D context');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return canvas.toDataURL('image/png');
}
