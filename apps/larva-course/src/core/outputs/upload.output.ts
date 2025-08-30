import { IsBoolean, IsString } from 'class-validator';

export class UploadOutput {
  @IsString()
  key: string;

  @IsString()
  url?: string;
}

export class VirusScanOutput {
  @IsBoolean()
  isClean: boolean;

  @IsBoolean()
  isInfected?: boolean; // True if a virus was found

  @IsString({ each: true })
  viruses?: string[]; // List of detected viruses

  @IsString()
  error?: string; // Error message if the scan itself failed
}
