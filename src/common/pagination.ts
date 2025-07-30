import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class Pagination {
  @IsOptional()
  @IsPositive()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  limit: number = 10;
}
