import { createId } from '@paralleldrive/cuid2';
import * as _ from 'lodash';
import { uuidv7 } from 'uuidv7';

export class IdUtils {
  static generateUserId() {
    let id = '1';
    for (let i = 0; i < 11; i++) {
      id += Math.floor(Math.random() * 10).toString();
    }
    return Number(id);
  }

  static generateId() {
    return _.random(1000000000, 1999999999);
  }

  static cuid() {
    return createId();
  }

  static uuidv7() {
    return uuidv7();
  }

  static extractTimestampFromUUIDv7(uuid: string): Date {
    // split the UUID into its components
    const parts = uuid.split('-');

    // the second part of the UUID contains the high bits of the timestamp (48 bits in total)
    const highBitsHex = parts[0] + parts[1].slice(0, 4);

    // convert the high bits from hex to decimal
    // the UUID v7 timestamp is the number of milliseconds since Unix epoch (January 1, 1970)
    const timestampInMilliseconds = parseInt(highBitsHex, 16);

    // convert the timestamp to a Date object
    const date = new Date(timestampInMilliseconds);

    return date;
  }
}
