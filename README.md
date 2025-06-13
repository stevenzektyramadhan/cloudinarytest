````markdown
# 📸 Next.js Image Upload to Cloudinary

A simple Next.js 13+ (App Router) application that allows users to upload single or multiple images to Cloudinary. Includes drag & drop support and real-time upload progress.

---

## 🚀 Features

- ✅ Upload single or multiple images
- 📂 Drag & drop file selection (via input or area)
- 📤 Upload progress bar for each file
- ☁️ Images uploaded directly to Cloudinary
- 🧠 Uses App Router (`src/app/api/`)
- 🗂️ Cloudinary folder support
- ⚡ Optimized image delivery (auto quality & format)

---

## 📦 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/next-cloudinary-upload.git
   cd next-cloudinary-upload
   ```
````

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env.local` file:**

   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

---

## 📁 Folder Structure

```
.
├── src
│   └── app
│       ├── page.jsx              # Frontend upload page
│       └── api
│           └── upload
│               └── route.js     # Server handler (App Router API)
├── public
├── .env.local
├── package.json
└── README.md
```

---

## 🛠️ Technologies Used

- Next.js 13+ (App Router)
- React (with `use client`)
- Cloudinary SDK
- Tailwind CSS (or plain CSS)
- FormData & Fetch API

---

## 🖼️ Example Usage

1. Drag & drop or select multiple image files
2. See upload progress bars for each file
3. View uploaded image preview with URL
4. Images are stored in Cloudinary under the folder `latihan1`

---

## 🔒 Notes

- Only image files are accepted (`.jpg`, `.jpeg`, `.png`, `.webp`)
- Images are uploaded with automatic quality and format optimization
- File size and type validation is handled on the client

---

## 📌 To Do

- [ ] Add advanced file type & size validation
- [ ] Improve UI with loading skeletons
- [ ] Store uploaded image metadata in a database (optional)

---
