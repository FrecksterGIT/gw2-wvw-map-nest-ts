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

  public getSubscribedMatches(lang: string): string[] {
    return this.clients
      .filter((client) => client.matchId !== '' && client.language === lang)
      .map((client): string => client.matchId)
      .filter((v, i, a) => a.indexOf(v) === i);
  }

  public getSubscribedLanguages(): string[] {
    return this.clients
      .filter((client) => client.matchId !== '')
      .map((client): string => client.language)
      .filter((v, i, a) => a.indexOf(v) === i);
  }

  public handleConnection(client) {
    this.clients.push({
      client,
      language: '',
      matchId: ''
    });
  }

  public handleDisconnect(client) {
    this.clients = this.clients.filter((c) => c.client !== client);
    if (this.clients.length === 0) {
      this.updateService.stopUpdates();
    }
  }

  @SubscribeMessage('subscribe')
  public onSubscribe(client, data): WsResponse<any> {
    Logger.log('client subscribed: ' + JSON.stringify(data), 'UpdateGateway');
    if (!data.matchId || !data.language) {
      return {event: 'subscribed', data: ''};
    }
    this.clients = this.clients.map((c) => {
      if (c.client === client) {
        c.matchId = data.matchId;
        c.language = data.language;
      }
      return c;
    });
    this.updateService.startUpdates();
    this.updateService.pushFullUpdate(data.matchId, data.language).then().catch();
    return {event: 'subscribed', data};
  }

  @SubscribeMessage('upgrades')
  public async onUpgrades(client, data): Promise<WsResponse<any>> {
    const upgrades = await this.gw2ApiService.getGuildUpgrades(data.data, data.language);
    return {event: 'upgrades', data: upgrades};
  }

  public sendUpdate(data: IUpdateData, lang): void {
    this.clients.forEach((client) => {
      if (client.matchId === data.id && client.language === lang) {
        client.client.emit('update', data);
      }
    });
  }
}
