import { redirect } from 'next/navigation';

// Temporary redirect to announcements until an intranet-specific news feed exists.
export default function IntranetNewsRedirect() {
  redirect('/announcements');
}
