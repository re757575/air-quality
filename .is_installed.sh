#!/bin/bash

function install_module {
    echo -e "\e[33m$1 is installing"
    sleep 0s
    npm install -g $1
    printf "\e[32m"
    echo -e "$1 is installed"
    sleep .5s
}

function module_is_installed {

    local is_installed=1

    type $1 >/dev/null 2>&1 || { is_installed=0; }

    if [ "$is_installed" = "1" ]; then
        echo -e "\e[32m$1 is installed"
    else
        echo -e "\e[31m$1 is not installed"
        sleep 0s
        install_module $1
    fi
}

params=$1

#module_number="$(echo $params | awk -F ';' '{print NF}')"

function main {
    for module_name in ${params//,/ } ; do
      module_is_installed ${module_name}
    done
}

main
