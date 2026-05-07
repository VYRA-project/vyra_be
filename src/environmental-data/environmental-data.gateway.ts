import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  pingTimeout: 60000, 
  pingInterval: 25000,
})
export class EnvironmentalDataGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  
  private readonly logger = new Logger(EnvironmentalDataGateway.name);

afterInit(server: any) {
  // Verificăm dacă serverul are o adresă (funcționează pe servere HTTP/Express)
  const httpServer = server.httpServer || (server.engine && server.engine.handleUpgrade ? server.engine : null);
  
  // Cea mai sigură metodă în NestJS pentru a lua portul:
  const address = server.address ? server.address() : server.parentServer?.address();
  
  const port = typeof address === 'string' ? address : address?.port;

  this.logger.log(`\n!!!!!!!!!!!!!!!! WEBSOCKET IS ALIVE ON PORT ${port || 'unknown'} !!!!!!!!!!!!!!!!\n`);
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