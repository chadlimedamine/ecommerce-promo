import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class DeletePromotionFromCartDto {
    
    @IsNumber()
    @IsNotEmpty()
    cartId: number;
}
