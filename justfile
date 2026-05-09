default:
    just --list

build:
    pnpm run build

dev:
    pnpm run dev

install: build
    mkdir -p "/Users/mtm/Documents/Obsidian Vault/.obsidian/plugins/tundratoad"
    cp main.js manifest.json "/Users/mtm/Documents/Obsidian Vault/.obsidian/plugins/tundratoad/"
