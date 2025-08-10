import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SecretKeyGuard } from 'src/common/guards/secret-key.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { FilterNotificationDto } from '../dtos/filter-notification.dto';
import { UpdateNotificationDto } from '../dtos/update-notification.dto';
import { NotificationService } from '../services/notification.service';
import { NotificationResponseDto } from '../serializers/notification.response.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';

@ApiTags('notification')
@ApiHeader({
  name: 'secret-key',
  description: 'Secret key for authentication',
})
@UseGuards(SecretKeyGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notiService: NotificationService) {}

  @ApiOperation({ summary: 'Get all notifications for a specific user' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @Serialize(NotificationResponseDto)
  @Get('/user/:userId')
  async getByUser(
    @Param('userId') userId: string,
    @Query() filter: FilterNotificationDto,
  ) {
    const [notifications, count, unreadCount] =
      await this.notiService.getNotificationsForUser(userId, filter);
    return {
      message: 'Notification list retrieved successfully.',
      count: count,
      data: { unreadCount: unreadCount, items: notifications },
    };
  }

  @ApiOperation({ summary: 'Update notification status for a user' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @Serialize(NotificationResponseDto)
  @Put('/user/:userId')
  async updateForUser(
    @Param('userId') userId: string,
    @Body() body: UpdateNotificationDto,
  ) {
    const notifications = await this.notiService.updateNotificationForUser(
      userId,
      body,
    );
    return {
      message: 'Notification updated successfully.',
      data: notifications,
    };
  }
}
