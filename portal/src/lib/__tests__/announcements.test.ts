import { parseAnnouncements, filterRecentWeeks, groupByISOWeek } from '../announcements';

const sampleHtml = `
<div class="announcements-list">
  <table><tbody>
    <tr class="clickable-row"><td>01/07/2025</td><td><a href="/gr/ann/1">First Title</a></td><td>General</td></tr>
    <tr class="clickable-row"><td>05/07/2025</td><td><a href="/gr/ann/2">Second Title</a></td><td>Events</td></tr>
    <tr class="clickable-row"><td>17/06/2025</td><td><a href="/gr/ann/3">Old Title</a></td><td>General</td></tr>
  </tbody></table>
</div>`;

describe('announcements utils', () => {
  it('parses rows correctly', () => {
    const parsed = parseAnnouncements(sampleHtml, 'https://www.ece.ntua.gr');
    expect(parsed).toHaveLength(3);
    expect(parsed[0].title).toBe('First Title');
    expect(parsed[1].link).toMatch('https://');
  });

  it('filters recent 4 weeks', () => {
    const parsed = parseAnnouncements(sampleHtml, 'https://www.ece.ntua.gr');
  const withDates = parsed.map(p => ({ ...p, dateObj: new Date(2025, 6, Number(p.date?.slice(0,2))) }));
  const filtered = filterRecentWeeks(withDates, 4);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('groups by ISO week', () => {
    const parsed = parseAnnouncements(sampleHtml, 'https://www.ece.ntua.gr');
  const withDates = parsed.map(p => ({ ...p, dateObj: new Date(2025, 6, Number(p.date?.slice(0,2))) }));
  const { groups } = groupByISOWeek(withDates);
    expect(Object.keys(groups).length).toBeGreaterThan(0);
  });
});
