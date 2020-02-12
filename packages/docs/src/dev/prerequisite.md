# Prerequisites

## OS

- MacOS 10.12+
- Ubuntu 16.04+
- Windows is not fully supported

## Tools

### 1. brew <Badge type="tip" text="macOS"/>

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

References: [https://brew.sh/](https://brew.sh/)

### 2. zsh <Badge type="tip" text="macOS" /> <Badge type="tip" text="Linux" />

#### Install and set up zsh as default

If necessary, follow these steps to install Zsh:

1. There are two main ways to install Zsh

- with the package manager of your choice, _e.g._ `sudo apt-get install zsh` (see [below for more examples](#how-to-install-zsh-in-many-platforms))
- from [source](http://zsh.sourceforge.net/Arc/source.html), following
  [instructions from the Zsh FAQ](http://zsh.sourceforge.net/FAQ/zshfaq01.html#l7)

2. Verify installation by running `zsh --version`. Expected result: `zsh 5.1.1` or more recent.
3. Make it your default shell: `chsh -s $(which zsh)`

- Note that this will not work if Zsh is not in your authorized shells list (`/etc/shells`)
  or if you don't have permission to use `chsh`. If that's the case [you'll need to use a different procedure](https://www.google.com/search?q=zsh+default+without+chsh).

4. Log out and login back again to use your new default shell.
5. Test that it worked with `echo $SHELL`. Expected result: `/bin/zsh` or similar.
6. Test with `$SHELL --version`. Expected result: 'zsh 5.1.1' or similar

#### How to install zsh in many platforms

##### macOS

**Try `zsh --version` before installing it from Homebrew. If it's newer than 4.3.9
you _might_ be OK. Preferably newer than or equal to `5.0`.**

```sh
brew install zsh zsh-completions
```

Assuming you have [Homebrew](http://brew.sh/) installed. If not, most versions of
**macOS** ship zsh by default, but it's normally an older version. Alternatively, you may
also use [MacPorts](https://www.macports.org/)

```sh
sudo port install zsh zsh-completions
```

##### Ubuntu, Debian & derivatives

```sh
apt install zsh
```

If you don't have `apt`, the recommended package manager for end users
[ [1] ](http://askubuntu.com/a/446484)
[ [2] ](http://askubuntu.com/a/775264)
[ [3] ](https://help.ubuntu.com/lts/serverguide/apt.html)
[ [4] ](http://www.howtogeek.com/234583/simplify-command-line-package-management-with-apt-instead-of-apt-get/)
, you can try `apt-get` or `aptitude`.

[Other distributions that apply](https://en.wikipedia.org/wiki/List_of_Linux_distributions#Debian-based) include:
Linux Mint, elementary OS, Zorin OS, Raspbian, MX Linux, Deepin.

### 3. oh-my-zsh <Badge type="tip" text="macOS" /> <Badge type="tip" text="Linux" />

Oh-My-Zsh is a framework for [Zsh](http://www.zsh.org), the Z shell.

- In order for Oh-My-Zsh to work, Zsh must be installed.
  - Please run `zsh --version` to confirm.
  - Expected result: `zsh 5.1.1` or more recent
- Additionally, Zsh should be set as your default shell.
  - Please run `echo $SHELL` from a new terminal to confirm.
  - Expected result: `usr/bin/zsh` or similar

#### Basic Installation

##### via curl

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

##### via wget

```bash
sh -c "$(wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
```

References: [https://github.com/robbyrussell/oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)

### 4. NodeJS 10 LTS <Badge type="tip" text="macOS" /> <Badge type="tip" text="Linux" />

#### macOS

Update `brew` before installing

```bash
brew update
```

Install NodeJS v10

```bash
brew install node@10
```

Check version

```bash
node -v
```

The result should be

```
v10.13.0
```

#### Linux (Ubuntu)

First, make sure you have curl installed:

```bash
sudo apt install curl
```

Then download and execute the Node.js 10.x installer:

```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
```

This shouldn’t take too long and will add a source file for the official Node.js 10.x repo, grabs the signing key and will run apt update.

Note, if you have used the installer script for an older version of Node.js, running the aforementioned will write over the previous changes.

Once the installer is done doing it’s thing, you will need to install (or upgrade) Node.js:

```bash
sudo apt install nodejs
```

That’ll do it, you’re all set with the latest and greatest version of Node.js 10.x on Ubuntu 18.04 LTS!

### 5. VSCode

#### Download

Download from here [https://code.visualstudio.com/](https://code.visualstudio.com/)

#### Extension

1. prettier
2. tslint
3.

#### User Configurations

- Please install flowing extensions in `VSCode` (_optional_)

```sh
# Code convention
code --install-extension~ dbaeumer.vscode-eslint
code --install-extension~ eg2.tslint
code --install-extension~ esbenp.prettier-vscode
code --install-extension~ codezombiech.gitignore
code --install-extension~ eamodio.gitlens
code --install-extension~ aaron-bond.better-comments
code --install-extension~ formulahendry.auto-close-tag
code --install-extension~ formulahendry.auto-rename-tag
code --install-extension~ DavidAnson.vscode-markdownlint
code --install-extension~ joelday.docthis
code --install-extension~ robinbentley.sass-indented
code --install-extension~ mikestead.dotenv
code --install-extension~ octref.vetur
code --install-extension~ CoenraadS.bracket-pair-colorizer

# Tools
code --install-extension~ ChakrounAnas.turbo-console-log
code --install-extension~ christian-kohler.npm-intellisense
code --install-extension~ christian-kohler.path-intellisense
code --install-extension~ DavidAnson.vscode-markdownlint
code --install-extension~ kumar-harsh.graphql-for-vscode
code --install-extension~ msjsdiag.debugger-for-chrome
```

- User settings

Steps:

- Open user settings json file
- Copy & Paste follow config

```json
{
  // Editor Tweak
  "files.eol": "\n",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.renderWhitespace": "none",

  // Eslint
  "eslint.autoFixOnSave": true,

  // TS lint
  "tslint.autoFixOnSave": true,

  // Prettier
  "prettier.printWidth": 120,
  "prettier.singleQuote": true,
  "prettier.trailingComma": "all",
  "prettier.eslintIntegration": true,

  // Git Lens
  "gitlens.advanced.messages": {
    "suppressShowKeyBindingsNotice": true
  },
  "gitlens.hovers.enabled": false,
  "gitlens.codeLens.enabled": false,
  "gitlens.statusBar.enabled": false,
  "gitlens.currentLine.enabled": false,
  "gitlens.blame.heatmap.enabled": false,
  "gitlens.mode.statusBar.enabled": false,
  "gitlens.blame.highlight.enabled": false,
  "gitlens.hovers.currentLine.over": "line",

  // Vetur
  "vetur.format.defaultFormatter.ts": "prettier",
  "vetur.format.defaultFormatter.js": "prettier",
  "vetur.format.defaultFormatter.css": "prettier",
  "vetur.format.defaultFormatter.less": "prettier",
  "vetur.format.defaultFormatter.scss": "prettier",
  "vetur.format.defaultFormatter.postcss": "prettier",
  "vetur.format.defaultFormatter.stylus": "stylus-supremacy"
}
```

#### for <Badge type="tip" text="Windows"/> add more

```json
{
  // Batch link
  "terminal.integrated.shell.windows": "C:\\Windows\\System32\\bash.exe",
  "terminal.integrated.shellArgs.windows": ["-c", "zsh"],
  "git.path": "/usr/bin/git"
}
```

### 6. Hyper Terminal <Badge type="tip" text="Windows"/>

```json
{
  // Batch link
  "shell": "C:\\Windows\\System32\\bash.exe",

  // for setting shell arguments (i.e. for using interactive shellArgs: `['-i']`)
  // by default `['--login']` will be used
  "shellArgs": ["-c", "zsh && cd ~"]
}
```

### 7. Docker <Badge type="tip" text="Windows"/>

![link-docker-into-sub-ubuntu](/docs/images/link-docker-into-sub-ubuntu.png)

## Local Environments

1. Make sure you have `NODE_ENV` is `development`
   Check: `echo $NODE_ENV`. It should be: `development` <br />
   If not. Please set the `NODE_ENV` as below: <br />

```bash
echo "NODE_ENV=development" >> ~/.zshrc
```

And source it

```bash
source ~/.zshrc
```

2. Others
