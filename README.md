# ComicMob

A modern comic reader and discovery platform built with Next.js, React, and TypeScript.

## Features

- 🎨 Browse trending comics, manga, and manhwa
- 📚 Personal library management
- ⭐ Review and rating system
- 📖 Light novel reading
- 🎭 Creator tools for comic creation
- 💜 Beautiful, modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel / Netlify ready

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Comic-main
```

2. Navigate to the project directory:
```bash
cd comicmob
```

3. Install dependencies:
```bash
npm install
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Comic-main/
├── comicmob/              # Main Next.js application
│   ├── src/
│   │   ├── app/          # App router pages and API routes
│   │   ├── components/   # React components
│   │   ├── lib/         # Utility functions and mock data
│   │   └── types.ts     # TypeScript type definitions
│   ├── package.json
│   └── next.config.mjs
├── vercel.json           # Vercel deployment configuration
├── netlify.toml          # Netlify deployment configuration
└── README.md
```

## Deployment

### Deploy to Vercel

The project is configured for Vercel deployment with the `vercel.json` file.

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will automatically detect the Next.js configuration
5. Click "Deploy"

**Settings:**
- Root Directory: `comicmob`
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

### Deploy to Netlify

The project is configured for Netlify deployment with the `netlify.toml` file.

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Netlify will automatically detect the settings from `netlify.toml`
5. Click "Deploy"

**Manual Settings (if needed):**
- Base directory: `comicmob`
- Build command: `npm install && npm run build`
- Publish directory: `comicmob/.next`

### Environment Variables

Currently, the project uses in-memory mock data and doesn't require any environment variables. If you plan to connect to a database or external services, create a `.env.local` file in the `comicmob` directory.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Current Features

- ✅ Comic browsing and discovery
- ✅ Comic reader with episode viewing
- ✅ User authentication (mock)
- ✅ Library management (mock)
- ✅ Review system
- ✅ Light novel section
- ✅ Creator tools

## Notes

- The project currently uses in-memory mock data for demonstration purposes
- No database is required for the current implementation
- Images are loaded from external sources (Unsplash, Picsum)

## License

This project is open source and available for personal and commercial use.

