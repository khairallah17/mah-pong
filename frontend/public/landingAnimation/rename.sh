#!/bin/bash

# Set the directory containing the PNG files
directory="./"

# Navigate to the directory
cd "$directory" || exit

# Loop through all .png files
for file in *.png; do
  # Remove leading zeros using parameter expansion
  new_name=$(echo "$file" | sed -E 's/^0+//')
  # Rename the file
  mv "$file" "$new_name"
done

echo "Renaming completed!"

