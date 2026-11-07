import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-media-preview',
  templateUrl: './media-preview.page.html',
  styleUrls: ['./media-preview.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class MediaPreviewPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
