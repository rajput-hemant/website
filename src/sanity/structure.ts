import type { StructureResolver } from 'sanity/structure';
import { singletonTypes } from './schemas';

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
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId();
        return id !== undefined && !singletonTypes.has(id);
      }),
    ]);
