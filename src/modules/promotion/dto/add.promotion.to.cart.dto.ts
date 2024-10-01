import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddPromotionToCartDto {
    
    @IsNumber()
    @IsNotEmpty()
    cartId: number;
}
