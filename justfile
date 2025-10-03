# https://just.systems

default:
    just --list

# first install and use latest npm using nvm
# nvm install-latest-npm
# nvm use

# then install corepack
# corepack enable yarn

dependencies:
    yarn

pre-commit-hooks:
    yarn prepare

post-install:
    sh ./scripts/post-install.sh

build:
    yarn build

test:
    yarn test

lint:
    yarn lint

dev:
    sh ./scripts/post-install.sh
    yarn dev

smoke-test:
    yarn build
    yarn test

prep-pr:
    yarn build
    yarn test
    yarn lint

alias run := build-dev

build-dev:
    yarn build
    sh ./scripts/post-install.sh
    yarn dev
