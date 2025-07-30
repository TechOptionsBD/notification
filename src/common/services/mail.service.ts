import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { Environment } from '../enums';

@Injectable()
export class MailService {
  private readonly sendGridApiKey: string;
  private readonly sender: string;
  private readonly nodeEnv: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new Error('SendGrid API key is not configured');
    }

    this.sendGridApiKey = apiKey;
    this.nodeEnv = this.config.get<string>('nodeEnv') || 'development';
    this.sender = 'system@example.com';
    sgMail.setApiKey(this.sendGridApiKey);
  }

  public async send(
    receiver: string | string[],
    subject: string,
    text: string,
  ): Promise<boolean> {
    if (this.nodeEnv !== Environment.PRODUCTION) {
      Logger.log(
        `Mail not sent (non-production environment): ${subject}`,
        'MailService',
      );
      return true;
    }

    try {
      await sgMail.send({
        from: this.sender,
        to: receiver,
        subject: subject,
        html: text,
      });
      Logger.log(`Mail successfully sent: ${subject}`, 'MailService');
      return true;
    } catch (error) {
      Logger.error(
        `Mail sending failed: ${error.message}`,
        error.stack,
        'MailService',
      );
      return false;
    }
  }
}
