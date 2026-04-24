// API utility functions for backend integration

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
}

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  price: string;
  imageUrl: string;
  medium: string;
  dimensions: string;
  description?: string;
  trending: boolean;
  saved?: boolean;
}

/**
 * Send a message to the AI chat endpoint
 */
export async function sendChatMessage(
  message: string,
  conversationId?: string,
): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    throw new Error("Failed to send chat message");
  }

  return response.json();
}

/**
 * Fetch artwork recommendations
 */
export async function getArtworkRecommendations(
  limit = 10,
): Promise<Artwork[]> {
  const response = await fetch(
    `${API_URL}/api/artworks/recommendations?limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
  }

  return response.json();
}

/**
 * Fetch trending artworks
 */
export async function getTrendingArtworks(limit = 6): Promise<Artwork[]> {
  const response = await fetch(
    `${API_URL}/api/artworks/trending?limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trending artworks");
  }

  return response.json();
}

/**
 * Save or unsave an artwork
 */
export async function toggleSaveArtwork(
  artworkId: string,
  userId: string,
): Promise<{ saved: boolean }> {
  const response = await fetch(`${API_URL}/api/artworks/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ artworkId, userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to save artwork");
  }

  return response.json();
}

/**
 * Fetch user's saved artworks
 */
export async function getSavedArtworks(userId: string): Promise<Artwork[]> {
  const response = await fetch(
    `${API_URL}/api/artworks/saved?userId=${userId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch saved artworks");
  }

  return response.json();
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  const response = await fetch(
    `${API_URL}/api/user/preferences?userId=${userId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user preferences");
  }

  return response.json();
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: string, preferences: any) {
  const response = await fetch(`${API_URL}/api/user/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, ...preferences }),
  });

  if (!response.ok) {
    throw new Error("Failed to update preferences");
  }

  return response.json();
}
