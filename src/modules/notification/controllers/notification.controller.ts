import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { User, UserType } from 'src/decorators/user.decorator';
import { FilterNotificationDto } from '../dtos/filter-notification.dto';
import { UpdateNotificationDto } from '../dtos/update-notification.dto';
import { NotificationService } from '../services/notification.service';
import { NotificationResponseDto } from '../serializers/notification.response.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('notification')
@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notiService: NotificationService) {}

  @ApiOperation({ summary: 'Get all notifications for user' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  @Serialize(NotificationResponseDto)
  @Get('/')
  async getAll(@Query() filer: FilterNotificationDto, @User() user: UserType) {
    const [notifications, count, unreadCount] =
      await this.notiService.getNotifications(filer, user);
    return {
      message: 'Notification list get successfully.',
      count: count,
      data: { unreadCount: unreadCount, items: notifications },
    };
  }

  @ApiOperation({ summary: 'Update notification status' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  @Serialize(UpdateNotificationDto)
  @Put('/')
  async updateNotification(
    @Body() body: UpdateNotificationDto,
    @User() user: UserType,
  ) {
    const notifications = await this.notiService.updateNotification(body, user);
    return {
      message: 'Notification updated successfully.',
      data: notifications,
    };
  }
}
