import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./page/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./page/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./page/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'chats',
    loadComponent: () => import('./page/chats/chats.page').then((m) => m.ChatsPage),
  },
  {
    path: 'chats-room',
    loadComponent: () => import('./page/chats-room/chats-room.page').then((m) => m.ChatsRoomPage),
  },
  {
    path: 'contacts',
    loadComponent: () => import('./page/contacts/contacts.page').then((m) => m.ContactsPage),
  },
  {
    path: 'create-room',
    loadComponent: () => import('./page/create-room/create-room.page').then((m) => m.CreateRoomPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./page/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./page/edit-profile/edit-profile.page').then((m) => m.EditProfilePage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./page/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'media-preview',
    loadComponent: () => import('./page/media-preview/media-preview.page').then((m) => m.MediaPreviewPage),
  },
];
