# Comic Hunter - Monorepo Guide

This project uses **npm workspaces** + **Turborepo** for efficient dependency management and build orchestration.

## 🏗️ Structure

```
comic-hunter/                    # Workspace root
├── package.json                 # Workspace configuration + backend deps
├── turbo.json                   # Build orchestration rules
├── node_modules/                # Hoisted shared dependencies
├── dashboard/                   # React frontend (workspace package)
│   ├── package.json            # Dashboard-specific dependencies
│   ├── src/                    # React components
│   └── dist/                   # Built assets
├── reddit-poller.js             # Backend services
├── api-server.js
├── lib/                        # Shared utilities
└── generated/                  # Prisma client
```

## ⚡ Quick Commands

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `npm install`       | Install all dependencies (both root + workspaces) |
| `npm run dev:all`   | Run API server + dashboard in parallel            |
| `npm run build`     | Build production assets (with caching)            |
| `npm start`         | Reddit poller only                                |
| `npm run server`    | API server only                                   |
| `npm run dashboard` | Frontend dev server only                          |
| `npm run test:api`  | Test Discord webhook                              |

## 🚀 Development Workflow

### First-time setup:

```bash
git clone <repo>
npm install              # Installs everything
npm run build           # Build dashboard once
```

### Daily development:

```bash
npm run dev:all         # Both servers + hot reload
# Work on features...
npm run build          # Rebuild (only changed files)
```

### Individual services:

```bash
# Terminal 1
npm run server         # API on :3001

# Terminal 2
npm run dashboard      # Frontend on :5173

# Terminal 3
npm start             # Poller (background)
```

## 🎯 Benefits

### **Dependency Management**

- ✅ Single `npm install` for entire project
- ✅ Shared packages hoisted (React, ESLint, TypeScript types)
- ✅ Smaller disk footprint
- ✅ No version conflicts

### **Build Performance**

- ⚡ Turborepo caches builds - only rebuilds what changed
- ⚡ Parallel task execution
- ⚡ Smart dependency ordering
- 📊 `>>> FULL TURBO` when nothing changed

### **Developer Experience**

- 🎯 Clean scripts without `cd dashboard &&`
- 🎯 Consistent commands across team
- 🎯 Future-ready for new services (eBay, Facebook scrapers)

## 📦 Workspace Packages

### Root Package (`comic-hunter`)

- **Purpose**: Backend services + workspace orchestration
- **Dependencies**: Express, Prisma, Discord integrations
- **Scripts**: Poller, API server, workspace commands

### Dashboard Package (`comic-hunter-dashboard`)

- **Purpose**: React frontend
- **Dependencies**: React 19, Vite 6, Tailwind CSS v4
- **Scripts**: Dev server, production builds

## 🔧 Turborepo Configuration

The `turbo.json` defines how tasks run:

- **`dev`**: Persistent processes (API servers, dev servers)
- **`build`**: Cached builds with proper dependency order
- **`start`**: Long-running services (poller)

## 🔄 Adding New Services

When adding new scrapers (eBay, Facebook):

```json
// package.json - add script
"ebay-scraper": "npx tsx ebay-scraper.js"

// turbo.json - add task
"ebay-scraper": {
  "persistent": true,
  "cache": false
}
```

## 🚀 Deployment

### Development

```bash
npm run dev:all        # Local development
```

### Production

```bash
npm run build          # Build dashboard
# Deploy dashboard/ to S3 + CloudFront
# Deploy API services to EC2/ECS
# Run poller as background service
```

---

**Next Steps**: This setup scales perfectly for the planned eBay API, Facebook Marketplace scraper, and AWS Cognito authentication features.
