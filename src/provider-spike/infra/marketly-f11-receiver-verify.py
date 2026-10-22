#!/usr/bin/python3 -I
"""Bounded Phase-1 verifier for the accepted Marketly F11 static receiver."""

import hashlib
import json
import os
import stat
import sys

SCHEMA_VERSION = 1
RECEIVER_SOURCE_PATH = "/opt/marketly-r02/receiver.py"
UNIT_PATH = "/etc/systemd/system/marketly-r02-receiver.service"
EVIDENCE_DIR_PATH = "/var/lib/marketly-r02/f11-evidence"
EXPECTED_RECEIVER_SHA256 = "f2851eac800b417ec870083f7acb69f0fa231fdea645c96b328736486fa7dcb9"
EXPECTED_UNIT_SHA256 = "c0d3c948068ebbd5c315e88d6a305e3dc2a66a18f497470a3ef88c547c9ff1d7"

APPROVED_KEYS = (
    "schemaVersion",
    "receiverSourceSha256",
    "unitSha256",
    "receiverSourceReadable",
    "unitReadable",
    "evidenceDirectoryExists",
    "evidenceDirectoryState",
    "evidenceCount",
    "result",
)

VALID_EVIDENCE_STATES = {"VALID_EMPTY", "VALID_NONEMPTY"}


def _open_flags(read_only=True):
    flags = os.O_RDONLY if read_only else 0
    if hasattr(os, "O_CLOEXEC"):
        flags |= os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    return flags


def _safe_hash_fixed_file(path):
    fd = None
    try:
        before = os.lstat(path)
        if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode):
            return False, None
        fd = os.open(path, _open_flags())
        opened = os.fstat(fd)
        if not stat.S_ISREG(opened.st_mode):
            return False, None
        if (before.st_dev, before.st_ino) != (opened.st_dev, opened.st_ino):
            return False, None
        digest = hashlib.sha256()
        while True:
            chunk = os.read(fd, 65536)
            if not chunk:
                break
            digest.update(chunk)
        return True, digest.hexdigest()
    except (OSError, ValueError):
        return False, None
    finally:
        if fd is not None:
            try:
                os.close(fd)
            except OSError:
                pass


def _inspect_evidence_dir_posix(path, before):
    fd = None
    try:
        flags = _open_flags()
        if hasattr(os, "O_DIRECTORY"):
            flags |= os.O_DIRECTORY
        fd = os.open(path, flags)
        opened = os.fstat(fd)
        if not stat.S_ISDIR(opened.st_mode):
            return True, "INVALID_STRUCTURE", None
        if (before.st_dev, before.st_ino) != (opened.st_dev, opened.st_ino):
            return True, "INVALID_STRUCTURE", None
        names = os.listdir(fd)
        count = 0
        for name in names:
            try:
                child = os.stat(name, dir_fd=fd, follow_symlinks=False)
            except OSError:
                return True, "UNREADABLE_OR_INTERNAL_ERROR", None
            if not stat.S_ISREG(child.st_mode):
                return True, "INVALID_STRUCTURE", None
            count += 1
        state = "VALID_EMPTY" if count == 0 else "VALID_NONEMPTY"
        return True, state, count
    except OSError:
        return True, "UNREADABLE_OR_INTERNAL_ERROR", None
    finally:
        if fd is not None:
            try:
                os.close(fd)
            except OSError:
                pass


def _inspect_evidence_dir_portable(path):
    try:
        count = 0
        with os.scandir(path) as entries:
            for entry in entries:
                try:
                    if entry.is_symlink():
                        return True, "INVALID_STRUCTURE", None
                    child = entry.stat(follow_symlinks=False)
                except OSError:
                    return True, "UNREADABLE_OR_INTERNAL_ERROR", None
                if not stat.S_ISREG(child.st_mode):
                    return True, "INVALID_STRUCTURE", None
                count += 1
        state = "VALID_EMPTY" if count == 0 else "VALID_NONEMPTY"
        return True, state, count
    except OSError:
        return True, "UNREADABLE_OR_INTERNAL_ERROR", None


def _inspect_evidence_dir(path):
    try:
        before = os.lstat(path)
    except FileNotFoundError:
        return False, "MISSING", None
    except OSError:
        return False, "UNREADABLE_OR_INTERNAL_ERROR", None
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISDIR(before.st_mode):
        return True, "INVALID_STRUCTURE", None
    if os.name == "posix" and hasattr(os, "O_DIRECTORY"):
        return _inspect_evidence_dir_posix(path, before)
    return _inspect_evidence_dir_portable(path)


def _failure_payload():
    return {
        "schemaVersion": SCHEMA_VERSION,
        "receiverSourceSha256": None,
        "unitSha256": None,
        "receiverSourceReadable": False,
        "unitReadable": False,
        "evidenceDirectoryExists": False,
        "evidenceDirectoryState": "UNREADABLE_OR_INTERNAL_ERROR",
        "evidenceCount": None,
        "result": "FAIL",
    }


def build_result():
    receiver_readable, receiver_sha = _safe_hash_fixed_file(RECEIVER_SOURCE_PATH)
    unit_readable, unit_sha = _safe_hash_fixed_file(UNIT_PATH)
    evidence_exists, evidence_state, evidence_count = _inspect_evidence_dir(EVIDENCE_DIR_PATH)

    passed = (
        receiver_readable
        and receiver_sha == EXPECTED_RECEIVER_SHA256
        and unit_readable
        and unit_sha == EXPECTED_UNIT_SHA256
        and evidence_state in VALID_EVIDENCE_STATES
        and isinstance(evidence_count, int)
    )

    return {
        "schemaVersion": SCHEMA_VERSION,
        "receiverSourceSha256": receiver_sha,
        "unitSha256": unit_sha,
        "receiverSourceReadable": receiver_readable,
        "unitReadable": unit_readable,
        "evidenceDirectoryExists": evidence_exists,
        "evidenceDirectoryState": evidence_state,
        "evidenceCount": evidence_count,
        "result": "PASS" if passed else "FAIL",
    }


def _emit(payload):
    bounded = {key: payload.get(key) for key in APPROVED_KEYS}
    sys.stdout.write(json.dumps(bounded, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    if len(sys.argv) != 1:
        _emit(_failure_payload())
        return 2
    try:
        payload = build_result()
    except Exception:
        payload = _failure_payload()
    _emit(payload)
    return 0 if payload["result"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
