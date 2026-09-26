# AI Political Poster Maker

An AI-powered poster generation web application built for the Rise Together technical assessment.

The project is separated into two independently deployable applications:

- `frontend/` — Next.js + TypeScript
- `backend/` — Express.js + TypeScript

## Features

- User registration and login
- JWT-based authentication
- Protected poster pages
- Poster template gallery
- Multiple poster templates
- Template thumbnails
- Create poster from a selected template
- Upload up to 3 images for a poster
- AI-assisted Bangla poster layout/content suggestions using Google Gemini
- Server-side poster rendering with Puppeteer
- Poster generation status and polling
- Poster regeneration with layout variations
- My Posters/history page
- Poster details page
- Poster download
- Delete generated posters
- Cloudinary image upload/storage
- MongoDB database with Mongoose

## Tech Stack

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS
- App Router

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Google Gemini API
- Cloudinary
- Puppeteer
- JWT
- Multer

## Project Structure

```text
AI-Political-Poster-Maker/
├── frontend/
│   ├── public/
│   │   └── templates/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── context/
│       ├── lib/
│       └── types/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── seeds/
│       ├── services/
│       └── server.ts
│
└── README.md
```

## Requirements

- Node.js 20+
- npm
- MongoDB database
- Google Gemini API key
- Cloudinary account

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Mdnayem097/AI-Political-Poster-Maker.git
cd AI-Political-Poster-Maker
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Never commit real API keys, passwords, JWT secrets, or database credentials.

The following files are intentionally ignored by Git:

```text
.env
.env.local
```

Use example values only in documentation.

## Application Flow

```text
User
  │
  ▼
Next.js Frontend
  │
  │ HTTP API
  ▼
Express Backend
  │
  ├── JWT Authentication
  ├── MongoDB
  ├── Cloudinary
  ├── Gemini AI
  └── Puppeteer Renderer
          │
          ▼
     Generated Poster
```

## Poster Generation Flow

1. User registers or logs in.
2. User opens the template gallery.
3. User selects a poster template.
4. User enters the poster information.
5. User uploads the required images.
6. Frontend sends the request to the backend.
7. Backend creates the poster record.
8. Gemini generates a structured layout suggestion.
9. Puppeteer renders the final poster.
10. The poster status is updated.
11. Frontend polls the generation status.
12. User can view, download, or regenerate the poster.

## Main Frontend Pages

```text
/
├── /login
├── /register
├── /dashboard
├── /templates
├── /posters
├── /posters/new
└── /posters/[id]
```

## Backend API Areas

```text
/api/auth
/api/posters
/api/templates
/api/upload
/api/gemini-test
/api/renderer-test
```

## Deployment

The frontend and backend are intentionally separated so they can be deployed independently.

### Frontend

The Next.js application can be deployed to a Next.js-compatible hosting platform such as Vercel.

Before deployment, configure:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url
```

### Backend

The Express application can be deployed to a Node.js hosting platform such as Render or another Node.js-compatible service.

Configure the production environment variables on the hosting platform:

```env
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=https://your-frontend-url
```

After deployment, verify:

1. Frontend can communicate with the backend.
2. Authentication works.
3. MongoDB connection works.
4. Image upload works.
5. Gemini generation works.
6. Poster rendering works.
7. Poster download works.
8. Poster regeneration works.

## Git Repository

```text
https://github.com/Mdnayem097/AI-Political-Poster-Maker.git
```

## Author

**Md Nayem**

- GitHub: https://github.com/Mdnayem097
- Portfolio: https://md-nayem-portfolio.vercel.app
- LinkedIn: https://www.linkedin.com/in/md-nayem-swe/

## License

This project was created as a technical assessment project.
