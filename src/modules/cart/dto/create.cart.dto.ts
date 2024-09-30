import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCartDto {
    
    @IsNumber()
    @IsNotEmpty()
    userId: number;
}
