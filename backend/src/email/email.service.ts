import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
  }

  async sendWelcomeEmail(to: string, name?: string) {
    await this.resend.emails.send({
      from: this.config.get<string>('EMAIL_FROM', 'onboarding@resend.dev'),
      to,
      subject: 'Bienvenue sur la marketplace !',
      html: `<p>Bonjour ${name ?? ''},</p><p>Merci de vous être inscrit(e) sur notre marketplace. Votre compte est prêt, vous pouvez dès à présent parcourir les produits ou commencer à vendre.</p>`,
    });
  }

  async sendDigitalDelivery(
    to: string,
    productTitle: string,
    downloadUrl: string,
  ) {
    await this.resend.emails.send({
      from: this.config.get<string>('EMAIL_FROM', 'onboarding@resend.dev'),
      to,
      subject: `Votre achat est prêt : ${productTitle}`,
      html: `<p>Merci pour votre achat !</p><p>Voici votre lien de téléchargement pour <strong>${productTitle}</strong> :</p><p><a href="${downloadUrl}">${downloadUrl}</a></p>`,
    });
  }
}