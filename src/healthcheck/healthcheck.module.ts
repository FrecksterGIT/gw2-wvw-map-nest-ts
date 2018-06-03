import {Module} from '@nestjs/common';
import {UpdateModule} from '../update/update.module';
import {HealthcheckController} from './healthcheck.controller';

@Module({
  controllers: [HealthcheckController],
  imports: [UpdateModule]
})
export class HealthcheckModule {
}
