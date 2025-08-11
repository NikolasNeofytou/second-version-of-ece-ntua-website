export default function FAQPage() {
  const faqs = [
    { q: 'How do I edit my profile?', a: 'Go to the Profile page and switch to edit mode. Field-level visibility controls are available in the Privacy panel.'},
    { q: 'How are announcements sourced?', a: 'Currently mocked/fetched via a script. Future integration with official feeds is planned.'},
    { q: 'Can I contribute?', a: 'Yes. The portal is open source—submit issues or PRs for improvements.'},
  ];
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
      <ul className="space-y-4">
        {faqs.map(item => (
          <li key={item.q} className="p-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <h2 className="font-medium mb-1">{item.q}</h2>
            <p className="text-[var(--color-text-secondary)] text-sm">{item.a}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
