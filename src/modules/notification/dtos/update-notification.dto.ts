import { IsNotEmpty, IsString } from 'class-validator';
import { Pagination } from 'src/common/pagination';

export class UpdateNotificationDto extends Pagination {
  @IsString()
  @IsNotEmpty()
  id: string;
}
