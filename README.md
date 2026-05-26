# tundratoad

Obsidian plugin that logs file-open events to the vault root as JSON files.

Each time a file is opened in Obsidian, one JSON file is written:

```
tundratoad-<uuidv7>.json
```

The UUID v7 prefix encodes the creation timestamp, so files sort lexicographically in event order.

## Record format

```json
{
  "path": "folder/note.md",
  "ts": 1746700000000,
  "isoDate": "2026-05-08T12:00:00.000Z",
  "vaultName": "Obsidian Vault",
  "eventType": "open"
}
```

## Events tracked

- `open` — user opens a file in the workspace
- `write` — vault writes to a file
- `delete` — vault deletes a file

## Build and install

```sh
just install
```

Copies `main.js` and `manifest.json` to `.obsidian/plugins/tundratoad/` in the vault.

Enable the plugin under Settings → Community plugins → Tundra Toad.

## Vault cleanup workflow

Over time the event logs accumulate in the vault root and inflate the file count seen by SyncThing, which causes Obsidian to crash on mobile.

Run `move_logs.py` periodically to relocate accumulated logs to `data/`:

```sh
python move_logs.py
```

The script moves files, never deletes them.

Pass `--dry-run` to preview without moving:

```sh
python move_logs.py --dry-run
```

Query the relocated logs with keenkitten to rank notes by access frequency:

```sh
keenkitten /path/to/tundratoad/data
```

See [keenkitten](https://github.com/taylormonacelli/keenkitten) for full usage.
