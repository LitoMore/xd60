#!/usr/bin/env node
'use strict'

const path = require('path')
const meow = require('meow')
const ora = require('ora')
const execa = require('execa')
const usb = require('usb')

const spinner = ora('')

const cli = meow(`
  Usage:
    $ kbd reflash
    $ kbd reflash <file>
    $ kbd auto
    $ kbd auto <file>
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

const auto = firmwarePath => {
  spinner.start()
  spinner.text = 'Waiting for XD60'

  const autoClose = setTimeout(() => {
    usb.removeAllListeners()
    spinner.fail('No device present')
  }, 15000)

  usb.on('attach', () => {
    execa('dfu-programmer', ['atmega32u4', 'get']).then(async () => {
      clearTimeout(autoClose)
      await reflash(firmwarePath)
      usb.removeAllListeners()
    })
  })
}

if (cli.input.length > 0) {
  const command = cli.input[0]

  if (cli.input[1]) firmwarePath = cli.input[1]

  switch (command) {
    case 'reflash':
      reflash(firmwarePath)
      break
    case 'auto':
      auto(firmwarePath)
      break
    default:
      spinner.fail('Invalid command')
      break
  }
} else {
  cli.showHelp()
}
