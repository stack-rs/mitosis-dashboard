# Mitosis Dashboard

A comprehensive web dashboard for managing distributed computational tasks, workers, and resources for [Mitosis](https://github.com/stack-rs/mitosis) platform. Built with Astro and React, providing an intuitive interface for task submission, monitoring, and system administration.

See the [Mitosis documentation](https://docs.stack.rs/mitosis) and [Mitosis repository](https://github.com/stack-rs/mitosis) for more details.

## ✨ Features

- **Task Management**: Submit, query, monitor, and cancel computational tasks
- **Worker Management**: Monitor and manage computational workers
- **User & Group Management**: Handle user authentication and group permissions
- **File Management**: Upload, download, and manage task attachments and artifacts
- **Admin Controls**: System administration tools for managing users, groups, and workers
- **Real-time Monitoring**: Live updates on task and worker status

## 🚀 Project Structure

Inside of this Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin management components
│   │   ├── artifacts/      # Artifact management components
│   │   ├── attachments/    # Attachment management components
│   │   ├── groups/         # Group management components
│   │   ├── tasks/          # Task management components
│   │   ├── users/          # User management components
│   │   └── workers/        # Worker management components
│   ├── pages/              # Astro pages
│   ├── styles/             # CSS styles
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
└── package.json
```

## 📋 Prerequisites

Before deploying, ensure you have:

- Node.js (version 18 or higher)
- npm or yarn package manager
- Access to a Mitosis coordinator server

## 🚀 Getting Started

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mitosis-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:4321`

## 🧞 Available Commands

All commands are run from the root of the project:

| Command                | Action                                       |
| :--------------------- | :------------------------------------------- |
| `npm install`          | Installs dependencies                        |
| `npm run dev`          | Starts local dev server at `localhost:4321`  |
| `npm run build`        | Build your production site to `./dist/`      |
| `npm run preview`      | Preview your build locally, before deploying |
| `npm run lint`         | Run ESLint to check code quality             |
| `npm run lint:fix`     | Fix linting issues automatically             |
| `npm run format`       | Format code with Prettier                    |
| `npm run format:check` | Check code formatting                        |

## 🚀 Deployment

### Production Build

1. Create a production build:

```bash
npm run build
```

2. The built files will be available in the `./dist/` directory.

### Deployment Options

#### Node.js Server

The project is configured with `@astrojs/node` adapter for server-side rendering:

1. Build the project:

```bash
npm run build
```

2. Start the production server:

```bash
node ./dist/server/entry.mjs
```

#### Docker Deployment

Use the `Dockerfile` under the root.

Build and run:

```bash
docker build -t mitosis-dashboard .
docker run -d -p 4321:4321 mitosis-dashboard
```

### Environment Configuration

The dashboard connects to a Mitosis coordinator server. Configure the connection through the login interface or set up environment variables as needed for your deployment.

## 🔧 Tech Stack

- **Frontend Framework**: Astro + React
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Build Tool**: Vite (via Astro)
- **Code Quality**: ESLint + Prettier
