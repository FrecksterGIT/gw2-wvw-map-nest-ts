import {Module} from '@nestjs/common';
import {Gw2ApiService} from './gw2-api.service';

@Module({
  components: [Gw2ApiService],
  exports: [Gw2ApiService]
})
export class Gw2ApiModule {
}
