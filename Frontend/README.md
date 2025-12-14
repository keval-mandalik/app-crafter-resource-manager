# Frontend Resource Manager

A React-based frontend application for managing learning resources with role-based access control.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Query + Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Testing**: Vitest + React Testing Library + fast-check
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the API base URL in `.env` if needed

### Development

Start the development server:
```bash
npm run dev
```

### Building

Build for production:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Code Quality

Check linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common/shared components
│   ├── layout/         # Layout components
│   ├── resources/      # Resource-specific components
│   └── ui/             # Basic UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── test/               # Test utilities and setup
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and constants
```

## Features

- User authentication with JWT tokens
- Role-based access control (CONTENT_MANAGER vs VIEWER)
- Resource management (CRUD operations)
- Search and filtering capabilities
- Activity tracking and audit trails
- Responsive design for mobile and desktop
- Comprehensive error handling and loading states

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:3000/api)