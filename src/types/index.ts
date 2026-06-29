/**
 * src/types/index.ts — Shared TypeScript interfaces for the Car and Chat entities.
 *
 * All field names and types match the Python Pydantic models exactly.
 * Importable via: import { Car, CarCreate, CarResponse, CarListResponse, ChatMessage, ChatConversation } from '@/types';
 */

// =============================================================================
// Car interfaces
// =============================================================================

/**
 * Core Car entity representing a single car in the store.
 * Every field is required. Matches the Pydantic `Car` model.
 */
export interface Car {
  /** Unique identifier for the car (UUID v4 string, auto-generated on creation). */
  id: string;
  /** Car manufacturer/brand name. Must be a non-empty string. */
  brand: string;
  /** Car model name. Must be a non-empty string. */
  model: string;
  /** Manufacturing year. Must be >= 1886 and <= current year. */
  year: number;
  /** Total kilometres driven. Must be >= 0. */
  km: number;
  /** Price in EUR. Must be >= 0. */
  price: number;
  /** URL or relative path to the car's image file. */
  image_url: string;
}

/**
 * Request payload for creating a new car.
 * Contains all Car fields EXCEPT `id`, which is auto-generated server-side.
 * Matches the Pydantic `CarCreate` model.
 */
export interface CarCreate {
  /** Car manufacturer/brand name. Must be a non-empty string. */
  brand: string;
  /** Car model name. Must be a non-empty string. */
  model: string;
  /** Manufacturing year. Must be >= 1886 and <= current year. */
  year: number;
  /** Total kilometres driven. Must be >= 0. */
  km: number;
  /** Price in EUR. Must be >= 0. */
  price: number;
  /** URL or relative path to the car's image file. */
  image_url: string;
}

/**
 * API response wrapper for a single Car.
 * Matches the Pydantic `CarResponse` model.
 */
export interface CarResponse {
  /** The requested car object. */
  car: Car;
}

/**
 * API response wrapper for a list of Cars.
 * Matches the Pydantic `CarListResponse` model.
 */
export interface CarListResponse {
  /** List of car objects. */
  cars: Car[];
}

// =============================================================================
// Chat / Conversation interfaces
// =============================================================================

/**
 * Enum-like union type for chat message roles.
 * Matches the Python `ChatRole` enum.
 */
export type ChatRole = "user" | "assistant";

/**
 * A single message in a chat conversation.
 * Matches the Pydantic `ChatMessage` model.
 */
export interface ChatMessage {
  /** Role of the message sender. One of: 'user', 'assistant'. */
  role: ChatRole;
  /** The textual content of the message. Must be a non-empty string. */
  content: string;
  /** UTC timestamp of when the message was created (ISO-8601 string). */
  timestamp: string;
}

/**
 * A chat conversation containing a sequence of messages.
 * Matches the Pydantic `ChatConversation` model.
 */
export interface ChatConversation {
  /** Unique identifier for the conversation (UUID v4 string, auto-generated). */
  id: string;
  /** Human-readable title for the conversation. Must be non-empty. */
  title: string;
  /** Ordered list of messages in the conversation. */
  messages: ChatMessage[];
  /** UTC timestamp of when the conversation was created (ISO-8601 string). */
  created_at: string;
  /** UTC timestamp of when the conversation was last updated (ISO-8601 string). */
  updated_at: string;
}
