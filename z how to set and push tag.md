# Navigate to the client repository (if not already there)

cd C:\Users\Samsa\.vscode\coding\sopra-fs25-group-29-client

# Add changes to the staging area

git add .

# Commit the staged changes

git commit -m "Add group name display"

# Ensure you're on the main branch

git checkout main

# Pull the latest changes (optional but recommended)

git pull origin main

# Push the commit to the main branch

git push origin main

# Create a tag named "M2"

git tag M2

# Push the tag to the remote repository

git push origin M2
