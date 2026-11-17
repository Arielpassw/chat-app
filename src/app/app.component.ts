
import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  personOutline,
  searchOutline,
  addOutline,
  chevronForwardOutline,
  chatbubblesOutline,
  checkmarkDoneOutline,
  sendOutline,
  hourglassOutline,
  alertCircleOutline,
  closeCircleOutline,
  peopleOutline,
  chatbubbleOutline,
  chatbubbleEllipsesOutline,
  settingsOutline,
  createOutline,
  atOutline,
  mailOutline,
  callOutline,
  checkmarkOutline,
  logOutOutline,
  imageOutline,
  closeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet
  ]
})
export class AppComponent {
  constructor() {
    addIcons({
      arrowBackOutline,
      personOutline,
      searchOutline,
      addOutline,
      chevronForwardOutline,
      chatbubblesOutline,
      checkmarkDoneOutline,
      sendOutline,
      hourglassOutline,
      alertCircleOutline,
      closeCircleOutline,
      peopleOutline,
      chatbubbleOutline,
      chatbubbleEllipsesOutline,
      settingsOutline,
      createOutline,
      atOutline,
      mailOutline,
      callOutline,
      checkmarkOutline,
      logOutOutline,
      imageOutline,
      closeOutline,
    });
  }
}
