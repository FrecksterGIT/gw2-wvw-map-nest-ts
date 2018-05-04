import {forwardRef, Inject, Logger} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse
} from '@nestjs/websockets';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import {IMatchClient} from './interfaces/match-client.interface';
import {IUpdateData} from './interfaces/update-data.interface';
import {UpdateService} from './update.service';

@WebSocketGateway({
  namespace: 'update'
})
export class UpdateGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private clients: IMatchClient[] = [];

  constructor(
    @Inject(forwardRef(() => UpdateService))
    private readonly updateService: UpdateService,
    @Inject(forwardRef(() => Gw2ApiService))
    private readonly gw2ApiService: Gw2ApiService
  ) {
  }

  public get subscribedMatches(): string[] {
    return this.clients
      .map((match): string => match.matchId)
      .filter((matchId) => matchId !== '');
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
    this.updateService.pushFullUpdate(data).then().catch();
    return client.emit('subscribed', data);
  }

  @SubscribeMessage('upgrades')
  public async onUpgrades(client, data): Promise<WsResponse<string>> {
    const upgrades = await this.gw2ApiService.getGuildUpgrades(data);
    return client.emit('upgrades', upgrades);
  }

  public sendUpdate(data: IUpdateData): void {
    this.clients.forEach((client) => {
      if (client.matchId === data.id) {
        client.client.emit('update', data);
      }
    });
  }
}
