import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { Permissions } from 'src/decorators/permission.decorator';
import { User, UserType } from 'src/decorators/user.decorator';
import { FilterNotificationDto } from '../dtos/filter-notification.dto';
import { NotificationService } from '../services/notification.service';
import { NotificationResponseDto } from '../serializers/notification.response.dto';

@UseGuards(AuthGuard, PermissionsGuard)
@Permissions('Booking', ['admin'])
@Controller('/admin/notification')
@Serialize(NotificationResponseDto)
export class AdminNotificationController {
  constructor(private notiService: NotificationService) {}

  @Get('/')
  async getAll(@Query() filer: FilterNotificationDto, @User() user: UserType) {
    const [notifications, count, unreadCount] =
      await this.notiService.getNotifications(filer, user);
    return {
      message: 'Notification list get successfully.',
      count: count,
      data: { unreadCount: notifications.length, items: notifications },
    };
  }
}
