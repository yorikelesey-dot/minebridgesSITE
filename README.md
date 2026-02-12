# MineBridges - Ultimate Minecraft Asset Aggregator

A modern, full-stack Next.js 14+ application that aggregates Minecraft content (mods, plugins, shaders, resource packs) from Modrinth and CurseForge APIs into a unified search interface.

## Features

- **Unified Search**: Search across both Modrinth and CurseForge with a single query
- **Smart Debouncing**: 300ms debounced search to prevent API rate-limiting
- **Advanced Filtering**: Filter by category (Mod, Plugin, Shader, Resource Pack) and sort options
- **Version Selection**: Complex version filtering by Minecraft version and mod loader
- **Dark Theme**: Beautiful dark theme with Zinc-950 background and Emerald-500 accents
- **Smooth Animations**: Framer Motion powered animations for a polished experience
- **Performance Optimized**: Image optimization, lazy loading, and API response caching

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (@tanstack/react-query)
- **Animations**: Framer Motion
- **APIs**: Modrinth API v2, CurseForge API v1

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- API keys for CurseForge (Modrinth API doesn't require a key for search)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd minebridges-aggregator
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Add your API keys to the `.env` file:

```env
# CurseForge API Key (Required)
# Get your API key from: https://console.curseforge.com/
CURSEFORGE_API_KEY=your_curseforge_api_key_here

# Modrinth API Key (Optional - not required for search)
MODRINTH_API_KEY=your_modrinth_api_key_here
```

#### Getting API Keys

**CurseForge API Key** (Required):
1. Visit [CurseForge Console](https://console.curseforge.com/)
2. Sign in or create an account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key to your `.env` file

**Modrinth API Key** (Optional):
- Modrinth doesn't require an API key for public search endpoints
- If you need authenticated features, visit [Modrinth Settings](https://modrinth.com/settings/account)

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## Project Structure

```
minebridges-aggregator/
├── app/                      # Next.js App Router pages and API routes
│   ├── api/                  # API proxy handlers
│   │   ├── curseforge/       # CurseForge API proxies
│   │   ├── modrinth/         # Modrinth API proxies
│   │   ├── search/           # Unified search endpoint
│   │   └── versions/         # Version fetching endpoint
│   ├── item/[id]/            # Item detail pages
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── content-card.tsx      # Content item card
│   ├── content-grid.tsx      # Grid layout with animations
│   ├── filter-panel.tsx      # Category and sort filters
│   ├── search-bar.tsx        # Debounced search input
│   └── version-selector.tsx  # Version filtering component
├── lib/                      # Utility functions
│   ├── types.ts              # TypeScript interfaces
│   ├── transformers.ts       # API response transformers
│   ├── errors.ts             # Error handling utilities
│   └── utils.ts              # General utilities
├── public/                   # Static assets
│   └── icons/                # Platform icons (Modrinth, CurseForge)
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment variables template
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Deployment

### Deploy to Vercel (Recommended)

MineBridges is optimized for deployment on Vercel:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Visit [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**:
   - In Vercel project settings, go to "Environment Variables"
   - Add `CURSEFORGE_API_KEY` with your API key
   - Optionally add `MODRINTH_API_KEY`
   - These will be available to your deployed application

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll receive a production URL (e.g., `your-project.vercel.app`)

### Deploy to Other Platforms

MineBridges can be deployed to any platform that supports Next.js:

- **Netlify**: Use the Netlify Next.js plugin
- **Railway**: Connect your GitHub repo and add environment variables
- **Self-hosted**: Build with `npm run build` and run with `npm run start`

#### Build Configuration

For production builds:
```bash
npm run build
npm run start
```

The build process:
- Compiles TypeScript
- Optimizes images
- Generates static pages where possible
- Creates optimized production bundles

## Configuration

### Image Domains

The application is pre-configured to load images from:
- `cdn.modrinth.com` (Modrinth CDN)
- `media.forgecdn.net` (CurseForge CDN)
- `edge.forgecdn.net` (CurseForge Edge CDN)

These are configured in `next.config.js`. Add additional domains if needed.

### API Caching

API responses are cached with the following durations:
- Search results: 5 minutes (300 seconds)
- Version data: 1 hour (3600 seconds)
- Item details: 30 minutes (1800 seconds)

Adjust cache times in the API route handlers if needed.

## API Routes

The application uses Next.js API routes as proxies to protect API keys:

- `GET /api/search` - Unified search across both platforms
- `GET /api/modrinth/search` - Modrinth-specific search
- `GET /api/curseforge/search` - CurseForge-specific search
- `GET /api/versions/[itemId]` - Fetch version files for an item
- `GET /api/item/[itemId]` - Fetch detailed item information

## Troubleshooting

### API Key Issues

**Error: "CurseForge API key not configured"**
- Ensure `CURSEFORGE_API_KEY` is set in your `.env` file
- Restart the development server after adding environment variables
- Verify the API key is valid at [CurseForge Console](https://console.curseforge.com/)

### Build Errors

**Error: "Module not found"**
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `.next` folders, then reinstall:
  ```bash
  rm -rf node_modules .next
  npm install
  ```

### Image Loading Issues

**Images not displaying**
- Check that image domains are configured in `next.config.js`
- Verify the image URLs are accessible
- Check browser console for CORS or network errors

## Performance

The application is optimized for performance:
- Lighthouse score target: 90+ on desktop
- Image optimization via `next/image`
- API response caching
- Lazy loading for content outside viewport
- Debounced search to reduce API calls

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Support

For issues or questions:
- Open an issue on GitHub
- Contact [@MineBridges_bot](https://t.me/MineBridges_bot) on Telegram

## Acknowledgments

- [Modrinth](https://modrinth.com) for their excellent API
- [CurseForge](https://www.curseforge.com) for Minecraft content hosting
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Vercel](https://vercel.com) for Next.js and hosting platform
