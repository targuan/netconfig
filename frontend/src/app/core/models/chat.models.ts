export type ChatRoomType = 'general' | 'tasks' | 'devices' | 'configurations';

export interface ChatMessage {
  room: ChatRoomType;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
}

export interface ChatRoomState {
  id: ChatRoomType;
  name: string;
  messages: ChatMessage[];
  hasUnread: boolean;
}
