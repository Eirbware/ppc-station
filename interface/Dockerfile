FROM ubuntu:18.04

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Add x86 architecture
RUN dpkg --add-architecture i386

# Update and upgrade
RUN apt-get update && apt-get upgrade -y

# Install x86_64 dependencies
RUN apt-get install --assume-yes \
    libssl-dev libglib2.0-dev libcairo2-dev libpango1.0-dev \
    libatk1.0-dev libgdk-pixbuf2.0-dev libsoup2.4-dev \
    libgtk-3-dev libwebkit2gtk-4.0-dev curl cargo \
    gcc-multilib g++-multilib

# APT won't do a recursive install, so we need to install the dependencies by hand
RUN apt-get install --assume-yes libharfbuzz-dev:i386 libicu-dev:i386 libxml2-dev:i386 libpango1.0-dev:i386

# Install x86 dependencies
RUN apt-get install --assume-yes \ 
    libwebkit2gtk-4.0-dev:i386 libssl-dev:i386 libgtk-3-dev:i386 \
    librsvg2-dev:i386 libsoup2.4-dev:i386 \
    libjavascriptcoregtk-4.0-dev:i386 

# Setup NVM environment variables
ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=16.13.0

# Install NVM and Node
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# Install rust and setup i686 target
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN source "$HOME/.cargo/env" \
    && rustup target add i686-unknown-linux-gnu

# Setup Node environment variables
ENV NODE_PATH=$NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Setup pkg-config environment variables
ENV PKG_CONFIG_SYSROOT_DIR=/usr/lib/i386-linux-gnu:/usr/lib/i386-linux-gnu/pkgconfig:/usr/lib/pkgconfig:/usr/share/pkgconfig
ENV PKG_CONFIG_PATH=/usr/lib/i386-linux-gnu/pkgconfig:/usr/lib/pkgconfig:/usr/share/pkgconfig
