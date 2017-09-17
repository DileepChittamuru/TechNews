#!/bin/bash
#Copyright 2013-2014 RevSoftware, Inc.
#Script prepared by Latheef
#Version 1.0

base_path=$PWD

#killing the processers
nodePids=$(pgrep node)
if [[ -n $nodePids ]] ; then
        killall -9 node
fi

#To installig the npm packages
cd $base_path
npm install

#To run the beacon service
cd $base_path
forever start -o $base_path/log/ilp.log index.js

