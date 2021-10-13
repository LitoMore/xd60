# XD60

Configs and tools for my XD60 (atmega32u4) keyboard

## Requirement

- [dfu-programmer](https://github.com/dfu-programmer/dfu-programmer)

## Install

```bash
git clone git@github.com:LitoMore/xd60.git
cd xd60
npm i
npm run build
npm link
```

## Commands

### Reflash immediately

```sh
xd60 reflash [file]
```

### Reflash when device is ready

```sh
xd60 auto [file]
```

## License

MIT
