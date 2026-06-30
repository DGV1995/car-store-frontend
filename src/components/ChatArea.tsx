'use client';

import { type FormEvent, type KeyboardEvent, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types';

export interface ChatAreaProps {
  /** Ordered list of messages to display (chronological). */
  messages: ChatMessage[];
  /** Whether the chat area is currently loading message history. */
  isLoadingHistory: boolean;
  /** Whether the assistant is currently generating a streaming response. */
  isStreaming: boolean;
  /** The streaming content being built up as the assistant responds. */
  streamingContent: string;
  /** The current value of the message input. */
  inputValue: string;
  /** Called when the user types in the input field. */
  onInputChange: (value: string) => void;
  /** Called when the user sends a message (either via button or Enter). */
  onSend: () => void;
  /** Error message to display, if any. */
  error: string | null;
  /**
   * When true, the decorative "Start a conversation" empty state is skipped
   * and the input field is rendered instead, so the user can immediately
   * start typing after clicking "New Chat".
   */
  forceShowInput?: boolean;
  /**
   * Incrementing this value triggers a programmatic focus on the message
   * input. Useful after "New Chat" resets the UI so the user can type
   * without manually clicking into the field.
   */
  focusKey?: number;
}

/**
 * Main chat area displaying the message thread and an input box.
 * Renders messages in chronological order with distinct styling
 * for user (right-aligned) vs assistant (left-aligned) messages.
 * Supports streaming content via `streamingContent` and auto-scrolls
 * to the latest message.
 */
export default function ChatArea({
  messages,
  isLoadingHistory,
  isStreaming,
  streamingContent,
  inputValue,
  onInputChange,
  onSend,
  error,
  forceShowInput = false,
  focusKey = 0,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the latest message whenever messages or streaming content change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Focus the input when not streaming
  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus();
    }
  }, [isStreaming]);

  // Focus the input when focusKey changes (e.g. after "New Chat" is clicked)
  useEffect(() => {
    if (focusKey > 0 && !isStreaming) {
      // Small delay to ensure the DOM has updated (the input may have
      // been freshly mounted after switching away from the empty state).
      const raf = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [focusKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = () => {
    if (inputValue.trim() === '' || isStreaming) return;
    onSend();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter without Shift (Shift+Enter inserts newline)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  /* ─────── Empty state ─────── */

  if (
    !isLoadingHistory &&
    messages.length === 0 &&
    !isStreaming &&
    !error &&
    !forceShowInput
  ) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-blue-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Start a conversation
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Ask about cars, get recommendations, or browse our inventory
            through chat.
          </p>
        </div>
      </div>
    );
  }

  /* ─────── Loading history ─────── */

  if (isLoadingHistory) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">
              Send a message to start the conversation.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {/* Streaming message being built */}
        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl px-4 py-2.5 bg-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
              {streamingContent}
              <span className="inline-block w-1.5 h-4 bg-blue-500 ml-0.5 animate-pulse" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            style={{ minHeight: '38px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={inputValue.trim() === '' || isStreaming}
            className="shrink-0 inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────── Message Bubble ─────── */

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  const formattedTime = (() => {
    try {
      const date = new Date(message.timestamp);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  })();

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        <p>{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  );
}
