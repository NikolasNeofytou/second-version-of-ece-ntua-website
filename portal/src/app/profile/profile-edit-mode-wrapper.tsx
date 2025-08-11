"use client";
import { useState } from 'react';
import ProfileEditor from './ProfileEditor';

export default function EditModeProvider() {
  const [editing, setEditing] = useState(false);
  return <ProfileEditor editing={editing} onEditingChange={setEditing} />;
}
