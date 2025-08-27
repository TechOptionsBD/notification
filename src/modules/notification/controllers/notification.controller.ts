import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { User, UserType } from 'src/decorators/user.decorator';
import { FilterNotificationDto } from '../dtos/filter-notification.dto';
import { UpdateNotificationDto } from '../dtos/update-notification.dto';
import { NotificationResponseDto } from '../serializers/notification.response.dto';
import { NotificationService } from '../services/notification.service';


/**
 * Controller for user notification endpoints.
 * Handles fetching and updating notifications for authenticated users.
 */
@ApiTags('notification')
@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  /**
   * Injects NotificationService for notification operations.
   */
  constructor(private notiService: NotificationService) {}


  /**
   * Get all notifications for the authenticated user.
   * @param filer Filter and pagination options
   * @param user Current user (injected)
   */
  @ApiOperation({ summary: 'Get all notifications for user' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  @Serialize(NotificationResponseDto)
  @Get('/')
  async getAll(@Query() filer: FilterNotificationDto, @User() user: UserType) {
    // Fetch notifications, total count, and unread count
    const [notifications, count, unreadCount] =
      await this.notiService.getNotifications(filer, user);
    return {
      message: 'Notification list get successfully.',
      count: count,
      data: { unreadCount: unreadCount, items: notifications },
    };
  }

  /**
   * Update notification status (mark as read, etc.) for the authenticated user.
   * @param body Update payload
   * @param user Current user (injected)
   */
  @ApiOperation({ summary: 'Update notification status' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  @Serialize(UpdateNotificationDto)
  @Put('/')
  async updateNotification(
    @Body() body: UpdateNotificationDto,
    @User() user: UserType,
  ) {
    // Update notification(s) for the user
    const notifications = await this.notiService.updateNotification(body, user);
    return {
      message: 'Notification updated successfully.',
      data: notifications,
    };
  }
}
