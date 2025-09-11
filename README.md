# Advanced Patterns React

## Notes

### Technologies

#### Package manager: `pnpm`

Because `pnpm` allows for monorepo management and make workspaces.
The pnpm-workspace.yaml file is used to define the workspace and its packages.
Every workspace has its own package.json file, which is used to define the package and its dependencies.
In the global package.json file, we define the shared dependencies and scripts.
Each package defines its own dependencies and scripts and can include other dependencies from other packages by writing `"workspace:*"` as a dependency.
