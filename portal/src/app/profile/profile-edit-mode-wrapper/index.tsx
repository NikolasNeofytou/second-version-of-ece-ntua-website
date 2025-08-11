"use client";
import { useEffect, useState } from 'react';
import ProfileEditor from '../ProfileEditor';
import { useSession } from 'next-auth/react';

export default function EditModeProvider() {
  const [editing, setEditing] = useState(false);
  const { data: session } = useSession();
  useEffect(() => {
    function handler() { setEditing(true); }
    window.addEventListener('profile:request-edit', handler);
    return () => window.removeEventListener('profile:request-edit', handler);
  }, []);
  return <ProfileEditor username={session?.user?.username || null} editing={editing} onEditingChange={setEditing} />;
}
