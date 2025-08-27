import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { User, UserType } from 'src/decorators/user.decorator';
import { FilterNotificationDto } from '../dtos/filter-notification.dto';
import { NotificationResponseDto } from '../serializers/notification.response.dto';
import { NotificationService } from '../services/notification.service';


/**
 * Controller for admin notification endpoints.
 * Handles fetching notifications for admin users.
 */
@UseGuards(AuthGuard, PermissionsGuard)
// @Permissions('auth', ['admin'])
@Controller('/admin/notification')
export class AdminNotificationController {
  /**
   * Injects NotificationService for notification operations.
   */
  constructor(private notiService: NotificationService) {}

  /**
   * Get all notifications for admin users.
   * @param filer Filter and pagination options
   * @param user Current user (admin, injected)
   */
  @ApiOperation({ summary: 'Get all notifications for admin' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  @Serialize(NotificationResponseDto)
  @Get('/')
  async getAll(@Query() filer: FilterNotificationDto, @User() user: UserType) {
    // Fetch notifications for admin
    const [notifications, count, unreadCount] =
      await this.notiService.getNotifications(filer, user);
    return {
      message: 'Notification list get successfully.',
      count: count,
      data: { unreadCount: notifications.length, items: notifications },
    };
  }
}
