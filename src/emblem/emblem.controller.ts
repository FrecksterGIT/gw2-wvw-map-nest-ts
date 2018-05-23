import {Controller, Get, Header, Param, Req, Res} from '@nestjs/common';
import {EmblemService} from './emblem.service';
import {EmblemPngService} from './emblem_png.service';

@Controller()
export class EmblemController {

  constructor(private readonly emblemService: EmblemService, private readonly emblemPngService: EmblemPngService) {
  }

  @Get('emblem/:guild_id/256.svg')
  @Header('Content-Type', 'image/svg+xml')
  public async svg(@Param('guild_id') guildId: string) {
    return await this.emblemService.getEmblem(guildId);
  }

  @Get('emblem/:guild_id/256.png')
  public async png(@Param('guild_id') guildId, @Res() res) {
    res.setHeader('Content-Type', 'image/png');
    res.send(await this.emblemPngService.getEmblem(guildId));
  }
}
