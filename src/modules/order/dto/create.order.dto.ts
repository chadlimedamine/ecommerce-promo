import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOrderDto {
    
    
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    cartId: number;
}
