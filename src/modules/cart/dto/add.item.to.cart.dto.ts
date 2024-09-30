import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddItemToCartDto {
    
    @IsNumber()
    @IsNotEmpty()
    productId: number;
}
