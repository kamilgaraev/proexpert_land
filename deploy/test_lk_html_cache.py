from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from lk_html_cache import BLOCK, apply, configure, verify


CONFIG = '''server {
    server_name lk.xn--1-xtbgmf.xn--p1ai;
    root /var/www/prohelper_lk/current;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \\.(js|css)$ { expires 1y; add_header Cache-Control "public, immutable"; }
}
'''


class CachePolicyTests(unittest.TestCase):
    def test_adds_html_policy_without_changing_existing_routes(self):
        updated = configure(CONFIG)
        self.assertIn(BLOCK, updated)
        self.assertEqual(updated.replace('\n\n' + BLOCK, ''), CONFIG)
        self.assertEqual(configure(updated), updated)

    def test_refuses_unknown_host_and_conflicting_index_location(self):
        for content in [CONFIG.replace('prohelper_lk/current', 'another/current'), CONFIG + 'location = /index.html {}']:
            with self.assertRaises(ValueError):
                configure(content)

    def test_rejects_missing_cache_header(self):
        with patch('lk_html_cache.subprocess.check_output', return_value='HTTP/1.1 200 OK\nX-Robots-Tag: noindex, nofollow\n'):
            with self.assertRaises(RuntimeError):
                verify()

    def test_restores_config_when_nginx_validation_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'site.conf'
            path.write_text(CONFIG)
            with patch('lk_html_cache.subprocess.run', side_effect=[subprocess.CalledProcessError(1, 'nginx'), None, None]), patch('lk_html_cache.verify') as check:
                with self.assertRaises(subprocess.CalledProcessError):
                    apply(path, Path(directory) / 'backups')
            self.assertEqual(path.read_text(), CONFIG)
            self.assertEqual(len(list((Path(directory) / 'backups').glob('*.conf'))), 1)
            check.assert_not_called()

    def test_restores_config_when_live_headers_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'site.conf'
            path.write_text(CONFIG)
            with patch('lk_html_cache.subprocess.run') as run, patch('lk_html_cache.verify', side_effect=RuntimeError('headers')):
                with self.assertRaises(RuntimeError):
                    apply(path, Path(directory) / 'backups')
            self.assertEqual(path.read_text(), CONFIG)
            self.assertEqual(run.call_count, 4)


if __name__ == '__main__':
    unittest.main()
