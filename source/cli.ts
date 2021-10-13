#!/usr/bin/env node
import process from 'node:process';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import meow from 'meow';
import ora from 'ora';
import {reflash, autoReflash} from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const spinner = ora('');

let firmwarePath = join(__dirname, '../keymaps', 'mac.hex');

const cli = meow(
	`
  Usage:
    $ xd60 reflash
    $ xd60 reflash <file>
    $ xd60 auto
    $ xd60 auto <file>
`,
	{
		importMeta: import.meta,
	},
);

if (cli.input.length > 0) {
	const command = cli.input[0];

	if (cli.input[1]) {
		firmwarePath = cli.input[1];
	}

	switch (command) {
		case 'reflash':
			await reflash(spinner, firmwarePath);
			break;
		case 'auto':
			autoReflash(spinner, firmwarePath);
			break;
		default:
			spinner.fail('Invalid command');
			process.exit(1);
	}
} else {
	cli.showHelp();
	process.exit(1);
}
