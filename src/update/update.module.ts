import {Module} from '@nestjs/common';
import {Gw2ApiModule} from '../gw2api/gw2-api.module';
import {UpdateGateway} from './update.gateway';
import {UpdateService} from './update.service';

@Module({
  imports: [Gw2ApiModule],
  providers: [UpdateGateway, UpdateService]
})
export class UpdateModule {
}
