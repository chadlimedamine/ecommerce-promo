import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOrderDto {
    
    @IsNumber()
    @IsNotEmpty()
    cartId: number;
}
