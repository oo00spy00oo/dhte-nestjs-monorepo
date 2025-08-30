import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mediasoup from 'mediasoup';

import { appConfiguration } from '../../configuration';
import { MediaSoupServiceGetListenIpsOutput } from '../../core/outputs';

@Injectable()
export class MediasoupService implements OnModuleInit {
  private readonly logger = new Logger(MediasoupService.name);

  private worker!: mediasoup.types.Worker;
  private router!: mediasoup.types.Router;

  constructor(
    private readonly configService: ConfigService,
    @Inject('APP_CONFIG') private readonly appConfig: ReturnType<typeof appConfiguration>,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Mediasoup worker...');

    const rtcMinPort = this.appConfig.mediasoup.rtc.minPort;
    const rtcMaxPort = this.appConfig.mediasoup.rtc.maxPort;

    this.worker = await mediasoup.createWorker({ rtcMinPort, rtcMaxPort });

    this.worker.on('died', () => {
      this.logger.error('❌ Mediasoup worker died!');
      process.exit(1);
    });

    this.router = await this.worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f', // baseline, compatible
            'level-asymmetry-allowed': 1,
          },
        },
      ],
    });

    this.logger.log(`✅ Worker & Router ready. RTP ports: ${rtcMinPort}-${rtcMaxPort}`);
  }

  getWorker() {
    return this.worker;
  }

  getRouter() {
    return this.router;
  }

  /**
   * Returns the listenIps configuration for creating WebRtcTransport.
   * In production, MEDIASOUP_ANNOUNCED_IP (public IP or domain IP) MUST be set.
   */
  getListenIps(): MediaSoupServiceGetListenIpsOutput[] {
    const announcedIp = this.appConfig.mediasoup.announcedIp;
    if (this.configService.get<string>('NODE_ENV') !== 'development' && !announcedIp) {
      // Fallback to 127.0.0.1 is not allowed in production
      throw new Error('MEDIASOUP_ANNOUNCED_IP is required in production');
    }
    // Use 0.0.0.0 for binding; announcedIp is the public IP sent to peers via ICE
    return [{ ip: '0.0.0.0', announcedIp }];
  }
}
