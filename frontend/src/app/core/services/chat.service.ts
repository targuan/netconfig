import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject } from 'rxjs';
import { ChatRoomState, ChatRoomType } from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private websockets: Map<ChatRoomType, WebSocketSubject<any>> = new Map();
  private pendingMessages: Map<ChatRoomType, string[]> = new Map();

  private initialRooms: ChatRoomType[] = ['general', 'tasks', 'devices', 'configurations'];

  private _rooms$ = new BehaviorSubject<ChatRoomState[]>(
    this.initialRooms.map(id => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      messages: [],
      hasUnread: false
    }))
  );

  public rooms$ = this._rooms$.asObservable();

  private _totalUnread$ = new BehaviorSubject<boolean>(false);
  public totalUnread$ = this._totalUnread$.asObservable();

  private _isChatOpen = false;

  constructor() {
    this.initialRooms.forEach(room => {
      this.pendingMessages.set(room, []);
      this.connect(room);
    });
  }

  private connect(room: ChatRoomType) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = 'netgui.targuan.fr'; // Hardcoded as per task service
    const url = `${protocol}//${host}/ws/chat/${room}`;

    const socket$ = webSocket(url);
    this.websockets.set(room, socket$);

    socket$.subscribe({
      next: (msg: any) => {
        if (msg.message) {
          this.handleIncomingMessage(room, msg.message);
        }
      },
      error: (err) => {
        console.error(`WebSocket error for room ${room}:`, err);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(room), 5000);
      },
      complete: () => {
        console.log(`WebSocket closed for room ${room}`);
      }
    });
  }

  private handleIncomingMessage(room: ChatRoomType, text: string) {
    const currentRooms = this._rooms$.value;
    const roomIndex = currentRooms.findIndex(r => r.id === room);

    if (roomIndex !== -1) {
      const updatedRooms = [...currentRooms];
      const targetRoom = { ...updatedRooms[roomIndex] };

      // To avoid duplicates of our own messages (since we add them locally in sendMessage)
      // we only add incoming messages if they don't match the last 'me' message.
      // This is a bit naive but works for this POC.
      const lastMessage = targetRoom.messages[targetRoom.messages.length - 1];
      if (lastMessage && lastMessage.sender === 'me' && lastMessage.text === text) {
        return;
      }

      targetRoom.messages = [...targetRoom.messages, {
        room,
        text,
        sender: 'other',
        timestamp: new Date()
      }];

      if (!this._isChatOpen) {
        targetRoom.hasUnread = true;
        this._totalUnread$.next(true);
      }

      updatedRooms[roomIndex] = targetRoom;
      this._rooms$.next(updatedRooms);
    }
  }

  sendMessage(room: ChatRoomType, text: string) {
    const socket = this.websockets.get(room);

    // Add "me" message locally immediately for better UX
    const currentRooms = this._rooms$.value;
    const roomIndex = currentRooms.findIndex(r => r.id === room);
    if (roomIndex !== -1) {
      const updatedRooms = [...currentRooms];
      const targetRoom = { ...updatedRooms[roomIndex] };
      targetRoom.messages = [...targetRoom.messages, {
        room,
        text,
        sender: 'me',
        timestamp: new Date()
      }];
      updatedRooms[roomIndex] = targetRoom;
      this._rooms$.next(updatedRooms);
    }

    if (socket) {
      // We still send to WS but we don't need to track it in pendingMessages
      // if we've already added it locally.
      // However, we should be careful about duplicates if the server echoes it.
      // For this POC, let's just use a simpler approach.
      socket.next({ message: text });
    }
  }

  setChatOpen(isOpen: boolean, activeRoomId?: ChatRoomType) {
    this._isChatOpen = isOpen;
    if (isOpen && activeRoomId) {
      this.clearUnread(activeRoomId);
    }
  }

  public clearUnread(roomId: ChatRoomType) {
    const currentRooms = this._rooms$.value;
    const roomIndex = currentRooms.findIndex(r => r.id === roomId);
    if (roomIndex !== -1) {
      const updatedRooms = [...currentRooms];
      updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], hasUnread: false };
      this._rooms$.next(updatedRooms);

      // Update total unread status
      const anyUnread = updatedRooms.some(r => r.hasUnread);
      this._totalUnread$.next(anyUnread);
    }
  }
}
