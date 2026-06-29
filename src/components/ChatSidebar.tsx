'use client';

import type { ChatConversation } from '@/types';

export interface ChatSidebarProps {
  /** List of all conversations fetched from the API. */
  conversations: ChatConversation[];
  /** ID of the currently selected conversation, or null for a new chat. */
  selectedConversationId: string | null;
  /** Called when the user clicks a conversation in the list. */
  onSelectConversation: (id: string) => void;
  /** Called when the user clicks the 'New Chat' button. */
  onNewChat: () => void;
  /** Whether the conversations are currently being fetched. */
  isLoading: boolean;
}

/**
 * Sidebar component showing the list of chat conversations.
 * Displays a 'New Chat' button at the top and each conversation's
 * title with a preview of the last message below.
 */
export default function ChatSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  isLoading,
}: ChatSidebarProps) {
  return (
    <aside className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* New Chat button */}
      <div className="p-3 border-b border-gray-200">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-gray-300 mb-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
              />
            </svg>
            <p className="text-sm text-gray-400">No conversations yet.</p>
            <p className="text-xs text-gray-300 mt-1">
              Start a new chat above.
            </p>
          </div>
        )}

        {conversations.map((conv) => {
          const isSelected = conv.id === selectedConversationId;
          const lastMessage =
            conv.messages.length > 0
              ? conv.messages[conv.messages.length - 1].content
              : '';
          const preview =
            lastMessage.length > 60
              ? lastMessage.slice(0, 60) + '…'
              : lastMessage;

          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors hover:bg-gray-100 ${
                isSelected ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
              }`}
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {conv.title}
              </p>
              {preview && (
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {preview}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
