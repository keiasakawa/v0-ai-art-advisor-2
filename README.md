# OFFA - AI-Powered Art Advisor

A sophisticated art marketplace and advisory platform powered by AI, built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Landing Page**: Elegant introduction to the OFFA platform with animated elements
- **AI Chat Interface**: Interactive chat with AI art advisor for personalized recommendations
- **Dashboard**: Curated art recommendations, saved artworks, and trending pieces
- **Responsive Design**: Fully responsive across all devices
- **Modern UI**: Built with shadcn/ui components and Framer Motion animations

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **shadcn/ui** - UI component library
- **Lucide React** - Icons

### Backend Integration (Ready for)
- **FastAPI** - Python backend
- **PostgreSQL** - Database via Supabase
- **RESTful APIs** - For chat, recommendations, and user data

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000)

## Backend Integration Guide

### FastAPI Endpoints to Implement

#### 1. Chat API
\`\`\`python
# POST /api/chat
# Request: { "message": "user question", "conversation_id": "optional" }
# Response: { "response": "AI answer", "conversation_id": "uuid" }
\`\`\`

**Frontend Integration Point**: `app/chat/page.tsx` - Replace the `getSimulatedResponse()` function:

\`\`\`typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!input.trim() || isLoading) return

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: input.trim(),
    timestamp: new Date(),
  }

  setMessages((prev) => [...prev, userMessage])
  setInput('')
  setIsLoading(true)

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage.content }),
    })
    
    const data = await response.json()
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.response,
      timestamp: new Date(),
    }
    
    setMessages((prev) => [...prev, aiMessage])
  } catch (error) {
    console.error('Chat error:', error)
  } finally {
    setIsLoading(false)
  }
}
\`\`\`

#### 2. Artwork Recommendations API
\`\`\`python
# GET /api/artworks/recommendations
# Query params: { "limit": 10, "user_id": "optional" }
# Response: [{ "id", "title", "artist", "year", "price", "imageUrl", "medium", "dimensions", "trending" }]
\`\`\`

**Frontend Integration Point**: `app/dashboard/page.tsx` - Replace `mockArtworks`:

\`\`\`typescript
useEffect(() => {
  const fetchArtworks = async () => {
    try {
      const response = await fetch('/api/artworks/recommendations')
      const data = await response.json()
      setArtworks(data)
    } catch (error) {
      console.error('Failed to fetch artworks:', error)
    }
  }
  
  fetchArtworks()
}, [])
\`\`\`

#### 3. Save Artwork API
\`\`\`python
# POST /api/artworks/save
# Request: { "artwork_id": "uuid", "user_id": "uuid" }
# Response: { "success": true }
\`\`\`

#### 4. User Preferences API
\`\`\`python
# GET /api/user/preferences
# POST /api/user/preferences
# For storing user taste, budget, and collection preferences
\`\`\`

### Database Schema (PostgreSQL)

#### Users Table
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Artworks Table
\`\`\`sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  year INTEGER,
  price DECIMAL(10, 2),
  image_url TEXT,
  medium VARCHAR(255),
  dimensions VARCHAR(100),
  description TEXT,
  trending BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Saved Artworks Table
\`\`\`sql
CREATE TABLE saved_artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  artwork_id UUID REFERENCES artworks(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, artwork_id)
);
\`\`\`

#### Conversations Table
\`\`\`sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Environment Variables

Add these to your `.env.local` file:

\`\`\`bash
# FastAPI Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase (for PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
\`\`\`

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### FastAPI Backend Deployment
- Deploy FastAPI to services like Railway, Render, or Fly.io
- Update `NEXT_PUBLIC_API_URL` environment variable with production URL

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx              # Landing page
│   ├── chat/page.tsx         # AI chat interface
│   ├── dashboard/page.tsx    # Art recommendations dashboard
│   ├── layout.tsx            # Root layout with navigation
│   └── globals.css           # Global styles
├── components/
│   ├── navigation.tsx        # Main navigation component
│   ├── footer.tsx            # Footer component
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
\`\`\`

## Future Enhancements

- User authentication with NextAuth.js
- Payment integration with Stripe
- Advanced filtering and search
- Artist profiles and portfolios
- Collection management features
- Price history and market analytics
- Wishlist and notifications
- Social features (share, follow, comment)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.
