# Atia's Shrine Automation

Automated Atia's Blessing, runs every day automatically.

![blessing](https://github.com/dwi/atia-shrine-automated/assets/1337260/feda58fc-4829-4684-9b40-dac8735dbc05)

> **Warning** > **Run it locally and preferably on an encrypted volume, your private keys can be exposed!**

## Prerequisites

- Node.js 20+
- pnpm (or Yarn/NPM)

## Installation

### Install dependencies

```bash
pnpm i
```

### Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Moralis API key. You can get one from [Moralis](https://admin.moralis.com/login) by:
1. Creating an account
2. Creating a new API key in your dashboard
3. Copying the API key to your `.env` file

### Copy example privateKeys

```bash
cp privateKeys.example privateKeys
```

### Edit `privateKeys` and add your keys and optional delegatees

Example #1:

> [!NOTE]
> Use `prayerPrivateKey` to pray for selected delegatees (max 5). If you want to pray for the PK address as well, you have to include it in the list.

```json
{
  "prayerPrivateKey": "0x9165004be40eb157edf922afe9decec26cc930d208877b547dba58039a786e1a",
  "delegateeAddresses": ["0x40ae3EfE4bE1Bb0402c075C0E42902Ba5B930682", "0x021E95f0043c4E94dd39a5cB008CF2aF2Ca187Cf"]
}
```

Example #2:

> [!NOTE]
> Use `prayerPrivateKey` to pray for itself, you don't have to specify `delegateeAddresses`

```json
{
  "prayerPrivateKey": "0x9165004be40eb157edf922afe9decec26cc930d208877b547dba58039a786e13"
}
```

### Start Application

```bash
pnpm start
```

The application will be launched by [Nodemon](https://nodemon.com) so it's will restart automatically on file change
