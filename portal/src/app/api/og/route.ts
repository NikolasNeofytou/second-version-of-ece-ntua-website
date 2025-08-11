import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getProfileByUsername } from '@/lib/profile';

export const runtime = 'edge';

const fontSans = fetch(new URL('../../../../public/Geist-Regular.ttf', import.meta.url)).then(r=> r.arrayBuffer()).catch(()=> null);
const fontMono = fetch(new URL('../../../../public/GeistMono-Regular.ttf', import.meta.url)).then(r=> r.arrayBuffer()).catch(()=> null);

function gradient(seed: string) {
  let hash = 0; for (let i=0;i<seed.length;i++) hash = (hash*31 + seed.charCodeAt(i))|0; hash = Math.abs(hash);
  const h1 = hash % 360; const h2 = (hash*7)%360; return `linear-gradient(120deg,hsl(${h1} 70% 40%),hsl(${h2} 70% 40%))`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'generic';
  const title = searchParams.get('title') || 'ECE NTUA Portal';
  const subtitle = searchParams.get('subtitle') || undefined;
  const username = searchParams.get('username') || undefined;
  let resolvedTitle = title;
  let resolvedSubtitle = subtitle;
  let avatar: string | undefined;

  if (type === 'profile' && username) {
    try {
      const data = await getProfileByUsername(username.toLowerCase());
      if (data) {
        resolvedTitle = data.user.username || data.user.name || title;
        if (data.profile.year) resolvedSubtitle = `Year ${data.profile.year}`;
        if (data.profile.avatarVisibility !== 'PRIVATE') avatar = data.profile.avatarUrl || undefined;
      }
    } catch {}
  }

  const fontDataSans = await fontSans;
  const fontDataMono = await fontMono;

  const element = {
    type: 'div',
    props: {
      style: {
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        fontFamily: 'Geist, system-ui, sans-serif', background: gradient(resolvedTitle), color: '#fff', padding: '60px'
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '32px' },
            children: [
              avatar ? { type: 'img', props: { src: avatar, width: 160, height: 160, style: { borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }, alt: 'avatar' } } : null,
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '900px' },
                  children: [
                    { type: 'div', props: { style: { fontSize: 84, lineHeight: 1.05, fontWeight: 600 }, children: resolvedTitle } },
                    resolvedSubtitle ? { type: 'div', props: { style: { fontSize: 36, opacity: 0.85 }, children: resolvedSubtitle } } : null
                  ].filter(Boolean)
                }
              }
            ].filter(Boolean)
          }
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', fontSize: 30, opacity: 0.9, fontFamily: 'Geist Mono, monospace', justifyContent: 'space-between', width: '100%' },
            children: [
              { type: 'span', props: { children: 'ece.ntua portal' } },
              { type: 'span', props: { children: type } }
            ]
          }
        }
      ]
    }
  } as unknown as React.ReactElement;

  type Font = { name: string; data: ArrayBuffer; style?: 'normal'; weight?: 400 };
  const fonts: Font[] = [
    fontDataSans && { name: 'Geist', data: fontDataSans as ArrayBuffer, style: 'normal', weight: 400 },
    fontDataMono && { name: 'Geist Mono', data: fontDataMono as ArrayBuffer, style: 'normal', weight: 400 }
  ].filter(Boolean) as Font[];

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
    fonts
  });
}
