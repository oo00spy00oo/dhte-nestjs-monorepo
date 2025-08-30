import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export class DateUtils {
  static dayjsWrapper(date?: string | Dayjs | Date) {
    return dayjs(date).utc();
  }

  static getYear() {
    return this.dayjsWrapper().year();
  }

  static getDate() {
    return this.dayjsWrapper();
  }

  static getDateAsISOString(date?: string | Dayjs): string {
    return date ? this.dayjsWrapper(date).toISOString() : this.dayjsWrapper().toISOString();
  }

  static convertISOString(date?: string | Dayjs | Date) {
    return this.dayjsWrapper(date).toISOString();
  }

  static gapWeek(day1: string | Date | Dayjs, day2: string | Date | Dayjs) {
    const date1 = this.dayjsWrapper(day1);
    const date2 = this.dayjsWrapper(day2);
    return date2.diff(date1, 'week');
  }

  static isSameDate(date1: string, date2: string): boolean {
    const day1 = this.dayjsWrapper(date1);
    const day2 = this.dayjsWrapper(date2);
    return day1.isSame(day2, 'date');
  }

  static isBefore(date1: string | Date | Dayjs, date2: string | Date | Dayjs): boolean {
    const day1 = this.dayjsWrapper(date1);
    const day2 = this.dayjsWrapper(date2);
    return day1.isBefore(day2, 'day');
  }

  static isSameWeekAndYear(date1: string, date2: string): boolean {
    const day1 = this.dayjsWrapper(date1);
    const day2 = this.dayjsWrapper(date2);

    const isSameWeek = day1.isSame(day2, 'week');
    const isSameYear = day1.isSame(day2, 'year');

    return isSameWeek && isSameYear;
  }

  static addMultipleWeek(date: string | Date | Dayjs, week: number) {
    return this.dayjsWrapper(date).add(week, 'week');
  }

  static addWeek(date: string | Dayjs) {
    return this.dayjsWrapper(date).add(1, 'week');
  }

  static addDay(date: string | Dayjs) {
    return this.dayjsWrapper(date).add(1, 'day');
  }

  static endOfDay(date: string | Dayjs) {
    return this.dayjsWrapper(date).endOf('day');
  }

  static startOfDay(date: string | Dayjs) {
    return this.dayjsWrapper(date).startOf('day');
  }

  static display(date: string | Dayjs | Date) {
    return this.dayjsWrapper(date).format('lll');
  }
}
