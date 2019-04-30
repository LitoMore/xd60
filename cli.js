#!/usr/bin/env node
'use strict';

const path = require('path');
const importLazy = require('import-lazy')(require);

const meow = importLazy('meow');
const ora = importLazy('ora');
const execa = importLazy('execa');
const usb = importLazy('usb');

const spinner = ora('');

const cli = meow(`
  Usage:
    $ kbd reflash
    $ kbd reflash <file>
    $ kbd auto
    $ kbd auto <file>
`);
let firmwarePath = path.join(__dirname, 'XD60.hex');

const reflash = async firmwarePath => {
	try {
		spinner.start();
		spinner.text = 'Erasing';
		await execa('dfu-programmer', ['atmega32u4', 'erase', '--force']);
		spinner.text = 'Flashing';
		await execa('dfu-programmer', ['atmega32u4', 'flash', firmwarePath]);
		spinner.text = 'Reseting';
		usb.removeAllListeners();
		await execa('dfu-programmer', ['atmega32u4', 'reset']);
		spinner.succeed('Done');
	} catch (error) {
		spinner.fail(error.stderr.trim());
		process.exit(1);
	}
};

const auto = firmwarePath => {
	spinner.start();
	spinner.text = 'Waiting for XD60';

	const autoClose = setTimeout(() => {
		usb.removeAllListeners();
		spinner.fail('No device present');
		process.exit(1);
	}, 15000);

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
			reflash(firmwarePath);
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
