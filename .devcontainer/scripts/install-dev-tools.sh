#!/usr/bin/zsh
PROJECT_DIR=$(pwd)
PROVISION_DIR=$PROJECT_DIR/.devcontainer/provision
APP_DIR=$PROVISION_DIR/app
ENV_DIR=$PROVISION_DIR/env

# Create user bin
mkdir -p ~/bin

# Update pkg
sudo apt-get update -y

# Install pkg
sudo apt-get install -y tig wget vim unzip curl awscli git openssl jq python3 ansible dnsutils

# Install Terraform
wget https://releases.hashicorp.com/terraform/0.12.25/terraform_0.12.25_linux_amd64.zip &&
  unzip ./terraform_0.12.25_linux_amd64.zip -d $HOME/bin/ &&
  rm -rf ./terraform_0.12.25_linux_amd64.zip

# Install helm-diff plugin
helm plugin install https://github.com/databus23/helm-diff --version master

# Install helm-secrets plugin
helm plugin install https://github.com/futuresimple/helm-secrets

# Install Helmsman
curl -L https://github.com/Praqma/helmsman/releases/download/v3.4.0/helmsman_3.4.0_linux_amd64.tar.gz | tar zx &&
  chmod +x helmsman &&
  mv ./helmsman $HOME/bin/helmsman

# Install aws-iam-authenticator
curl -o aws-iam-authenticator https://amazon-eks.s3-us-west-2.amazonaws.com/1.15.10/2020-02-22/bin/linux/amd64/aws-iam-authenticator &&
  chmod +x ./aws-iam-authenticator &&
  mv ./aws-iam-authenticator $HOME/bin/aws-iam-authenticator

# Install doctl
curl -OL https://github.com/digitalocean/doctl/releases/download/v1.45.1/doctl-1.45.1-linux-amd64.tar.gz &&
  tar xf doctl-1.45.1-linux-amd64.tar.gz &&
  mv ./doctl $HOME/bin/doctl &&
  rm -rf doctl-1.45.1-linux-amd64.tar.gz

# Install FiraCode fonts
sh ./install-firacode.sh

# Install oh-my-zsh
mkdir -p ~/tmp && curl -o ~/tmp/install.sh https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh
sh ~/tmp/install.sh --skip-chsh --unattended && rm ~/tmp/install.sh

# Install zsh plugins
mkdir -p ~/.zsh
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.zsh/zsh-syntax-highlighting
echo "source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh" >>${ZDOTDIR:-$HOME}/.zshrc
echo "source ~/.zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >>${ZDOTDIR:-$HOME}/.zshrc

# Install zsh theme
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/powerlevel10k
## powerlevel10k/powerlevel10k

# Install vimrc
git clone --depth=1 https://github.com/amix/vimrc.git ~/.vim_runtime
sh ~/.vim_runtime/install_awesome_vimrc.sh

# Install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.23.1/docker-compose-$(uname -s)-$(uname -m)" -o $HOME/bin/docker-compose
sudo chmod +x $HOME/bin/docker-compose
