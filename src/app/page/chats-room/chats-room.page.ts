import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-chats-room',
  templateUrl: './chats-room.page.html',
  styleUrls: ['./chats-room.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class ChatsRoomPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
