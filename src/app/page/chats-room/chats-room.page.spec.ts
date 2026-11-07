import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatsRoomPage } from './chats-room.page';

describe('ChatsRoomPage', () => {
  let component: ChatsRoomPage;
  let fixture: ComponentFixture<ChatsRoomPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatsRoomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
