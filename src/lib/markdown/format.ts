export function formatMonthYear(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  const monthIndex = Number(month) - 1;
  if (!year || monthIndex < 0 || monthIndex > 11) {
    return isoDate;
  }
  const label = new Date(Number(year), monthIndex, 1).toLocaleString('en-US', {
    month: 'short',
  });
  return `${label} ${year}`;
}

export function formatExperienceRange(
  startDate: string | null,
  endDate: string | null,
  endNote: string | null,
): string {
  const start = startDate ? formatMonthYear(startDate) : '';
  const end = endDate
    ? formatMonthYear(endDate)
    : endNote
      ? endNote
      : 'Present';
  if (!start) {
    return end;
  }
  return `${start} – ${end}`;
}

export function formatIsoDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function joinMarkdown(parts: string[]): string {
  return parts.filter((part) => part.length > 0).join('\n\n');
}
