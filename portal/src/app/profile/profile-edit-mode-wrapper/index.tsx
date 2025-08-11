"use client";
import { useEffect, useState } from 'react';
import ProfileEditor from '../ProfileEditor';

export default function EditModeProvider() {
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    function handler() { setEditing(true); }
    window.addEventListener('profile:request-edit', handler);
    return () => window.removeEventListener('profile:request-edit', handler);
  }, []);
  return <ProfileEditor editing={editing} onEditingChange={setEditing} />;
}
