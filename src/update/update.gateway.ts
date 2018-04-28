import {forwardRef, Inject, Logger} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse
} from '@nestjs/websockets';
import {IMatchClient} from './interfaces/match-client.interface';
import {UpdateType} from './interfaces/updates.enum';
import {UpdateService} from './update.service';

@WebSocketGateway({
  namespace: 'update'
})
export class UpdateGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private clients: IMatchClient[] = [];

  public get subscribedMatches(): string[] {
    return this.clients.map((match): string => {
      return match.matchId;
    });
  }

  constructor(
    @Inject(forwardRef(() => UpdateService))
    private readonly updateService: UpdateService
  ) {
  }

  public handleConnection(client) {
    this.clients.push({
      client,
      matchId: ''
    });
    this.updateService.startUpdates();
  }

  public handleDisconnect(client) {
    this.clients = this.clients.filter((c) => c.client !== client);
    if (this.clients.length === 0) {
      this.updateService.stopUpdates();
    }
  }

  @SubscribeMessage('subscribe')
  public async onSubscribe(client, data): Promise<WsResponse<string>> {
    Logger.log('client subscribed: ' + JSON.stringify(data), 'UpdateGateway');
    this.clients = this.clients.map((c) => {
      if (c.client === client) {
        c.matchId = data;
      }
      return c;
    });
    await this.updateService.pushFullUpdate(data);
    return client.emit('subscribed', data);
  }

  public sendUpdate(matchId: string, type: UpdateType, data: any): void {
    this.clients.forEach((client) => {
      if (client.matchId === matchId) {
        client.client.emit('update', {
          id: matchId, payload: data, type
        });
      }
    });
  }
}
