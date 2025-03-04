#!/bin/bash
# Make permissions executable
chmod +x build.sh
chmod +x install.sh

# Run the build script
./build.sh

# If successful, run the install script
if [ $? -eq 0 ]; then
    ./install.sh
fi
