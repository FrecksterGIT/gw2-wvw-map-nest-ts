import {Controller, Get, Header, Param, Res} from '@nestjs/common';
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

  @Get('emblem/:guild_id/128.png')
  public async png(@Param('guild_id') guildId, @Res() res) {
    const emblem = await this.emblemPngService.getEmblem(guildId);
    if (emblem && emblem.redirect) {
      res.statusCode = 302;
      res.setHeader('Location', emblem.redirect);
      res.send();
    } else {
      res.setHeader('Content-Type', 'image/png');
      res.send(emblem);
    }
  }
}
