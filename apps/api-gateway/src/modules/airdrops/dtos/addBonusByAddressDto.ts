import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddBonusByAddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  amount: string;
}

export class AddBonusByAddressHeaderDto {
  @IsString()
  @IsNotEmpty()
  @Expose({
    name: 'x-signature',
  })
  signature: string;
}
