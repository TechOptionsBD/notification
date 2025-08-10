import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Pagination } from 'src/common/pagination';

export class FilterNotificationDto extends Pagination {
  @ApiProperty({
    description: 'Filter notifications by read status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRead: boolean;
}
