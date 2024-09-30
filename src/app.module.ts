import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [CartModule, OrderModule, ProductModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
