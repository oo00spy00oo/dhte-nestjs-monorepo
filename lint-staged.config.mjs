import path from 'node:path';

import micromatch from 'micromatch';

export default {
  '{apps,libs,tools}/**/*.{js,ts,jsx,tsx}': (files) => {
    // from `files` filter those _NOT_ matching `*test.js`
    const matchedFiles = micromatch.not(files, '*test.js');
    return [
      `nx affected:lint --fix --files=${matchedFiles.map((file) => path.relative(process.cwd(), file)).join(',')}`,
      `nx format:write --files=${matchedFiles.map((file) => path.relative(process.cwd(), file)).join(',')}`,
    ];
  },
  'package.json': ['prettier --write'],
  '*.md': ['prettier --write'],
  '**/*.gql': ['prettier --write'],
};
