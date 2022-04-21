/* eslint
	unicorn/no-process-exit: off,
	@typescript-eslint/no-implicit-any-catch: off
*/
import process from 'node:process';
import {Ora} from 'ora';
import {execa, ExecaError} from 'execa';
import usb from 'usb';

export type ReflashFunc = (spinner: Ora, firmwarePath: string) => Promise<void>;
export type AutoReflashFunc = (spinner: Ora, firmwarePath: string) => void;

export const reflash: ReflashFunc = async (spinner, firmwarePath) => {
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
	} catch (error: any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const execaError: ExecaError = error;
		spinner.fail(execaError.stderr.trim() || execaError.message);
		process.exit(1);
	}
};

export const autoReflash: AutoReflashFunc = (spinner, firmwarePath) => {
	spinner.start();
	spinner.text = 'Waiting for XD60';

	const autoClose = setTimeout(() => {
		usb.removeAllListeners();
		spinner.fail('No device present');
		process.exit(1);
	}, 15_000);

	usb.on('attach', async () => {
		await execa('dfu-programmer', ['atmega32u4', 'get']);
		clearTimeout(autoClose);
		await reflash(spinner, firmwarePath);
	});
};
