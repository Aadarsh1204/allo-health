import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { ProductsModule } from './products/products.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { RedisModule } from './redis/redis.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ProductsModule,
    WarehouseModule,
    RedisModule,
    ReservationsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}