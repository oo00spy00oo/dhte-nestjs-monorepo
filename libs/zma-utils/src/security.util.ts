import * as DOMPurify from 'isomorphic-dompurify';

export class SecurityUtil {
  static sanitize(input: string) {
    return DOMPurify.sanitize(input);
  }
}
