import { Component, inject, ViewChildren, QueryList, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { ChatService } from '../../../core/services/chat.service';
import { ChatRoomType, ChatRoomState } from '../../../core/models/chat.models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  public chatService = inject<ChatService>(ChatService);

  isOpen = false;
  newMessage = '';
  activeRoomIndex = 0;
  rooms: ChatRoomState[] = [];

  @ViewChildren('scrollContainer') private scrollContainers?: QueryList<ElementRef>;

  ngOnInit() {
    this.chatService.rooms$.subscribe(rooms => {
      this.rooms = rooms;
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const activeRoomId = this.rooms[this.activeRoomIndex]?.id;
    this.chatService.setChatOpen(this.isOpen, activeRoomId);
  }

  onTabChange(index: number) {
    this.activeRoomIndex = index;
    const activeRoomId = this.rooms[index]?.id;
    if (activeRoomId) {
      this.chatService.setChatOpen(this.isOpen, activeRoomId);
    }
  }

  sendMessage(room: ChatRoomType) {
    if (this.newMessage.trim()) {
      this.chatService.sendMessage(room, this.newMessage.trim());
      this.newMessage = '';
    }
  }

  private scrollToBottom(): void {
    if (this.scrollContainers) {
      this.scrollContainers.forEach((container, index) => {
        if (index === this.activeRoomIndex) {
          try {
            container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
          } catch (err) {}
        }
      });
    }
  }
}
