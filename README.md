## Setup

### Requirements

1\. Install LTS version of [Node.js](https://nodejs.org). An easy way to do so is by using [nvm](https://github.com/nvm-sh/nvm).

   ```sh
   $ nvm install --lts
   ```

2\. Install Python 3 and ensure pip is properly set up by adding _pip user base binary directory_ to `$PATH`.

   **macOS**

   a. Install [Homebrew](https://brew.sh/).
   b. Run following command to ensure everything is up to date. Xcode version 10.3 or most recent stable version is required.
      ```sh
      $ brew doctor
      ```
   c. Run following command to install Python. Version 3.9 is required at latest.
      ```sh
      $ brew install python libyaml
      ```
   d. Run following command to add _pip user base binary directory_ to `$PATH`.
      ```sh
      $ echo "export PATH=\"$(python -m site --user-base)/bin\":\$PATH" >> ~/.bash_profile
      ```
   e. Run following command for changes to take effect.
      ```sh
      $ source ~/.bash_profile
      ```

   **Linux** (Debian-based)

   a. Run following command to add _pip user base binary directory_ to `$PATH`.
      ```sh
      $ echo "export PATH=\"$(python -m site --user-base)/bin\":\$PATH" >> ~/.bashrc
      ```
   b. Run following command for changes to take effect.
      ```sh
      $ source ~/.bashrc
      ```
   c. Run following command to use a faster YAML parser.
      ```sh
      $ sudo apt install -y python-yaml libyaml-dev
      ```

3\. Install [Grow](http://grow.io), static site generator used to build amp.dev. Do so by using `pip` instead of its installer. Using `pip` will enable importing from `grow` package in Python later on.

**Note**: Be sure to use `pip` command associated with Python 3 as Grow 1 depends on Python 3.

**Mac**

```sh
  LDFLAGS="-L$(brew --prefix)/lib" CFLAGS="-I$(brew --prefix)/include" pip3 install --global-option="--with-libyaml" --force pyyaml
  pip3 install --user grow
```

**Linux**

```sh
 $ pip3 install --global-option="--with-libyaml" --force pyyaml
 $ pip3 install --user grow
```

### Fork & clone the repository

Fork repository. Then clone repository:

```sh
$ git clone https://github.com/YOUR-USERNAME/amp.dev
```

... and then install dependencies via NPM:

```sh
$ cd amp.dev
$ npm install
```

## Develop

Bootstrap local environment. To do so, make sure you have a valid [GitHub access token](https://github.com/settings/tokens) in an environment variable named `AMP_DOC_TOKEN` like so:

```sh
$ export AMP_DOC_TOKEN="c59f6..."
```

This command enables import from GitHub to run flawlessly. Actual import occurs by running following command, which also will build Playground and Boilerplate Generator once.

```sh
$ npm run bootstrap
```

**Tip**: Due to bad network conditions or GitHub's API rate-limiting there might be errors during import. Try running above command with `-- --queue-imports` flag to prevent them.

You then can start developing in your local environment with command below. The task will take care of building and copying all files, watching them for changes, and rebuilding them when needed. Changes to [Express](https://expressjs.com/) backend require Gulp task to be restarted.

```sh
$ npm run develop
```

This command prints a lot to shell and will most likely end on `Server ready. Press ctrl-c to quit.`. Seeing this line means everything went fine so far unless otherwise stated in logs; site should be available at [http://localhost:8080/](http://localhost:8080/). The service running on port `8081` is only Grow rendering pages.

## Maintenance

### Documents

Made changes to a lot of Grow documents at once and not quite sure if all references are still valid? Run `npm run lint:grow` to pick up broken ones.

### Run a test build

To run a local test build that does minifying and vends static pages instead of proxying them through to Grow you run:

```sh
$ npm run build:local
$ npm run start:local
```

**Tip**: For more rapid local testing, it may be preferable to only build a subset of specified locales. Run following command with `--locales` being a comma seperated list of locale abbreviations you want to build, e.g. `en,fr` or even just `en`.

```sh
npm run build:local -- --locales <list of locales>
```

## Build

**Caution**: starting a build will automatically clean all locations of possible remainings from previous builds. Make sure you don't have anything there that you want to keep - additionally check your working copy for eventual unintended local changes.

```sh
npm run build:local -- --locales <list of locales>
```

To perform a build run following command with `--env` being one of following valid environments: `development`, `local`, `staging` or `production`:

```sh
$ npx gulp build --env <environment>
```

## Deployment

Site uses GitHub Actions for automated deployments to both staging and production environments.

### Deployment Environments

- **Staging**: [staging-amp-dev.netlify.app](https://staging-amp-dev.netlify.app/)
- **Production**: [amp.dev](https://amp.dev/)

### How to Deploy

Deployments are triggered through GitHub Actions workflows:

1\. **Staging Deployment**: 
   - Triggered automatically on pushes to `main` branch
   - Automatically builds and deploys to staging environment

2\. **Production Deployment**:
   - **Manual deployment only** - no automatic triggers
   - Must be manually triggered through GitHub Actions

### Manual Deployment

To manually trigger a deployment (required for production):

1. Navigate to [deploy workflow](https://github.com/ampproject/amp.dev/actions/workflows/deploy.yaml) in GitHub actions tab.
2. Click "Run workflow" and choose branch you want to deploy
3. Confirm deployment

**Note**: Ensure your changes have been properly tested in staging environment before deploying to production.
# amp.dev.22
