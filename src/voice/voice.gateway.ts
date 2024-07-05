import { Server, Socket } from 'socket.io';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class VoiceGateway {
  server: Server;
  rooms: Array<string> = []; // 방 목록을 관리할 Set

  afterInit(server: Server) {
    this.server = server;
  }
  @SubscribeMessage('getRooms')
  fetchRoomList(@ConnectedSocket() client: Socket) {
    const roomList = Array.from(this.rooms).map((room) => ({ id: room }));
    client.emit('roomList', roomList); // roomList 이벤트로 방 목록을 클라이언트에 전송
  }
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    client.to(data.room).emit('user-joined', client.id);
  }

  @SubscribeMessage('leave')
  handleLeave(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
    client.to(data.room).emit('user-left', client.id);
  }

  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() data: { room: string; signal: any; senderId: string },
  ) {
    this.server
      .to(data.room)
      .emit('signal', { signal: data.signal, senderId: data.senderId });
  }
}
