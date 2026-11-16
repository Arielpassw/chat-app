import type { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./page/login/login.page').then((m) => m.LoginPage),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./page/register/register.page').then((m) => m.RegisterPage),
  },

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./page/home/home.page').then((m) => m.HomePage),
  },

  {
    path: 'chats',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./page/chats/chats.page').then((m) => m.ChatsPage),
  },

  {
    path: 'chats-room',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./page/chats-room/chats-room.page').then(
        (m) => m.ChatsRoomPage
      ),
  },

  {
    path: 'contacts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./page/contacts/contacts.page').then(
        (m) => m.ContactsPage
      ),
  },

  {
    path: 'create-room',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./page/create-room/create-room.page').then(
        (m) => m.CreateRoomPage
      ),
  },

  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./page/profile/profile.page').then(
        (m) => m.ProfilePage
      ),
  },

  {
    path: 'edit-profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./page/edit-profile/edit-profile.page').then(
        (m) => m.EditProfilePage
      ),
  },

  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./page/settings/settings.page').then(
        (m) => m.SettingsPage
      ),
  },

  {
    path: 'media-preview',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./page/media-preview/media-preview.page').then(
        (m) => m.MediaPreviewPage
      ),
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];