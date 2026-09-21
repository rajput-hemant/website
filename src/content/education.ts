export const education = [
  {
    institution: 'GLA University',
    degree: 'B.Tech Computer Science and Engineering',
    location: 'Chaumuhan, Mathura',
    startYear: 2020,
    endYear: 2024,
    score: 'CPI 7.22',
    order: 1,
  },
  {
    institution: 'Gyan Deep Shiksha Bharati',
    degree: 'Intermediate (CBSE)',
    location: 'Mathura',
    startYear: 2020,
    endYear: 2020,
    score: '75.8%',
    order: 2,
  },
  {
    institution: 'Gyan Deep Shiksha Bharati',
    degree: 'Matriculation',
    location: 'Mathura',
    startYear: 2018,
    endYear: 2018,
    score: '87.6%',
    order: 3,
  },
] as const;

export type EducationEntry = (typeof education)[number];
