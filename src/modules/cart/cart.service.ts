import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
    constructor(private config: ConfigService, private prisma: PrismaService){}

    async createCart(
        userId: number,
    ){
        const user = await this.prisma.user.findUnique(
            {
                where: {
                    id: userId
                }
            }
        );

        if (!user)
            throw new NotFoundException(`User with id: ${userId} not found!`);

        const cart = await this.prisma.cart.create(
            {
                data: {
                    status: 'ongoing',
                    userId: userId,
                }
            }
        );

        return cart;
    }

    async addItemToCart(
        productId: number,
        cartId: number,
    ){
        const cart = await this.prisma.cart.findUnique(
            {
                where: {
                    id: cartId,
                }
            }
        );

        if (!cart)
            throw new NotFoundException(`Cart with id ${cartId} not found`);

        const product = await this.prisma.product.findUnique(
            {
                where: {
                    id: productId
                }
            }
        );

        if (!product)
            throw new NotFoundException(`Product with uid ${productId} not found`);

        const cartItem = await this.prisma.cartItem.create(
            {
                data: {
                    cartId: cartId,
                    productId: productId
                }
            }
        );

        return cartItem;
    }

    async removeItemFromCart(
        cartId: number,
        cartItemId: number,
    ){
        const cart = await this.prisma.cart.findUnique(
            {
                where: {
                    id: cartId,
                }
            }
        );

        if (!cart)
            throw new NotFoundException(`Cart with id ${cartId} not found`);

        const cartItem = await this.prisma.cartItem.findUnique(
            {
                where: {
                    id: cartItemId
                }
            }
        );

        if (!cartItem)
            throw new NotFoundException(`Cartitem with uid ${cartItemId} not found`);

        await this.prisma.cartItem.delete(
            {
                where: {
                    id: cartItemId
                }
            }
        );

        return cartItem;
    }
}
