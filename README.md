# SaaS File Manager Dashboard

A powerful, Google Drive-like file management system with intelligent database selection, supporting multiple file types with advanced search and filtering capabilities.

## 🚀 Features

### Core Functionality

- **Multi-Database Architecture**: Automatically selects between PostgreSQL and MongoDB based on file characteristics
- **File Upload**: Drag-and-drop or browse to upload multiple files simultaneously
- **Smart Categorization**: Automatically organizes files by type (Images, Videos, Documents, Audio, Data, etc.)
- **Advanced Search**: Full-text search across file names and metadata
- **Tag-Based Filtering**: Add and search files by custom tags
- **File Preview**: Built-in preview for images, videos, audio, and JSON files
- **Real-time Statistics**: Track files across both databases

### Intelligent Database Selection

The system automatically chooses the optimal database for each file:

**MongoDB (NoSQL)** is used for:

- JSON files (flexible schema handling)
- Large structured data files (> 1MB)
- Files with deeply nested metadata (depth > 3)
- Data category files (JSON, XML, YAML)

**PostgreSQL (SQL)** is used for:

- Binary files (Images, Videos, Audio) - better ACID compliance
- Files requiring relational queries
- Default for structured metadata

### Supported File Types

- **Images**: JPG, PNG, GIF, BMP, SVG, WebP, ICO
- **Videos**: MP4, AVI, MOV, WMV, FLV, MKV, WebM
- **Documents**: PDF, DOC, DOCX, TXT, RTF, ODT
- **Spreadsheets**: XLS, XLSX, CSV, ODS
- **Audio**: MP3, WAV, OGG, FLAC, AAC
- **Data**: JSON, XML, YAML, SQL
- **Code**: JS, TS, Python, Java, C++, and more
- **Archives**: ZIP, RAR, 7z, TAR, GZ

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or remotely)
- MongoDB 5+ (running locally or remotely)
- npm or yarn

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Database Setup

#### PostgreSQL Setup

**Option A: Local Installation**

```bash
# Install PostgreSQL (Windows with Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE metadata_db;
\q
```

**Option B: Docker**

```bash
docker run --name postgres-metadata -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=metadata_db -p 5432:5432 -d postgres:14
```

#### MongoDB Setup

**Option A: Local Installation**

```bash
# Install MongoDB (Windows with Chocolatey)
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB
```

**Option B: Docker**

```bash
docker run --name mongo-metadata -p 27017:27017 -d mongo:5
```

**Option C: MongoDB Atlas (Cloud)**

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string

### 3. Environment Configuration

Update the `.env.local` file with your database credentials:

```env
# PostgreSQL Configuration
POSTGRES_URL="postgresql://postgres:yourpassword@localhost:5432/metadata_db"

# MongoDB Configuration (choose one)
# Local:
MONGODB_URI="mongodb://localhost:27017/metadata_db"
# Or Atlas:
# MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/metadata_db"

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
```

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to access the dashboard.

## 📚 Usage Guide

### Uploading Files

1. Click the "Upload Files" button in the top-right corner
2. Drag and drop files or click "Browse Files"
3. Optionally add tags (comma-separated)
4. Click "Upload" - the system automatically selects the appropriate database

### Searching Files

**Basic Search:**

- Type in the search bar to search across file names and metadata
- Click "Search" or press Enter

**Advanced Filtering:**

1. Click the "Filters" button
2. Select category (Images, Videos, etc.)
3. Select file type (.jpg, .mp4, etc.)
4. Add tags to filter by
5. Click "Search"

### File Preview

- Click the eye icon on any file card to preview
- Supported previews: Images, Videos, Audio, JSON
- Other files show a download button

### Navigation

- Use the sidebar to filter by category
- View statistics for each database (PostgreSQL vs MongoDB)
- Click "Refresh" to update the file list

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js)            │
│  ┌───────────┐  ┌──────────────────┐   │
│  │ Dashboard │  │  Upload Modal    │   │
│  │  Sidebar  │  │  Preview Modal   │   │
│  │ SearchBar │  │  File Cards      │   │
│  └───────────┘  └──────────────────┘   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────▼─────────┐
        │   API Routes      │
        │  /api/upload      │
        │  /api/files       │
        │  /api/stats       │
        └────┬────────┬─────┘
             │        │
    ┌────────▼──┐  ┌─▼────────────┐
    │PostgreSQL │  │   MongoDB    │
    │   (SQL)   │  │   (NoSQL)    │
    └───────────┘  └──────────────┘
```

## 🔧 API Endpoints

### Upload Files

```
POST /api/upload
Content-Type: multipart/form-data

Body:
- files: File[]
- tags: string (comma-separated)

Response:
{
  success: boolean,
  files: FileMetadata[],
  message: string
}
```

### Search/List Files

```
GET /api/files?query=search&category=Images&tags=tag1,tag2&extension=jpg

Response:
{
  success: boolean,
  files: FileMetadata[],
  total: number
}
```

### Get Statistics

```
GET /api/stats

Response:
{
  postgres: { total, byCategory, byExtension },
  mongodb: { total, byCategory, byExtension },
  combined: { total, byCategory, byExtension }
}
```

## 📁 Project Structure

```
metadatafrontend/
├── app/
│   ├── api/
│   │   ├── upload/route.ts       # File upload endpoint
│   │   ├── files/route.ts        # Search & list files
│   │   ├── stats/route.ts        # Statistics
│   │   └── uploads/[...path]/    # Static file serving
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard
├── components/
│   ├── FileCard.tsx              # File card component
│   ├── FilePreviewModal.tsx      # File preview modal
│   ├── SearchBar.tsx             # Search & filter bar
│   ├── Sidebar.tsx               # Navigation sidebar
│   └── UploadModal.tsx           # Upload modal
├── lib/
│   ├── db/
│   │   ├── postgres.ts           # PostgreSQL connection
│   │   └── mongodb.ts            # MongoDB connection
│   ├── db-selector.ts            # Intelligent DB selection
│   └── utils.ts                  # Utility functions
├── types/
│   └── file.ts                   # TypeScript types
├── .env.local                    # Environment variables
└── package.json
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Note:** You'll need cloud database instances:

- PostgreSQL: Railway, Supabase, or Neon
- MongoDB: MongoDB Atlas

## 🔐 Security Considerations

- Validate file types and sizes
- Implement authentication (add NextAuth.js)
- Add rate limiting for uploads
- Scan files for malware
- Use environment variables for sensitive data
- Implement RBAC for multi-user scenarios

## 📝 License

MIT License - feel free to use this project for your own purposes.
