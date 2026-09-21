import { defineQuery } from 'next-sanity';

export const PROFILE_QUERY = defineQuery(`
  *[_type == "profile" && _id == "profile"][0]{
    _id,
    name,
    headline,
    bio,
    availability,
    avatar{
      asset,
      alt,
      hotspot,
      crop
    },
    location,
    links[]{label, url},
    resumeNote
  }
`);

export const EXPERIENCE_QUERY = defineQuery(`
  *[_type == "experience"] | order(order asc, startDate desc){
    _id,
    company,
    companyUrl,
    companyBlurb,
    title,
    location,
    remote,
    employmentType,
    startDate,
    endDate,
    endNote,
    continuedInto->{
      _id,
      company,
      title
    },
    continuationNote,
    body,
    highlights,
    order
  }
`);

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(featured desc, order asc, year desc){
    _id,
    name,
    slug,
    tagline,
    description,
    stack,
    github,
    live,
    featured,
    status,
    year,
    order
  }
`);

export const NOW_QUERY = defineQuery(`
  *[_type == "now" && _id == "now"][0]{
    _id,
    items[]{text, link},
    updatedAt
  }
`);

export const CHANGELOG_QUERY = defineQuery(`
  *[_type == "update"] | order(date desc){
    _id,
    date,
    text,
    category,
    link
  }
`);
