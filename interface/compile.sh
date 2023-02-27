#!/usr/bin/env bash
# A script to compile a Tauri app for 32-bit Linux
###################################################
# By CARAVATI Matteo <mcaravati@enseirb-matmeca.fr>
###################################################

set -o errexit # Exit if command failed
set -o pipefail # Exit if pipe failed
set -o nounset # Exit if variable not set
# Remove the initial space and instead use '\n'
IFS=$'\n\t'

# Check if dpkg is configured to use i386 architecture
if ! dpkg --print-foreign-architectures | grep -q i386; then
    echo "Adding i386 architecture to dpkg"
    # Setup i386 architecture
    sudo dpkg --add-architecture i386
else
    echo "i386 architecture already configured"
fi

# Install dependencies
sudo apt-get update

sudo apt install -y \
    libwebkit2gtk-4.0-37:i386 \
    libwebkit2gtk-4.0-dev:i386 \
    libgtk-3-0:i386 \
    libgtk-3-dev:i386 \
    libcairo2:i386 \
    libcairo2-dev:i386 \


export PKG_CONFIG_SYSROOT_DIR=/usr/lib/i386-linux-gnu
# Build for i686
npm run tauri -- build -t i686-unknown-linux-gnu