# Ergoplanner Frontend

Production-ready Next.js 14+ frontend application for the Ergoplanner AI Suite - an intelligent P&ID management system.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **P&ID Engine**: ReactFlow
- **State Management**: Zustand
- **API Client**: Axios with React Query
- **Forms**: React Hook Form with Zod validation
- **Real-time**: SignalR client
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on port 5000

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Start development server
npm run dev

# The application will be available at http://localhost:3000
```

### Building for Production

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build production bundle
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes (if needed)
├── components/
│   ├── drawing/           # P&ID drawing components
│   │   ├── Canvas.tsx     # Main ReactFlow canvas
│   │   ├── Toolbar.tsx    # Drawing tools
│   │   └── SymbolLibrary.tsx
│   ├── boq/              # Bill of Quantities components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── api-client.ts     # Axios configuration
│   └── config.ts         # App configuration
├── services/             # API service layers
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── store/                # Zustand stores
└── utils/                # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript compiler check
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Key Features

### P&ID Drawing Engine
- ReactFlow-based canvas with custom P&ID nodes
- ISA-5.1 and ISO 14617 standard symbols
- Smart pipe routing and connection validation
- Layer management and grid snapping
- Undo/redo with command pattern

### State Management
- Zustand for global state (drawing, user, project)
- React Query for server state
- Optimistic updates for better UX

### Real-time Collaboration
- SignalR integration for live updates
- Cursor tracking and presence indicators
- Comments and annotations system

### Type Safety
- Strict TypeScript configuration
- Zod schemas for runtime validation
- Type-safe API client

## Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- `NEXT_PUBLIC_SIGNALR_HUB_URL` - SignalR hub URL
- `NEXT_PUBLIC_ENABLE_AI_FEATURES` - Enable AI features
- `NEXT_PUBLIC_ENABLE_COLLABORATION` - Enable real-time collaboration
- `NEXT_PUBLIC_ENABLE_OFFLINE_MODE` - Enable offline mode

## Development Guidelines

1. **Components**: Use functional components with TypeScript
2. **Styling**: Use Tailwind CSS classes, avoid inline styles
3. **State**: Use Zustand for global state, React state for local
4. **API Calls**: Always use the configured API client
5. **Error Handling**: Implement proper error boundaries
6. **Performance**: Use React.memo and useMemo where appropriate
7. **Accessibility**: Ensure WCAG 2.1 AA compliance

## Testing

```bash
# Run tests (when configured)
npm test

# Run E2E tests (when configured)
npm run test:e2e
```

## Deployment

The application is configured for deployment on Vercel, Netlify, or any Node.js hosting platform.

```bash
# Build for production
npm run build

# The output will be in .next/ directory
```

## License

Proprietary - Ergoplanner AI Suite
