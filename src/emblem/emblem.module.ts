import {Module} from '@nestjs/common';
import {Gw2ApiModule} from '../gw2api/gw2-api.module';
import {EmblemController} from './emblem.controller';
import {EmblemService} from './emblem.service';
import {EmblemPngService} from './emblem_png.service';

@Module({
  controllers: [EmblemController],
  exports: [EmblemService, EmblemPngService],
  imports: [Gw2ApiModule],
  providers: [EmblemService, EmblemPngService]
})
export class EmblemModule {
}
