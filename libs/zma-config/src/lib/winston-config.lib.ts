import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfigTransports = ({
  nodeEnv,
  serviceName,
}: {
  nodeEnv: string;
  serviceName: string;
}) => {
  const transports = [];
  if (nodeEnv !== 'development') {
    transports.push(
      new winston.transports.Console({
        level: process.env['LOG_LEVEL'] || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
    );
  } else {
    transports.push(
      new winston.transports.Console({
        level: process.env['LOG_LEVEL'] || 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike(serviceName, {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
    );
  }

  return transports;
};
