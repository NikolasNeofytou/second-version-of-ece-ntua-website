import { prisma } from '@/lib/prisma';

export interface PhotosListOptions {
  userId: string;
  albumId?: string;
  pageSize?: number;
  pageToken?: string;
}

export interface MediaMetadata {
  creationTime?: string;
  width?: string;
  height?: string;
  photo?: unknown;
  video?: { fps?: number } | unknown;
}

export interface MediaItem {
  id: string;
  baseUrl: string;
  mimeType: string;
  filename?: string;
  mediaMetadata?: MediaMetadata;
}

export interface MediaItemsResponse {
  mediaItems?: MediaItem[];
  nextPageToken?: string;
}

async function refreshAccessToken(userId: string, refreshToken: string) {
  const params = new URLSearchParams();
  params.set('client_id', process.env.GOOGLE_CLIENT_ID || '');
  params.set('client_secret', process.env.GOOGLE_CLIENT_SECRET || '');
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', refreshToken);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString()
  });
  if (!res.ok) throw new Error('Failed to refresh Google access token');
  const json = await res.json() as { access_token: string; expires_in?: number; id_token?: string; scope?: string; token_type?: string };
  const expiresAt = json.expires_in ? Math.floor(Date.now() / 1000) + json.expires_in : null;
  await prisma.account.updateMany({
    where: { userId, provider: 'google' },
    data: { access_token: json.access_token, expires_at: expiresAt ?? undefined, scope: json.scope ?? undefined, token_type: json.token_type ?? undefined }
  });
  return { accessToken: json.access_token, expiresAt };
}

export async function getGoogleAccessToken(userId: string) {
  // Use the NextAuth Account table to fetch the latest access token for Google; refresh if expired.
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
    orderBy: { expires_at: 'desc' }
  });
  if (!account?.access_token) throw new Error('No Google access token found for user');
  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at - 60 < now && account.refresh_token) {
    try {
      const refreshed = await refreshAccessToken(userId, account.refresh_token);
      return { accessToken: refreshed.accessToken, refreshToken: account.refresh_token, expiresAt: refreshed.expiresAt };
    } catch {
      // Fall back to existing token; request may fail if it's actually expired.
    }
  }
  return { accessToken: account.access_token, refreshToken: account.refresh_token ?? null, expiresAt: account.expires_at ?? null };
}

export async function listPhotosInAlbum(opts: PhotosListOptions): Promise<MediaItemsResponse> {
  const { accessToken } = await getGoogleAccessToken(opts.userId);
  // Using Photos Library API via REST; googleapis has only discovery-based limited support, so we call fetch manually if needed.
  const url = 'https://photoslibrary.googleapis.com/v1/mediaItems:search';
  const body: { pageSize: number; albumId?: string; pageToken?: string } = { pageSize: opts.pageSize ?? 50 };
  if (opts.albumId) body.albumId = opts.albumId;
  if (opts.pageToken) body.pageToken = opts.pageToken;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Google Photos API error: ${res.status}`);
  const data = await res.json() as MediaItemsResponse;
  return data;
}

export async function listAlbums(userId: string, pageSize = 50, pageToken?: string) {
  const { accessToken } = await getGoogleAccessToken(userId);
  const url = new URL('https://photoslibrary.googleapis.com/v1/albums');
  url.searchParams.set('pageSize', String(pageSize));
  if (pageToken) url.searchParams.set('pageToken', pageToken);
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Google Photos albums error: ${res.status}`);
  return res.json() as Promise<{ albums?: Array<{ id: string; title: string }>; nextPageToken?: string }>;
}
