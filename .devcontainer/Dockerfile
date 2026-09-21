# See here for image contents: https://github.com/devcontainers/images/tree/main/src/javascript-node
# [Choice] Node.js version: 24, 24-bookworm, 24-bullseye
ARG VARIANT=24-bullseye
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "umask 0002 && ./usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"

# Update npm
#RUN npm install -g npm