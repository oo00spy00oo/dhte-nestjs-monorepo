import { Readable } from 'stream';

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import NodeClam from 'clamscan';

import { appConfiguration } from '../../configuration';
import { VirusScanOutput } from '../../core/outputs/upload.output';

@Injectable()
export class VirusScannerService implements OnModuleInit, OnModuleDestroy {
  private clam;
  private readonly logger = new Logger(VirusScannerService.name);
  private isInitialized = false;

  private readonly clamdHost: string;
  private readonly clamdPort: number;
  private readonly clamdTimeout: number;

  constructor(private readonly configService: ConfigService) {
    const { clamav } = appConfiguration(this.configService);
    this.clamdHost = clamav.host;
    this.clamdPort = clamav.port;
    this.clamdTimeout = clamav.timeout;
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('🔧 Initializing ClamAV scanner...');
    try {
      await this.initializeClamScan();
    } catch (error) {
      this.logger.error(
        '❌ Failed to initialize ClamAV scanner. Virus scanning will be disabled.',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.clam = null;
    this.isInitialized = false;
    this.logger.log('🧹 ClamAV scanner cleaned up.');
  }

  private async initializeClamScan(): Promise<void> {
    try {
      this.clam = await new NodeClam().init({
        debugMode: false,
        clamdscan: {
          socket: false,
          host: this.clamdHost,
          port: this.clamdPort,
          timeout: this.clamdTimeout,
        },
      });

      const version = await this.clam.getVersion();
      this.logger.log(`✅ ClamAV scanner ready (version: ${version})`);
      this.isInitialized = true;
    } catch (error) {
      this.logger.error(`❌ Failed to initialize ClamAV: ${error.message}`);
      throw error;
    }
  }

  async scanBuffer(buffer: Buffer): Promise<VirusScanOutput> {
    const stream = Readable.from(buffer);
    return this.scanStream(stream);
  }

  async scanStream(stream: Readable): Promise<VirusScanOutput> {
    if (!this.isInitialized || !this.clam) {
      return { isClean: false, error: 'Scanner unavailable' };
    }

    try {
      const result = await this.clam.scanStream(stream);
      if (result.isInfected) {
        return { isClean: false, isInfected: true, viruses: result.viruses };
      }
      return { isClean: true };
    } catch (err) {
      this.logger.error('⚠️ Stream scan error:', err);
      return { isClean: false, error: err.message };
    }
  }

  isScannerReady(): boolean {
    return this.isInitialized;
  }
}
