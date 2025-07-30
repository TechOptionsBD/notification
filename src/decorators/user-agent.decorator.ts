import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { Platform } from 'src/modules/broker/enums';

export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let platform: Platform;
    const request = ctx.switchToHttp().getRequest();
    const ua: string = request.headers['user-agent'];
    if (ua.match(/MSIE|Trident|Firefox|Chrome|Safari|Edge|insomnia/))
      platform = Platform.WEB;
    else if (ua.match(/okhttp/)) platform = Platform.ANDROID;
    else platform = Platform.IOS;
    Logger.log(platform, 'PlatformDetected');
    return platform;
  },
);
