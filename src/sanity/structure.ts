import type { StructureResolver } from 'sanity/structure';

type QuestionStatus =
  'pending' | 'unreviewed' | 'published' | 'rejected' | 'spam';

const inboxLists: { title: string; status: QuestionStatus }[] = [
  { title: 'Pending', status: 'pending' },
  { title: 'Unreviewed', status: 'unreviewed' },
  { title: 'Published', status: 'published' },
  { title: 'Rejected', status: 'rejected' },
  { title: 'Spam', status: 'spam' },
];

const contentTypes: {
  type: string;
  title: string;
  ordering: { field: string; direction: 'asc' | 'desc' }[];
}[] = [
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
        .title('Inbox')
        .id('inbox')
        .child(
          S.list()
            .title('Inbox')
            .items(
              inboxLists.map(({ title, status }) =>
                S.listItem()
                  .title(title)
                  .id(`inbox-${status}`)
                  .child(
                    S.documentList()
                      .title(title)
                      .schemaType('question')
                      .filter('_type == "question" && status == $status')
                      .params({ status })
                      .defaultOrdering([
                        { field: 'submittedAt', direction: 'desc' },
                      ]),
                  ),
              ),
            ),
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
