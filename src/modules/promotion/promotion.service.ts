import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromotionService {
    constructor(private prisma: PrismaService){}

    async getPromotions(){
        const promotions = await this.prisma.promotion.findMany();

        return promotions;
    }

    async addPromotionToCart(
        promotionId: number,
        cartId: number,
    ){
        const promotion = await this.prisma.promotion.findUnique(
            {
                where: {
                    id: promotionId
                }
            }
        );

        if (!promotion)
            throw new NotFoundException(`Promotion with id: ${promotionId} not found`);

        const cart = await this.prisma.cart.findUnique(
            {
                where: {
                    id: cartId
                }
            }
        );

        if (!cart)
            throw new NotFoundException(`Cart with id: ${cartId} not found`);

        const promotionAppliedOnCart = await this.prisma.promotionAppliedOnCart.create(
            {
                data: {
                    cartId: cartId,
                    promotionId: promotionId
                },
            }
        );

        return promotionAppliedOnCart;
    }

    async removePromotionFromCart(
        promotionId: number,
        cartId: number,
    ){
        const promotion = await this.prisma.promotion.findUnique(
            {
                where: {
                    id: promotionId
                }
            }
        );

        if (!promotion)
            throw new NotFoundException(`Promotion with id: ${promotionId} not found`);

        const cart = await this.prisma.cart.findUnique(
            {
                where: {
                    id: cartId
                }
            }
        );

        if (!cart)
            throw new NotFoundException(`Cart with id: ${cartId} not found`);

        const deletedPromotionAppliedOnCart = await this.prisma.promotionAppliedOnCart.delete(
            {
                where: {
                    promotionAppliedOnCartId: {
                        cartId: cartId,
                        promotionId: promotionId
                    }
                }
            }
        );

        return deletedPromotionAppliedOnCart;
    }
}
