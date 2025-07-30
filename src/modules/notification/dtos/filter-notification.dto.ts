import { IsBoolean, IsOptional } from 'class-validator';
import { Pagination } from 'src/common/pagination';

export class FilterNotificationDto extends Pagination {
  @IsBoolean()
  @IsOptional()
  isRead: boolean;
}
