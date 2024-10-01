import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCartDto {
    
    
    @IsInt()
    @Type(() => Number)
    @IsNotEmpty()
    userId: number;
}
