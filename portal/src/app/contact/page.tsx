export default function ContactPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="text-[var(--color-text-secondary)] text-sm md:text-base">Use official department channels for administrative matters. This portal will later include feedback and issue reporting workflows.</p>
      <ul className="text-sm space-y-2">
        <li><strong>Email:</strong> <span className="text-[var(--color-text-secondary)]">department@example.edu</span></li>
        <li><strong>Phone:</strong> <span className="text-[var(--color-text-secondary)]">+30 210 0000000</span></li>
        <li><strong>Address:</strong> <span className="text-[var(--color-text-secondary)]">Zografou Campus, Athens</span></li>
      </ul>
      <p className="text-[var(--color-text-secondary)] text-xs">(Placeholder) Implement form submission, maps, and escalation routing later.</p>
    </div>
  );
}
