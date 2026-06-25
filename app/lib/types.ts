// Types matching the backend OpenAPI schema exactly

export type VibeTag = "loved_it" | "mixed" | "never_again" | "neutral";
export type TravelStyle = "solo" | "couple" | "group" | "family";
export type BudgetLevel = "backpacker" | "mid" | "luxury";

export interface TripStopPublic {
  id: number;
  trip_id: number;
  created_at: string;
  city: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  vibe: VibeTag;
  notes?: string | null;
  highlight?: string | null;
  lowlight?: string | null;
  would_return: boolean;
  order: number;
}

export interface TripStopCreate {
  city: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  vibe: VibeTag;
  notes?: string | null;
  highlight?: string | null;
  lowlight?: string | null;
  would_return: boolean;
  order?: number | null;
}

export interface TripStopUpdate extends Partial<TripStopCreate> {}

export interface TripPublic {
  id: number;
  user_id: number;
  created_at: string;
  title?: string | null;
  start_date: string;
  end_date: string;
  travel_style: TravelStyle;
  budget_level: BudgetLevel;
  is_public: boolean;
  ai_summary?: string | null;
  countries: string[];
  stops: TripStopPublic[];
}

export interface TripCreate {
  title?: string | null;
  start_date: string;
  end_date: string;
  travel_style: TravelStyle;
  budget_level: BudgetLevel;
  is_public?: boolean;
  stops: TripStopCreate[];
}

export interface TripUpdate extends Partial<Omit<TripCreate, "stops">> {}

export interface StrangerTipPublic {
  id: number;
  country: string;
  city: string;
  content: string;
  is_public: boolean;
  helpful_count: number;
  created_at: string;
  username: string | null;
}

export interface StrangerTipCreate {
  country: string;
  city: string;
  content: string;
  is_public?: boolean;
  is_anonymous?: boolean;
}

export interface UserPublic {
  id: number;
  username: string;
  email: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: number | null;
}

export interface ChatResponse {
  message?: string;
  response?: string;
  content?: string;
  conversation_id?: number;
  citations?: string[];
  [key: string]: unknown;
}

export interface UiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  conversationId?: number;
}

export interface ConversationPreview {
  conversation_id: number;
  preview: string;
  created_at: string;
}

export interface ConversationMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
