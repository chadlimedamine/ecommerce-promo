import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemToCartDto, CreateCartDto } from './dto';

@Controller('carts')
export class CartController {
    constructor(private cartService: CartService){}

    @Post()
    async createCart(
        @Body() createCartDto: CreateCartDto
    ){
        return await this.cartService.createCart(createCartDto.userId);
    }

    @Post('/:id')
    async addItemToCart(
        @Param('id', ParseIntPipe) cartId: number,
        @Body() addItemToCartDto: AddItemToCartDto,
    ){
        return await this.cartService.addItemToCart(addItemToCartDto.productId, cartId);
    }

    @Get('current')
    async getCurrentCart(){
        return await this.cartService.getCurrentCart();
    }

    @Delete('/:cartId/items/:cartItemId')
    async removeItemFromCart(
        @Param('cartId', ParseIntPipe) cartId: number,
        @Param('cartItemId', ParseIntPipe) cartItemId:number
    ){
        return await this.cartService.removeItemFromCart(cartId, cartItemId);
    }
}
