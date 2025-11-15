# Quick Start Guide

## ⚡ Fast Setup (5 minutes)

### Option 1: Using Docker (Recommended)

1. **Install Docker Desktop** (if not installed)

   - Download from: https://www.docker.com/products/docker-desktop

2. **Start Databases**

   ```bash
   # PostgreSQL
   docker run --name postgres-metadata -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=metadata_db -p 5432:5432 -d postgres:14

   # MongoDB
   docker run --name mongo-metadata -p 27017:27017 -d mongo:5
   ```

3. **Configure Environment**

   - Update `.env.local`:

   ```env
   POSTGRES_URL="postgresql://postgres:password123@localhost:5432/metadata_db"
   MONGODB_URI="mongodb://localhost:27017/metadata_db"
   ```

4. **Run the App**

   ```bash
   npm run dev
   ```

5. **Open Browser**
   - Visit: http://localhost:3000
   - Upload your first file!

---

### Option 2: Using Cloud Databases (Free)

1. **MongoDB Atlas** (Free tier available)

   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env.local`

2. **PostgreSQL on Railway** (Free tier available)

   - Sign up: https://railway.app/
   - Create PostgreSQL database
   - Get connection string
   - Update `POSTGRES_URL` in `.env.local`

3. **Run the App**
   ```bash
   npm run dev
   ```

---

## 🎯 Testing the Dashboard

### Upload Test Files

1. **Images**: Upload .jpg, .png, .gif files

   - Should be stored in PostgreSQL
   - Preview should work

2. **JSON Data**: Upload .json files

   - Should be stored in MongoDB
   - Preview should show formatted JSON

3. **Videos**: Upload .mp4, .webm files
   - Should be stored in PostgreSQL
   - Video player should work

### Search & Filter

1. **Basic Search**: Type "test" in search bar
2. **Filter by Category**: Click "Images" in sidebar
3. **Advanced Filter**: Click "Filters" button, select file type
4. **Tag Search**: Add tags during upload, then filter by tags

---

## 📊 Verify Database Selection

After uploading files, check the small database icon on each file card:

- 🟦 Blue (Postgres) = PostgreSQL
- 🟩 Green (Mongo) = MongoDB

The system should automatically:

- Store JSON files in MongoDB
- Store images/videos in PostgreSQL

---

## 🐛 Troubleshooting

### Database Connection Errors

**PostgreSQL Error:**

```
Error: connection to server at localhost:5432 failed
```

**Solution:**

- Check if PostgreSQL is running: `docker ps`
- Verify connection string in `.env.local`
- Try: `docker start postgres-metadata`

**MongoDB Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

- Check if MongoDB is running: `docker ps`
- Verify connection string in `.env.local`
- Try: `docker start mongo-metadata`

### Upload Errors

**File too large:**

- Default max: 100MB
- Update `MAX_FILE_SIZE` in `.env.local`

**Upload folder not found:**

- The `uploads` folder is created automatically
- Check file permissions

---

## 🚀 Next Steps

1. **Add Authentication**

   - Implement NextAuth.js for user login
   - Add user-specific file storage

2. **Deploy to Production**

   - Push to GitHub
   - Deploy on Vercel
   - Use cloud databases

3. **Customize**
   - Modify file categories in `lib/utils.ts`
   - Adjust database selection logic in `lib/db-selector.ts`
   - Customize UI colors in Tailwind classes

---

## 📝 Example Files to Test

Create these test files:

**test.json**

```json
{
  "name": "Test Data",
  "type": "JSON",
  "nested": {
    "field": "value"
  }
}
```

**data.csv**

```csv
Name,Email,Age
John,john@example.com,30
Jane,jane@example.com,25
```

Upload both and notice:

- JSON → MongoDB (green icon)
- CSV → Could go to either, based on size

---

## 💡 Tips

- **Batch Upload**: Select multiple files at once for faster uploads
- **Tags**: Use consistent tag names for easier filtering
- **Search**: Search works across file names AND JSON content
- **Preview**: Click the eye icon to preview files inline
- **Download**: Click download icon to save files locally

Enjoy your new file management dashboard! 🎉
