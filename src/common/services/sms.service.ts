import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { Environment } from '../enums';

interface SmsApiResponse {
  isError?: boolean;
  message?: string;
  [key: string]: unknown;
}

@Injectable()
export class SmsService {
  private readonly smsBaseUrl: string;
  private readonly smsUsername: string;
  private readonly smsPassword: string;
  private readonly nodeEnv: string;
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.smsBaseUrl = this.getRequiredConfig('SMS_BASE_URL'); // UPPER_CASE to match .env
    this.smsUsername = this.getRequiredConfig('SMS_USERNAME');
    this.smsPassword = this.config.get<string>('SMS_PASSWORD') || '';
    this.nodeEnv = this.config.get<string>('nodeEnv') || Environment.DEVELOP;
  }

  private getRequiredConfig(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new Error(`Missing required SMS configuration: ${key}`);
    }
    return value;
  }

  public async send(
    phone: string,
    message: string,
  ): Promise<SmsApiResponse | true> {
    try {
      // Skip sending in non-production environments
      if (this.nodeEnv !== Environment.PRODUCTION) {
        this.logger.debug(
          `SMS not sent (non-production environment) to ${phone}`,
        );
        return true;
      }

      // Validate Bangladeshi phone number
      if (!this.isValidBangladeshiNumber(phone)) {
        this.logger.warn(`Invalid Bangladeshi phone number: ${phone}`);
        return true;
      }

      const encodedMessage = encodeURIComponent(message);
      const queryString = `${this.smsBaseUrl}?userId=${
        this.smsUsername
      }&password=${
        this.smsPassword
      }&commaSeperatedReceiverNumbers=${encodeURIComponent(
        phone,
      )}&smsText=${encodedMessage}`;

      const response = await lastValueFrom(
        this.httpService.get<SmsApiResponse>(queryString),
      );

      this.logger.log(
        JSON.stringify({
          data: response.data,
          phone,
          message: encodedMessage,
        }),
        'SMSSendingResponse',
      );

      if (response.data?.isError) {
        if (response.data.message === 'External sms limit exceeded.') {
          return response.data;
        }
        throw new BadRequestException(
          `Failed to send SMS to ${phone}: ${response.data.message}`,
        );
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        `SMS sending failed to ${phone}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        error.response?.data?.message || 'Failed to send SMS',
      );
    }
  }

  private isValidBangladeshiNumber(phone: string): boolean {
    return /^(01|008801|8801|\+8801)[0-9]{9}$/.test(phone);
  }

  public generateOtp(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }
}
