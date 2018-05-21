import {Controller, Get, Header, Param} from '@nestjs/common';
import {EmblemService} from './emblem.service';

@Controller()
export class EmblemController {

  constructor(private readonly emblemService: EmblemService) {
  }

  @Get('emblem/:guild_id/256.svg')
  @Header('Content-Type', 'image/svg+xml')
  public async root(@Param('guild_id') guildId: string) {
    return await this.emblemService.getEmblem(guildId);
  }
}
