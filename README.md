# rajputhemant.com

[Hemant Rajput's portfolio](https://rajputhemant.com), built with Next.js, React, TypeScript, and Sanity. Eleven visual editions share the same content and public URLs. Visitors choose an edition on their first visit; deployments can pin one with `NEXT_PUBLIC_FLAVOR`.

## Local development

Requires Node.js 22.23.3 or later (see `engines` in `package.json`) and
[Bun](https://bun.sh) 1.4.2.

```sh
bun install
cp .env.example .env.local
bun run dev
```

Open <http://localhost:3000>. The site uses bundled fallback content when Sanity is not configured. For a connected CMS, follow [the Sanity setup guide](docs/sanity.md). See [local development](docs/local-development.md) for the runtime contract, checks, seeding limits, and why this project needs no Docker container.

## Commands

| Command              | Purpose                          |
| -------------------- | -------------------------------- |
| `bun run dev`        | Start the development server     |
| `bun run build`      | Create a production build        |
| `bun run lint`       | Check code with ESLint           |
| `bun run type-check` | Check TypeScript and route types |

See [edition architecture](docs/flavors.md), [Ask](docs/ask.md), and the [documentation index](docs/README.md) for implementation details.

## License

[MIT](LICENSE) © Hemant Rajput
