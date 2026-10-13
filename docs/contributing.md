# Contributing

Here are all of the steps you should follow whenever contributing to this repo!

## Making Changes

1. Start from an up-to-date `dev` branch: run `git switch dev`, `git pull --ff-only`, and `npm ci`. Preserve existing local changes.
2. Create a branch `git checkout -b <name-of-branch>`
3. Make changes to the code
4. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before requesting review. Open feature pull requests against `dev`. Release reviewed changes to `main`; Vercel deploys `main` to Production and other branches to Preview.

## Commiting Changes

When interacting with Git/GitHub, feel free to use the command line, VSCode extension, or Github desktop. These steps assume you have already made a branch using `git checkout -b <branch-name>` and you have made all neccessary code changes for the provided task.

1. View diffs of each file you changed using the VSCode Github extension (3rd icon on far left bar of VSCode) or GitHub Desktop
2. `git add .` (to stage all files) or `git add <file-name>` (to stage specific file)
3. `git commit -m "<type>[optional scope]: <description>"` or
   `git commit -m "<type>[optional scope]: <description>" -m "[optional body]"` or
   `git commit` to get a message prompt
4. `git push -u origin <name-of-branch>`

## Making Pull Requests

1. Go to the Pull Requests tab on [github.com](https://github.com/)
2. Find your PR, fill out the PR template
3. (If applicable, provide a screenshot of your work in the comment area)
4. Link your PR to the corresponding **Issue**
5. Request a reviewer to check your code
6. Once approved, your code is ready to be merged in 🎉
