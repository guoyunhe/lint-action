# @guoyunhe/lint-action

Unified ESLint + Prettier action to compose lint and format commands

## Install

```bash
npm i @guoyunhe/lint-action
```

## Usage

Usually used with `commander` to make CLI tools:

```ts
#!/usr/bin/env node

import { Command } from 'commander';
import { lint } from '@guoyunhe/lint-action';

const program = new Command('my-scripts');

program
  .command('lint')
  .description('Check lint problems with ESLint')
  .option('--fix', 'Fix lint problems automatically')
  .action(lint);

program
  .command('format')
  .description('Format source code with Prettier and fix ESLint issues')
  .action(() => lint({ fix: true }));
```
