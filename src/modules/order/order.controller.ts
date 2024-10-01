import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto';

@Controller('orders')
export class OrderController {
    constructor(private orderService: OrderService){}

    @Post()
    async cretaeOrder(
        @Body() createorderDto: CreateOrderDto,
    ){
        return await this.orderService.createOrder(createorderDto.cartId);
    }

    @Get(':orderId')
    async getOrderById(
        @Param('orderId', ParseIntPipe) orderid: number,
    ){
        return await this.orderService.getOrderById(orderid);
    }
}
