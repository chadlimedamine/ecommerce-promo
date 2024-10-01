import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddPromotionToCartDto {
    
    
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    cartId: number;
}
