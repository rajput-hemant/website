import type { DocumentActionComponent } from 'sanity';
import { useDocumentOperation } from 'sanity';

export const PublishQuestionAction: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type);

  return {
    label: 'Publish',
    tone: 'positive',
    disabled: props.draft === null || Boolean(publish.disabled),
    onHandle: () => {
      patch.execute([
        { set: { status: 'published', publishedAt: new Date().toISOString() } },
      ]);
      publish.execute();
      props.onComplete();
    },
  };
};

PublishQuestionAction.action = 'publish';
