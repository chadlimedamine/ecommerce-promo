import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddItemToCartDto {
    
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    productId: number;
}
