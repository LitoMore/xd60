#!/usr/bin/env node
'use strict'

const path = require('path')
const meow = require('meow')
const ora = require('ora')
const execa = require('execa')

const spinner = ora('Reflashing')

const cli = meow(`
  Usage:
    $ xd60 reflash
    $ xd60 reflash <file>
`)
let firmwarePath = path.join(__dirname, 'XD60.hex')

const reflash = async firmwarePath => {
  try {
    spinner.start()
    spinner.text = 'Erasing'
    await execa('dfu-programmer', ['atmega32u4', 'erase', '--force'])
    spinner.text = 'Flashing'
    await execa('dfu-programmer', ['atmega32u4', 'flash', firmwarePath])
    spinner.text = 'Reseting'
    await execa('dfu-programmer', ['atmega32u4', 'reset'])
    spinner.succeed('Done')
  } catch (err) {
    spinner.fail(err.stderr.trim())
  }
}

if (cli.input.length > 0) {
  const command = cli.input[0]
  switch (command) {
    case 'reflash':
      if (cli.input[1]) firmwarePath = cli.input[1]
      reflash(firmwarePath)
      break
    default:
      spinner.fail('Invalid command')
      break
  }
} else {
  pinner.fail('Command required')
}
