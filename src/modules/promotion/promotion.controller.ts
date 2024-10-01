import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { AddPromotionToCartDto, DeletePromotionFromCartDto } from './dto';

@Controller('promotions')
export class PromotionController {
    constructor(private promotionService: PromotionService){}

    @Get()
    async getPromotions(){
        return await this.promotionService.getPromotions();
    }

    @Post('/:promotionId')
    async addPromotionToCart(
        @Param('promotionId', ParseIntPipe) promotionId: number,
        @Body() addPromotionToCartDto: AddPromotionToCartDto,
    ){
        return await this.promotionService.addPromotionToCart(
            promotionId, 
            addPromotionToCartDto.cartId
        );
    }

    @Delete('/:promotionId')
    async removePromotionToCart(
        @Param('promotionId', ParseIntPipe) promotionId: number,
        @Body() deletePromotionFromCartDto: DeletePromotionFromCartDto,
    ){
        return await this.promotionService.removePromotionFromCart(
            promotionId, 
            deletePromotionFromCartDto.cartId
        );
    }
}
