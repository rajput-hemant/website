import type { Ref } from 'react';
import { siteConfig } from '~/content/site';

export function PlainWordmark({ ref }: { ref?: Ref<HTMLSpanElement> }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span
        ref={ref}
        className="lab-wordmark text-accent w-[88%] text-center font-serif"
      >
        {siteConfig.name.split(' ').map((word, index) => (
          <span key={index}>
            {index > 0 ? ' ' : null}
            <span data-word className="inline-block">
              {word}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
