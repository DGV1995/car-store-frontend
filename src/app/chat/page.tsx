'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatConversation, ChatMessage } from '@/types';
import { apiFetch, apiUrl } from '@/lib/api';
import ChatSidebar from '@/components/ChatSidebar';
import ChatArea from '@/components/ChatArea';

/**
 * Chat page that composes the sidebar and main chat area.
 *
 * On mount it fetches the list of conversations for the sidebar.
 * Users can click a conversation to load its history, click
 * "New Chat" to start fresh, and send messages that stream the
 * assistant response back.
 */
export default function ChatPage() {
  /* ─────── State ─────── */

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState<boolean>(true);
  const [sidebarError, setSidebarError] = useState<string | null>(null);

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const [inputValue, setInputValue] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [sendError, setSendError] = useState<string | null>(null);

  /**
   * When true the ChatArea skips its decorative empty state and renders the
   * input field so the user can immediately type after clicking "New Chat".
   */
  const [forceShowInput, setForceShowInput] = useState<boolean>(false);

  /**
   * Incremented every time "New Chat" is clicked so ChatArea can
   * programmatically focus the message input field.
   */
  const [focusKey, setFocusKey] = useState<number>(0);

  // AbortController ref for cancelling an in-flight streaming request
  const abortControllerRef = useRef<AbortController | null>(null);

  /* ─────── Fetch conversations for sidebar ─────── */

  const fetchConversations = useCallback(async () => {
    setSidebarLoading(true);
    setSidebarError(null);

    try {
      const response = await apiFetch('/api/chat/conversations');

      if (!response.ok) {
        throw new Error(
          `Failed to fetch conversations (status ${response.status})`,
        );
      }

      const data: ChatConversation[] = await response.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setSidebarError(message);
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /* ─────── Fetch conversation history ─────── */

  const loadConversation = useCallback(async (id: string) => {
    setHistoryLoading(true);
    setSendError(null);
    setStreamingContent('');

    try {
      const response = await apiFetch(`/api/chat/conversations/${id}`);

      if (!response.ok) {
        throw new Error(
          `Failed to load conversation (status ${response.status})`,
        );
      }

      const data: ChatConversation = await response.json();
      setMessages(data.messages ?? []);
      setSelectedConversationId(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setSendError(message);
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /* ─────── New Chat ─────── */

  const handleNewChat = useCallback(() => {
    // Abort any in-flight streaming request
    abortControllerRef.current?.abort();

    // Reset all chat-related state to a clean slate
    setIsStreaming(false);
    setStreamingContent('');
    setSelectedConversationId(null);
    setMessages([]);
    setHistoryLoading(false);
    setSendError(null);
    setInputValue('');

    // Show the input field even though there are no messages yet
    setForceShowInput(true);

    // Trigger a focus on the message input via ChatArea's focusKey prop
    setFocusKey((prev) => prev + 1);
  }, []);

  /* ─────── Select conversation ─────── */

  const handleSelectConversation = useCallback(
    (id: string) => {
      // Abort any in-flight streaming request
      abortControllerRef.current?.abort();
      setIsStreaming(false);
      setStreamingContent('');
      setSendError(null);

      // When loading an existing conversation we don't need to force the
      // input — if the conversation has messages they'll be displayed; if
      // it's somehow empty we still show the input as a fallback.
      setForceShowInput(false);

      loadConversation(id);
    },
    [loadConversation],
  );

  /* ─────── Send message ─────── */

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isStreaming) return;

    setSendError(null);

    // Optimistically add the user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);
    setStreamingContent('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConversationId,
          message: content,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(
          errorBody ||
            `Failed to send message (status ${response.status})`,
        );
      }

      // ── Handle streaming response ──

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body stream available');
      }

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingContent(accumulated);
      }

      // Streaming finished — add the complete assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: accumulated,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');

      // Refresh the sidebar conversation list so this conversation moves to top
      await fetchConversations();

      // If this was a new conversation (no id yet), try to find the new id
      if (!selectedConversationId) {
        // Fetch conversations again to get the newly created one
        // The first conversation (by updated_at desc) should be the new one
        try {
          const convResponse = await apiFetch('/api/chat/conversations');
          if (convResponse.ok) {
            const convs: ChatConversation[] = await convResponse.json();
            if (Array.isArray(convs) && convs.length > 0) {
              // Find the conversation whose last assistant message matches
              const matching = convs.find((c) =>
                c.messages.some(
                  (m) =>
                    m.role === 'assistant' && m.content === accumulated,
                ),
              );
              if (matching) {
                setSelectedConversationId(matching.id);
              } else {
                // Fallback: pick the most recent (first after sort by updated_at)
                const sorted = [...convs].sort(
                  (a, b) =>
                    new Date(b.updated_at).getTime() -
                    new Date(a.updated_at).getTime(),
                );
                setSelectedConversationId(sorted[0].id);
              }
            }
          }
        } catch {
          // Silently ignore — the sidebar will update on next fetch
        }
      }
    } catch (err) {
      // Don't show error for aborted requests
      if (err instanceof DOMException && err.name === 'AbortError') return;

      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setSendError(message);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [
    inputValue,
    isStreaming,
    selectedConversationId,
    fetchConversations,
  ]);

  /* ─────── Render ─────── */

  return (
    <main className="h-[calc(100vh-3.5rem)] flex">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        isLoading={sidebarLoading}
      />

      {/* Main chat area */}
      <ChatArea
        messages={messages}
        isLoadingHistory={historyLoading}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        error={sendError}
        forceShowInput={forceShowInput}
        focusKey={focusKey}
      />

      {/* Full-page error overlay if sidebar failed to load */}
      {sidebarError && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="text-center px-6 max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-3xl">!</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Could not load conversations
            </h2>
            <p className="mt-2 text-sm text-gray-500">{sidebarError}</p>
            <button
              type="button"
              onClick={fetchConversations}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
