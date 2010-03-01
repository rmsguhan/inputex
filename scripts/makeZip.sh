#!/bin/sh

CURRENT_PATH="$(dirname "$(readlink ${BASH_SOURCE[0]})")"
cd $CURRENT_PATH/../..
zip -vr inputex-0.4.0.zip inputex-0.4.0 -x "*.git*" "*.DS_Store*" "*logo-inputex.xcf" "*build.sh" "*scripts/*" "*sandbox/*" "*/TODO.txt"