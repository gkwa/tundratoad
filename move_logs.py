import argparse
import pathlib
import shutil
import sys


VAULT = pathlib.Path("/Users/mtm/Documents/Obsidian Vault")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Move tundratoad event logs from the vault to a target directory and report counts"
    )
    parser.add_argument(
        "dest",
        type=pathlib.Path,
        metavar="DEST",
        help="Directory to move logs into",
    )
    parser.add_argument(
        "--vault",
        type=pathlib.Path,
        default=VAULT,
        metavar="DIR",
        help=f"Vault root to scan (default: {VAULT})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be moved without moving anything",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()

    vault: pathlib.Path = args.vault
    dest: pathlib.Path = args.dest

    if not vault.is_dir():
        print(f"error: vault not found: {vault}", file=sys.stderr)
        sys.exit(1)

    dest.mkdir(parents=True, exist_ok=True)

    files = sorted(vault.glob("tundratoad-*.json"))
    total_before = sum(1 for _ in vault.iterdir() if _.is_file())

    moved = 0
    skipped = 0
    for f in files:
        target = dest / f.name
        if target.exists():
            skipped += 1
            continue
        if args.dry_run:
            print(f"would move {f.name}")
        else:
            shutil.move(str(f), target)
        moved += 1

    total_after = sum(1 for _ in vault.iterdir() if _.is_file())

    print(f"files found:   {len(files)}")
    print(f"files moved:   {moved}")
    print(f"files skipped: {skipped} (already in dest)")
    print(f"vault before:  {total_before}")
    print(f"vault after:   {total_after}")
    print(f"reduction:     {total_before - total_after}")


if __name__ == "__main__":
    main()
