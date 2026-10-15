# Deploying Boughbound

The owner will deploy to Vercel. GitHub Actions are not used. The repository includes `vercel.json` with the build settings.

## Vercel project settings

| Setting | Value |
| --- | --- |
| Repository | `techbone/Boughbound` |
| Production branch | `main` |
| Framework | Vite |
| Root directory | Repository root; leave the field empty |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | 22.x |
| Environment variables | None required |

Import the repository into your Vercel account and deploy. Vercel can build the repository directly without GitHub Actions. If access is restricted by Vercel's GitHub integration, grant access to this repository during import.

The local build uses the npm lockfile. Run `npm run check` and `npm run build` before pushing a release. Vercel's build command includes the TypeScript compiler; the complete simulation suite remains a local check.

## Public-link checks

After deployment, send the URL back in this chat so it can be verified on the public host. Open it in a private browser window and check:

1. The title scene and Play button load without an account or password.
2. Steering, branching, loss, pause/resume and retry work.
3. The portrait can be downloaded; check the PNG opens correctly.
4. A phone can drag to steer without scrolling the page.
5. The X button opens a composer with the public game URL. Posting remains a separate user action.

For the contest, share the production HTTPS URL and the public source repository. If Vercel deployment protection is enabled, adjust it so the submitted URL is accessible to judges. Never put a wallet private key or recovery phrase into project settings.
