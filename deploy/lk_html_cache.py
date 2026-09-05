import hashlib
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time


HOST = 'lk.xn--1-xtbgmf.xn--p1ai'
BLOCK = '''    location = /index.html {
        add_header Cache-Control "no-cache" always;
        add_header X-Robots-Tag "noindex, nofollow" always;
        try_files $uri =404;
    }
'''


def configure(content):
    if HOST not in content or len(re.findall(r'root\s+/var/www/prohelper_lk/current\s*;', content)) != 1:
        raise ValueError('Unexpected LK virtual host')
    if re.search(r'location\s*=\s*/index\.html\s*\{', content):
        if content.count(BLOCK) == 1:
            return content
        raise ValueError('Existing index location requires review')
    matches = list(re.finditer(r'(?m)^\s*index\s+index\.html\s*;[^\S\n]*$', content))
    if len(matches) != 1:
        raise ValueError('Expected exactly one HTML index directive')
    end = matches[0].end()
    return content[:end] + '\n\n' + BLOCK + content[end:]


def atomic_write(path, content, mode):
    descriptor, temporary = tempfile.mkstemp(dir=path.parent, prefix='.most-cache-')
    try:
        with os.fdopen(descriptor, 'wb') as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, mode)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def verify():
    for route in ['/index.html', '/login', '/dashboard/custom-roles']:
        for attempt in range(10):
            headers = subprocess.check_output([
                'curl', '--fail', '--silent', '--show-error', '--head', '--max-time', '5',
                '--resolve', f'{HOST}:443:127.0.0.1', f'https://{HOST}{route}',
            ], text=True).lower()
            if 'cache-control: no-cache' in headers and 'x-robots-tag: noindex, nofollow' in headers:
                break
            if attempt == 9:
                observed = [line for line in headers.splitlines() if line.startswith(('http/', 'cache-control:', 'x-robots-tag:'))]
                raise RuntimeError(f'HTML headers did not pass verification: {route}: {observed}')
            time.sleep(0.5)


def apply(path, backup_directory):
    path = path.resolve(strict=True)
    original = path.read_bytes()
    updated = configure(original.decode('utf-8')).encode('utf-8')
    if updated == original:
        verify()
        print('LK HTML cache policy already verified')
        return
    backup_directory.mkdir(parents=True, exist_ok=True)
    backup = backup_directory / (hashlib.sha256(original).hexdigest() + '.conf')
    if backup.exists():
        if backup.read_bytes() != original:
            raise RuntimeError('Backup content mismatch')
    else:
        with backup.open('xb') as stream:
            stream.write(original)
    mode = path.stat().st_mode & 0o7777
    atomic_write(path, updated, mode)
    try:
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
        verify()
    except Exception:
        atomic_write(path, original, mode)
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
        raise
    print('LK HTML cache policy verified; backup:', backup)


if __name__ == '__main__':
    apply(Path('/etc/nginx/sites-enabled/lk.prohelper.pro.conf'), Path('/var/backups/most-lk/nginx-cache'))
