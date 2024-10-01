import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromotionService {
    constructor(private prisma: PrismaService){}

    async getPromotions(){
        const promotions = await this.prisma.promotion.findMany();

        return promotions;
    }
}
