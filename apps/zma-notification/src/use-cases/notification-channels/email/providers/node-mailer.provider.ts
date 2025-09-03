import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NodeMailerProvider {
  private readonly logger = new Logger(NodeMailerProvider.name);
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail({
    to,
    subject,
    body,
  }: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      html: body,
    });
    this.logger.log(`Email sent to ${to}`);
  }
}
