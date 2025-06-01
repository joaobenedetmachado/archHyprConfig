#!/bin/bash
hyprctl clients -j | jq -r '.[] | select(.workspace.name == "special:min") | "\(.title)::\(.address)"'
