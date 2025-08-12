"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProfileEditor from './ProfileEditor';

export default function EditModeProvider() {
  const [editing, setEditing] = useState(false);
  const { data } = useSession();
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const u = (data?.user as unknown as { username?: string; name?: string } | undefined)?.username || (data?.user?.name ?? null);
    setUsername(u ? String(u) : null);
  }, [data]);
  return <ProfileEditor editing={editing} onEditingChange={setEditing} username={username} />;
}
