import contextlib
import importlib.util
import io
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import compare as comparison
import references
from parity_test import encode
spec=importlib.util.spec_from_file_location('suite_cli_test',ROOT/'scripts/parity-suite.py')
suite=importlib.util.module_from_spec(spec);spec.loader.exec_module(suite)

class CliTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        (self.root/'references').mkdir()
        self.source=self.root/'source.mkv';encode(self.source,[bytes([n*30,20,40])*256 for n in range(3)])
        self.refs=[{'id':'unit','composition':'Unit','source':'source.mkv','crop':None}]
        self.manifest=self.root/'references/manifest.json';self.manifest.write_text(json.dumps({'references':self.refs}))
    def tearDown(self):self.temp.cleanup()
    def receipt(self,candidate):
        result={'composition':'Unit','status':'rendered-not-parity-approved','sourceHashes':{'scene':'fixture'},'lockfileSha256':'fixture','parityMasterSha256':references.sha256(candidate),'stages':{k:'passed' for k in ['bundle','sourceAudit','capture','determinism','encode']}}
        (candidate.parent/'receipt.json').write_text(json.dumps(result));return result
    def test_inventory_and_contact_sheet_use_real_media(self):
        self.refs[0]['crop']={'x':2,'y':2,'width':8,'height':8};self.manifest.write_text(json.dumps({'references':self.refs}))
        with patch.object(references,'ROOT',self.root),patch.object(sys,'argv',['inventory','--sheets']),contextlib.redirect_stdout(io.StringIO()):references.main()
        data=json.loads((self.root/'analysis/inventory.json').read_text())['references'][0]
        self.assertEqual(data['target']['frames'],3);self.assertEqual(data['target']['width'],8)
        self.assertEqual(len(references.timestamps(self.source)),3)
        self.assertTrue((self.root/'analysis/contact-sheets/unit.jpg').is_file())
    def test_comparison_cli_reports_exact_success_and_unknown_project(self):
        candidate=self.root/'candidate.mkv';shutil.copy2(self.source,candidate)
        with patch.object(comparison,'ROOT',self.root),patch.object(sys,'argv',['compare','unit',str(candidate)]),contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(comparison.main(),0)
        self.assertTrue(json.loads((self.root/'out/unit/parity/report.json').read_text())['passed'])
        with patch.object(comparison,'ROOT',self.root),patch.object(sys,'argv',['compare','unknown',str(candidate)]),contextlib.redirect_stderr(io.StringIO()),self.assertRaises(SystemExit):comparison.main()
    def test_capture_receipt_rejects_incomplete_or_tampered_evidence(self):
        candidate=self.root/'candidate.mkv';shutil.copy2(self.source,candidate);record=self.receipt(candidate)
        self.assertEqual(suite.check_capture(candidate,'Unit'),[])
        record.update(composition='Wrong',status='started',sourceHashes={},parityMasterSha256='wrong');record['stages']={}
        (self.root/'receipt.json').write_text(json.dumps(record))
        failures=suite.check_capture(candidate,'Unit')
        for expected in ['wrong-composition-receipt','incomplete-capture','candidate-receipt-hash','missing-source-provenance','capture-stage-determinism']:self.assertIn(expected,failures)
        self.assertEqual(suite.check_capture(candidate,'Unit',{self.root/'receipt.json'}),['cyclic-capture-evidence'])
    def run_suite(self,candidates):
        file=self.root/'candidates.json';file.write_text(json.dumps(candidates))
        with patch.object(suite,'ROOT',self.root),patch.object(sys,'argv',['parity',str(file)]),contextlib.redirect_stdout(io.StringIO()):return suite.main()
    def test_suite_requires_all_candidates_and_real_pixel_comparison(self):
        self.assertEqual(self.run_suite({}),1)
        candidate=self.root/'candidate.mkv';shutil.copy2(self.source,candidate)
        self.assertEqual(self.run_suite({'unit':str(candidate)}),1)
        self.receipt(candidate);self.assertEqual(self.run_suite({'unit':str(candidate)}),0)
        report=json.loads((self.root/'out/acceptance/suite.json').read_text());self.assertTrue(report['passed'])
        (self.root/'receipt.json').write_text('{invalid');self.assertEqual(self.run_suite({'unit':str(candidate)}),1)
        self.assertIn('comparison-error',json.loads((self.root/'out/acceptance/suite.json').read_text())['projects'][0]['failures'])
