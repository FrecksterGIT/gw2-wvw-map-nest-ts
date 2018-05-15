import {Module} from '@nestjs/common';
import {Gw2ApiService} from './gw2-api.service';

@Module({
  exports: [Gw2ApiService],
  providers: [Gw2ApiService]
})
export class Gw2ApiModule {
}
