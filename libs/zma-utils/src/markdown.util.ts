import { SecurityUtil } from './security.util';

export class MarkdownUtil {
  static async parse(input: string) {
    // TODO: Implement markdown parsing
    // const parsed = await marked.parse(input);
    return SecurityUtil.sanitize(input);
  }
}
