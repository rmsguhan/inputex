#!/bin/sh

CURRENT_PATH="$(dirname "$(readlink ${BASH_SOURCE[0]})")"
cd $CURRENT_PATH/../..
zip -vr inputex-0.2.2.zip inputex-0.2.2 -x "*.zip" "*.git*" "*.DS_Store*" "*logo-inputex.xcf" "*build.sh" "*makeZip.sh" "*generateDoc.sh" "*inputExRdf*" "*_content.html" "*inputex.conf" "*build/tools*"