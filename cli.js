#!/usr/bin/env node
'use strict'

const path = require('path')
const meow = require('meow')
const ora = require('ora')
const execa = require('execa')

const spinner = ora('Reflashing').start()

const cli = meow()
let firmwarePath = path.join(__dirname, 'XD60.hex')

if (cli.input.length > 0) {
  firmwarePath = cli.input[0]
}

const run = async () => {
  spinner.text = 'Erasing'
  await execa('dfu-programmer', ['atmega32u4', 'erase', '--force'])
  spinner.text = 'Flashing'
  await execa('dfu-programmer', ['atmega32u4', 'flash', firmwarePath])
  spinner.text = 'Reseting'
  await execa('dfu-programmer', ['atmega32u4', 'reset'])
  spinner.succeed('Done')
}

run()
