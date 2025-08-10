import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Pagination } from 'src/common/pagination';

export class UpdateNotificationDto extends Pagination {
  @ApiProperty({
    description: 'The unique identifier of the notification to update',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
