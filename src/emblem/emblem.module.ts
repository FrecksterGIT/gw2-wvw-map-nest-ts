import {Module} from '@nestjs/common';
import {Gw2ApiModule} from '../gw2api/gw2-api.module';
import {EmblemController} from './emblem.controller';
import {EmblemService} from './emblem.service';

@Module({
  controllers: [EmblemController],
  exports: [EmblemService],
  imports: [Gw2ApiModule],
  providers: [EmblemService]
})
export class EmblemModule {
}
