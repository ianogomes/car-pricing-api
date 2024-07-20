import {
  IsEmail,
  IsString,
  IsOptional /*This is the important addition*/,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;
}
