import contextlib
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "src" / "provider-spike" / "infra" / "marketly-f11-receiver-verify.py"
SPEC = importlib.util.spec_from_file_location("marketly_f11_receiver_verify", str(VERIFIER_PATH))
verifier = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(verifier)


class VerifierTests(unittest.TestCase):
    def setUp(self):
        self.originals = {
            "RECEIVER_SOURCE_PATH": verifier.RECEIVER_SOURCE_PATH,
            "UNIT_PATH": verifier.UNIT_PATH,
            "EVIDENCE_DIR_PATH": verifier.EVIDENCE_DIR_PATH,
            "EXPECTED_RECEIVER_SHA256": verifier.EXPECTED_RECEIVER_SHA256,
            "EXPECTED_UNIT_SHA256": verifier.EXPECTED_UNIT_SHA256,
        }
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.receiver = self.root / "receiver.py"
        self.unit = self.root / "receiver.service"
        self.evidence = self.root / "evidence"
        self.receiver.write_bytes(b"receiver-v1\n")
        self.unit.write_bytes(b"unit-v1\n")
        self.evidence.mkdir()
        self._configure_fixed_inputs()

    def tearDown(self):
        for key, value in self.originals.items():
            setattr(verifier, key, value)
        self.tmp.cleanup()

    def _sha(self, path):
        return hashlib.sha256(path.read_bytes()).hexdigest()

    def _configure_fixed_inputs(self):
        verifier.RECEIVER_SOURCE_PATH = str(self.receiver)
        verifier.UNIT_PATH = str(self.unit)
        verifier.EVIDENCE_DIR_PATH = str(self.evidence)
        verifier.EXPECTED_RECEIVER_SHA256 = self._sha(self.receiver)
        verifier.EXPECTED_UNIT_SHA256 = self._sha(self.unit)

    def _run_main(self, argv=None):
        output = io.StringIO()
        argv = [str(VERIFIER_PATH)] if argv is None else argv
        with mock.patch.object(verifier.sys, "argv", argv), contextlib.redirect_stdout(output):
            code = verifier.main()
        raw = output.getvalue()
        return code, raw, json.loads(raw)

    def _replace_with_symlink(self, target, link):
        try:
            os.symlink(str(target), str(link), target_is_directory=target.is_dir())
        except (OSError, NotImplementedError) as exc:
            self.skipTest("symlink creation unavailable: %s" % exc)

    def test_zero_arguments_accepts_valid_empty_directory(self):
        code, _, payload = self._run_main()
        self.assertEqual(code, 0)
        self.assertEqual(payload["result"], "PASS")
        self.assertEqual(payload["evidenceDirectoryState"], "VALID_EMPTY")
        self.assertEqual(payload["evidenceCount"], 0)

    def test_supplied_argument_rejected_nonzero_with_bounded_schema(self):
        code, _, payload = self._run_main([str(VERIFIER_PATH), "unexpected"])
        self.assertNotEqual(code, 0)
        self.assertEqual(payload["result"], "FAIL")
        self.assertEqual(set(payload), set(verifier.APPROVED_KEYS))

    def test_correct_hashes_pass(self):
        payload = verifier.build_result()
        self.assertEqual(payload["receiverSourceSha256"], self._sha(self.receiver))
        self.assertEqual(payload["unitSha256"], self._sha(self.unit))
        self.assertEqual(payload["result"], "PASS")

    def test_receiver_hash_mismatch_fails(self):
        verifier.EXPECTED_RECEIVER_SHA256 = "0" * 64
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertEqual(payload["result"], "FAIL")

    def test_unit_hash_mismatch_fails(self):
        verifier.EXPECTED_UNIT_SHA256 = "0" * 64
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertEqual(payload["result"], "FAIL")

    def test_receiver_symlink_fails(self):
        target = self.root / "receiver-real.py"
        target.write_bytes(self.receiver.read_bytes())
        self.receiver.unlink()
        self._replace_with_symlink(target, self.receiver)
        verifier.EXPECTED_RECEIVER_SHA256 = self._sha(target)
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertFalse(payload["receiverSourceReadable"])

    def test_unit_symlink_fails(self):
        target = self.root / "unit-real.service"
        target.write_bytes(self.unit.read_bytes())
        self.unit.unlink()
        self._replace_with_symlink(target, self.unit)
        verifier.EXPECTED_UNIT_SHA256 = self._sha(target)
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertFalse(payload["unitReadable"])

    def test_evidence_directory_symlink_is_invalid(self):
        real_dir = self.root / "evidence-real"
        real_dir.mkdir()
        self.evidence.rmdir()
        self._replace_with_symlink(real_dir, self.evidence)
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertEqual(payload["evidenceDirectoryState"], "INVALID_STRUCTURE")
        self.assertIsNone(payload["evidenceCount"])

    def test_regular_files_counted(self):
        (self.evidence / "one.json").write_bytes(b"a")
        (self.evidence / "two.json").write_bytes(b"b")
        code, _, payload = self._run_main()
        self.assertEqual(code, 0)
        self.assertEqual(payload["evidenceDirectoryState"], "VALID_NONEMPTY")
        self.assertEqual(payload["evidenceCount"], 2)

    def test_symlink_child_invalidates_structure(self):
        target = self.root / "outside.txt"
        target.write_text("outside", encoding="utf-8")
        self._replace_with_symlink(target, self.evidence / "child-link")
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertEqual(payload["evidenceDirectoryState"], "INVALID_STRUCTURE")
        self.assertIsNone(payload["evidenceCount"])

    def test_subdirectory_child_invalidates_structure(self):
        (self.evidence / "nested").mkdir()
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertEqual(payload["evidenceDirectoryState"], "INVALID_STRUCTURE")

    @unittest.skipUnless(hasattr(os, "mkfifo") and os.name == "posix", "FIFO test requires POSIX mkfifo")
    def test_special_entry_invalidates_structure(self):
        os.mkfifo(str(self.evidence / "fifo"))
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertEqual(payload["evidenceDirectoryState"], "INVALID_STRUCTURE")

    def test_unreadable_internal_error_branch_fails_closed(self):
        with mock.patch.object(
            verifier,
            "_inspect_evidence_dir",
            return_value=(True, "UNREADABLE_OR_INTERNAL_ERROR", None),
        ):
            code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertEqual(payload["evidenceDirectoryState"], "UNREADABLE_OR_INTERNAL_ERROR")
        self.assertIsNone(payload["evidenceCount"])

    def test_output_contains_only_approved_keys(self):
        _, _, payload = self._run_main()
        self.assertEqual(set(payload), set(verifier.APPROVED_KEYS))

    def test_no_evidence_name_or_content_leakage(self):
        marker_name = "marker-evidence-name.json"
        marker_content = "MARKER-EVIDENCE-CONTENT"
        (self.evidence / marker_name).write_text(marker_content, encoding="utf-8")
        code, raw, payload = self._run_main()
        self.assertEqual(code, 0)
        self.assertEqual(payload["evidenceCount"], 1)
        self.assertNotIn(marker_name, raw)
        self.assertNotIn(marker_content, raw)

    def test_json_output_is_deterministic(self):
        code1, raw1, _ = self._run_main()
        code2, raw2, _ = self._run_main()
        self.assertEqual(code1, 0)
        self.assertEqual(code2, 0)
        self.assertEqual(raw1, raw2)

    def test_failure_exit_is_nonzero(self):
        verifier.EXPECTED_RECEIVER_SHA256 = "f" * 64
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertEqual(payload["result"], "FAIL")

    def test_missing_evidence_directory_reports_missing(self):
        self.evidence.rmdir()
        code, _, payload = self._run_main()
        self.assertNotEqual(code, 0)
        self.assertFalse(payload["evidenceDirectoryExists"])
        self.assertEqual(payload["evidenceDirectoryState"], "MISSING")
        self.assertIsNone(payload["evidenceCount"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
