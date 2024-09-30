import { Body, Controller, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto';

@Controller('cart')
export class CartController {
    constructor(private cartService: CartService){}

    @Post()
    async createCart(
        @Body() createCartDto: CreateCartDto
    ){
        return await this.cartService.createCart(createCartDto.userId);
    }
}
