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

### HOW TO CHANGE TAG TO ANOTHER COMMIT

1. Delete the existing tag locally:
   ```bash
   git tag -d <tag-name>
   ```
2. Push the deletion to the remote repository:
   ```bash
   git push origin :refs/tags/<tag-name>
   ```
3. Create a new tag pointing to the new commit:

   ```bash
   git tag <tag-name> <new-commit-hash>
   ```

   ```

   ```

4. Push the new tag to the remote repository:
   ```bash
   git push origin <tag-name>
   ```
