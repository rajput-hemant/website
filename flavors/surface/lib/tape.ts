/**
 * The multitrack tape: every role is a clip on its own track, laid on one
 * shared time axis that runs from the January of the first start to the end
 * of the current year. Positions are fractions of the tape, 0 to 1.
 */
export type TapeRole = { id: string; startDate: string; endDate?: string };

export type Clip = {
  id: string;
  left: number;
  width: number;
  ongoing: boolean;
};

export type Tape = {
  clips: Clip[];
  years: { year: number; left: number }[];
  /** Where today falls on the tape: the playhead. */
  now: number;
};

const month = (iso: string) =>
  Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7)) - 1;

export function layTape(roles: readonly TapeRole[], today: Date): Tape {
  const current = today.getFullYear() * 12 + today.getMonth();
  const firstYear = Math.min(
    today.getFullYear(),
    ...roles.map((role) => Number(role.startDate.slice(0, 4)))
  );
  const from = firstYear * 12;
  const to = (today.getFullYear() + 1) * 12;
  const span = to - from;
  const at = (m: number) => Math.min(Math.max((m - from) / span, 0), 1);

  const clips = roles.map((role) => {
    const start = month(role.startDate);
    // An end date names the last month worked; a role in progress runs to today.
    const end = role.endDate ? month(role.endDate) + 1 : current + 1;
    return {
      id: role.id,
      left: at(start),
      width: Math.max(at(end) - at(start), 1 / span),
      ongoing: !role.endDate,
    };
  });

  const years = [];
  for (let year = firstYear; year <= today.getFullYear(); year++) {
    years.push({ year, left: at(year * 12) });
  }

  return { clips, years, now: at(current + today.getDate() / 31) };
}
