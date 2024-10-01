import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService){}

    async createOrder(
    cartId: number,
    ){
        const cart = await this.prisma.cart.findUnique(
            {
                where: {
                    id: cartId
                },
                include: {
                    cartItems: {
                        select: {
                            id: true,
                            productId: true,
                            product: true,
                        }
                    },
                    promotionAppliedOnCart: {
                        select: {
                            promotionId: true,
                            promotion: true,
                        }
                    },
                }
            }
        );

        if (!cart)
            throw new NotFoundException(`Cart with id: ${cartId} not found`);

        const createdOrder = await this.prisma.order.create(
            {
                data: {
                    status: 'pending',
                    totalPriceBeforeDiscount: 0,
                    cartId: cartId,
                    userId: cart.userId,
                }
            }
        );

        // add products to the order and calculate the total price before discount
        let totalPriceBeforeDiscount = 0;
        for (let index = 0; index < cart.cartItems.length; index++) {
            const item = cart.cartItems[index];
            totalPriceBeforeDiscount += item.product.price;
            const updatedOrder = await this.prisma.order.update(
                {
                    where: {
                        id: createdOrder.id
                    },
                    data: {
                        totalPriceBeforeDiscount: totalPriceBeforeDiscount,
                        oderItems: {
                            create: {
                                productId: item.productId,
                            }
                        }
                    }
                }
            );
        }

        // add promotions to the order and apply the promotion discount to the order and 
        // calculate the total price after discount
        let totalPriceAfterDiscount = totalPriceBeforeDiscount;
        for (let index = 0; index < cart.promotionAppliedOnCart.length; index++) {
            const promotionAppliedOnCart = cart.promotionAppliedOnCart[index];
            if (
                totalPriceBeforeDiscount >= 
                promotionAppliedOnCart.promotion.minimumPurchaseAmount
            ){
                totalPriceAfterDiscount -= promotionAppliedOnCart.promotion.flatDiscount;
                const updatedorder = await this.prisma.order.update(
                    {
                        where: {
                            id: createdOrder.id,
                        },
                        data: {
                            totalPriceAfterDiscount: totalPriceAfterDiscount,
                            promotionAppliedOnOrder: {
                                create: {
                                    promotionId: promotionAppliedOnCart.promotionId,
                                }
                            }
                        }
                    }
                );
            }
        }

        const finilizedOrder = await this.prisma.order.update(
            {
                where: {
                    id: createdOrder.id,
                },
                data: {
                    status: 'payed',
                },
                select: {
                    id: true,
                    _count: true,
                    cartId: true,
                    createdAt: true,
                    updatedAt: true,
                    status: true,
                    userId: true,
                    totalPriceBeforeDiscount: true,
                    totalPriceAfterDiscount: true,
                    oderItems: {
                        select: {
                            id: true,
                            productId: true,
                            product: true,
                        }
                    },
                    promotionAppliedOnOrder: {
                        select: {
                            id: true,
                            appliedAt: true,
                            promotionId: true,
                            promotion: true,
                        }
                    }
                }
            }
        );

        return finilizedOrder;
    }

    async getOrderById(
        orderId: number,
    ){
        const order = await this.prisma.order.findUnique(
            {
                where: {
                    id: orderId,
                },
                select: {
                    id: true,
                    _count: true,
                    cartId: true,
                    createdAt: true,
                    updatedAt: true,
                    status: true,
                    userId: true,
                    totalPriceBeforeDiscount: true,
                    totalPriceAfterDiscount: true,
                    oderItems: {
                        select: {
                            id: true,
                            productId: true,
                            product: true,
                        }
                    },
                    promotionAppliedOnOrder: {
                        select: {
                            id: true,
                            appliedAt: true,
                            promotionId: true,
                            promotion: true,
                        }
                    }
                }
            }
        );

        if (!order)
            throw new NotFoundException(`Order with id: ${orderId} not found`);
        
        return order;
    }
}
