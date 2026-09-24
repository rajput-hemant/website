import { siteConfig } from '~/content/site';

const introScript = `try{if(!sessionStorage.getItem('wordmark-intro')){sessionStorage.setItem('wordmark-intro','1');document.documentElement.dataset.wordmark='intro'}}catch(e){}`;

export function Wordmark() {
  return (
    <span className="wordmark">
      <script dangerouslySetInnerHTML={{ __html: introScript }} />
      <span className="sr-only">{siteConfig.name}</span>
      <span aria-hidden="true">
        {[...siteConfig.name].map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 20}ms` }}>
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}
