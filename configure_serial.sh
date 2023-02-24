#!/usr/bin/env bash

set -o errexit # Exit if command failed
set -o pipefail # Exit if pipe failed
set -o nounset # Exit if variable not set
# Remove the initial space and instead use '\n'
IFS=$'\n\t'

