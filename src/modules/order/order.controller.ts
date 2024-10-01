import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';

@Controller('order')
export class OrderController {
    constructor(private orderService: OrderService){}

    @Post()
    async cretaeOrder(
        @Body() createorderDto: CreateOrderDto,
    ){
        return await this.orderService.createOrder(createorderDto.cartId);
    }
}
