import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway(3001, {
  cors: { origin: '*' },
  pingTimeout: 60000, 
  pingInterval: 25000,
})
export class EnvironmentalDataGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  private readonly logger = new Logger(EnvironmentalDataGateway.name);

 
 afterInit(server: Server) {
  console.log('!!!!!!!!!!!!!!!! WEBSOCKET IS ALIVE ON PORT 3001 !!!!!!!!!!!!!!!!');
}

 
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

 
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }


broadcastAlert(data: any) {
 
  this.logger.log(`\n📢 [WebSocket Broadcast]\n${JSON.stringify(data, null, 2)}\n`);
  
  this.server.emit('message', data);
  this.server.emit('new_alert', data);
}
}