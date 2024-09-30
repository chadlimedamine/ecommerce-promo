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
}
