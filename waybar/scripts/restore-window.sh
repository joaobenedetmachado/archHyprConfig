#!/bin/bash
addr=$(echo "$1" | cut -d ':' -f2)
hyprctl dispatch focuswindow address:$addr
