# Atia's Shrine Automation

Automated Atia's Blessing, runs every day automatically.

![blessing](https://github.com/dwi/atia-shrine-automated/assets/1337260/feda58fc-4829-4684-9b40-dac8735dbc05)


> **Warning**
> **Run it locally and preferably on an encrypted volume, your private keys can be exposed!**

## Prerequisites
- Node.js 18+
- pnpm (or Yarn/NPM)

## Installation
- Install dependencies
```bash
pnpm i
```
- Copy example privateKeys file and add your keys in
```bash
cp privateKeys.example privateKeys
```
- Start Application
```bash
pnpm start
```
The application will be launched by [Nodemon](https://nodemon.com) so it's will restart automatically on file change
