import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService){}

    async createOrder(
    cartId: number,
    ){
        
    }
}
