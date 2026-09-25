import Markdown, { type Components } from 'react-markdown';

const ALLOWED = ['p', 'strong', 'em', 'code', 'pre', 'a', 'br'];
const SAFE_URL = /^(?:https?:|mailto:)/i;

const components: Components = {
  a: ({ href, children }) =>
    href ? (
      <a href={href} rel="nofollow ugc noopener">
        {children}
      </a>
    ) : (
      children
    ),
};

export function MessageBody({ body }: { body: string }) {
  return (
    <div className="prose">
      <Markdown
        allowedElements={ALLOWED}
        unwrapDisallowed
        skipHtml
        urlTransform={(url) => (SAFE_URL.test(url) ? url : '')}
        components={components}
      >
        {body}
      </Markdown>
    </div>
  );
}
