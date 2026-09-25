import type { StructureResolver } from 'sanity/structure';

type Ordering = { field: string; direction: 'asc' | 'desc' }[];

const submittedDesc: Ordering = [{ field: 'submittedAt', direction: 'desc' }];

const inboxLists: {
  id: string;
  title: string;
  status: string;
  ordering: Ordering;
}[] = [
  {
    id: 'pending',
    title: 'Pending',
    status: 'pending',
    ordering: submittedDesc,
  },
  {
    id: 'recent',
    title: 'Recent',
    status: 'published',
    ordering: [{ field: 'publishedAt', direction: 'desc' }],
  },
  { id: 'flagged', title: 'Flagged', status: 'spam', ordering: submittedDesc },
  { id: 'hidden', title: 'Hidden', status: 'hidden', ordering: submittedDesc },
];

const contentTypes: { type: string; title: string; ordering: Ordering }[] = [
  {
    type: 'experience',
    title: 'Experience',
    ordering: [{ field: 'startDate', direction: 'desc' }],
  },
  {
    type: 'project',
    title: 'Projects',
    ordering: [
      { field: 'featured', direction: 'desc' },
      { field: 'order', direction: 'asc' },
    ],
  },
  {
    type: 'update',
    title: 'Changelog',
    ordering: [{ field: 'date', direction: 'desc' }],
  },
  {
    type: 'skillGroup',
    title: 'Skills',
    ordering: [{ field: 'order', direction: 'asc' }],
  },
  {
    type: 'education',
    title: 'Education',
    ordering: [{ field: 'order', direction: 'asc' }],
  },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Profile')
        .id('profile')
        .child(
          S.document()
            .schemaType('profile')
            .documentId('profile')
            .title('Profile'),
        ),
      S.listItem()
        .title('Now')
        .id('now')
        .child(S.document().schemaType('now').documentId('now').title('Now')),
      S.divider(),
      S.listItem()
        .title('Ask inbox')
        .id('inbox')
        .child(
          S.list()
            .title('Ask inbox')
            .items([
              ...inboxLists.map(({ id, title, status, ordering }) =>
                S.listItem()
                  .title(title)
                  .id(`inbox-${id}`)
                  .child(
                    S.documentList()
                      .title(title)
                      .schemaType('question')
                      .filter('_type == "question" && status == $status')
                      .params({ status })
                      .defaultOrdering(ordering),
                  ),
              ),
              S.divider(),
              S.documentTypeListItem('askBan')
                .title('Banned')
                .id('inbox-banned')
                .child(
                  S.documentTypeList('askBan')
                    .title('Banned')
                    .defaultOrdering([
                      { field: 'bannedAt', direction: 'desc' },
                    ]),
                ),
            ]),
        ),
      S.divider(),
      ...contentTypes.map(({ type, title, ordering }) =>
        S.documentTypeListItem(type)
          .title(title)
          .child(
            S.documentTypeList(type).title(title).defaultOrdering(ordering),
          ),
      ),
    ]);
