#!/usr/bin/env node
/* eslint @typescript-eslint/no-unsafe-call: off, @typescript-eslint/no-unsafe-member-access: off, @typescript-eslint/no-implicit-any-catch: off */
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';
import meow from 'meow';
import ora from 'ora';
import execa from 'execa';
import usb from 'usb';

const __dirname = dirname(fileURLToPath(import.meta.url));
const spinner = ora('');

const cli = meow(
	`
  Usage:
    $ kbd reflash
    $ kbd reflash <file>
    $ kbd auto
    $ kbd auto <file>
`,
	{
		importMeta: import.meta,
	},
);

let firmwarePath = join(__dirname, '../keymaps', 'mac.hex');

const reflash = async (firmwarePath: string) => {
	try {
		spinner.start();
		spinner.text = 'Erasing';
		await execa('dfu-programmer', ['atmega32u4', 'erase', '--force']);
		spinner.text = 'Flashing';
		await execa('dfu-programmer', ['atmega32u4', 'flash', firmwarePath]);
		spinner.text = 'Reseting';
		// @ts-expect-error: Expected call
		usb.removeAllListeners();
		await execa('dfu-programmer', ['atmega32u4', 'reset']);
		spinner.succeed('Done');
	} catch (error: any) {
		spinner.fail(error.stderr.trim() || error.message);
		process.exit(1);
	}
};

const auto = (firmwarePath: string) => {
	spinner.start();
	spinner.text = 'Waiting for XD60';

	const autoClose = setTimeout(() => {
		// @ts-expect-error: Expected call
		usb.removeAllListeners();
		spinner.fail('No device present');
		process.exit(1);
	}, 15_000);

	usb.on('attach', async () => {
		await execa('dfu-programmer', ['atmega32u4', 'get']);
		clearTimeout(autoClose);
		await reflash(firmwarePath);
	});
};

if (cli.input.length > 0) {
	const command = cli.input[0];

	if (cli.input[1]) {
		firmwarePath = cli.input[1];
	}

	switch (command) {
		case 'reflash':
			await reflash(firmwarePath);
			break;
		case 'auto':
			auto(firmwarePath);
			break;
		default:
			spinner.fail('Invalid command');
			process.exit(1);
	}
} else {
	cli.showHelp();
	process.exit(1);
}
