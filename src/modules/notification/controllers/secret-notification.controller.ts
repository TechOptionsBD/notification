import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SecretKeyGuard } from 'src/common/guards/secret-key.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { FilterNotificationDto } from '../dtos/filter-notification.dto';
import { UpdateNotificationDto } from '../dtos/update-notification.dto';
import { NotificationResponseDto } from '../serializers/notification.response.dto';
import { NotificationService } from '../services/notification.service';


/**
 * Controller for secret notification endpoints (internal/automated access).
 * Uses SecretKeyGuard for authentication.
 */
@ApiTags('secret-notification')
@ApiHeader({
  name: 'secret-key',
  description: 'Secret key for authentication',
})
@UseGuards(SecretKeyGuard)
@Controller('secret-notification')
export class SecretNotificationController {
  /**
   * Injects NotificationService for notification operations.
   */
  constructor(private notiService: NotificationService) {}

  /**
   * Get all notifications for a specific user (internal/automated access).
   * @param userId User ID to fetch notifications for
   * @param filter Filter and pagination options
   */
  @ApiOperation({ summary: 'Get all notifications for a specific user' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @Serialize(NotificationResponseDto)
  @Get('/user/:userId')
  async getByUser(
    @Param('userId') userId: string,
    @Query() filter: FilterNotificationDto,
  ) {
    // Fetch notifications for the given user
    const [notifications, count, unreadCount] =
      await this.notiService.getNotificationsForUser(userId, filter);
    return {
      message: 'Notification list retrieved successfully.',
      count: count,
      data: { unreadCount: unreadCount, items: notifications },
    };
  }

  /**
   * Update notification status for a specific user (internal/automated access).
   * @param userId User ID to update notifications for
   * @param body Update payload
   */
  @ApiOperation({ summary: 'Update notification status for a user' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @Serialize(NotificationResponseDto)
  @Put('/user/:userId')
  async updateForUser(
    @Param('userId') userId: string,
    @Body() body: UpdateNotificationDto,
  ) {
    // Update notification(s) for the given user
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
