"""Exercise the actual Worker SQL and schema with Python's built-in SQLite."""
import concurrent.futures
from contextlib import closing
from pathlib import Path
import re
import sqlite3
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = (ROOT / 'backend/likes/schema.sql').read_text(encoding='utf-8')
WORKER = (ROOT / 'backend/likes/worker.mjs').read_text(encoding='utf-8')
SAVE = re.search(r'const SAVE_LIKES_SQL = `(.*?)`;', WORKER, re.S).group(1)
READ = re.search(r'const READ_LIKES_SQL = `(.*?)`;', WORKER, re.S).group(1)


def identifier(value):
    return f'00000000-0000-4000-8000-{value:012x}'


class HeartSqlTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.db.executescript(SCHEMA)

    def tearDown(self):
        self.db.close()

    def save(self, who, hearts):
        with self.db:
            self.db.execute(SAVE, (identifier(who), hearts))
            return self.db.execute(READ, (identifier(who),)).fetchone()

    def test_duplicate_and_older_requests_do_not_add_hearts_twice(self):
        self.assertEqual(self.save(1, 12), (12, 12))
        self.assertEqual(self.save(1, 12), (12, 12))
        self.assertEqual(self.save(1, 9), (12, 12))
        self.assertEqual(self.save(1, 15), (15, 15))

    def test_independent_visitors_contribute_to_one_total(self):
        self.save(1, 12)
        self.assertEqual(self.save(2, 7), (19, 7))
        self.assertEqual(self.db.execute(READ, (identifier(1),)).fetchone(), (19, 12))

    def test_more_than_250_hearts_can_be_saved_in_chunks(self):
        for hearts in [250, 500, 750, 1000, 1001]:
            self.assertEqual(self.save(1, hearts), (hearts, hearts))

    def test_oversized_initial_and_incremental_requests_roll_back(self):
        with self.assertRaisesRegex(sqlite3.IntegrityError, 'heart_increment_too_large'):
            self.save(1, 251)
        self.assertEqual(self.db.execute(READ, (identifier(1),)).fetchone(), (0, 0))
        self.save(1, 10)
        with self.assertRaisesRegex(sqlite3.IntegrityError, 'heart_increment_too_large'):
            self.save(1, 261)
        self.assertEqual(self.db.execute(READ, (identifier(1),)).fetchone(), (10, 10))

    def test_reapplying_schema_preserves_existing_counts(self):
        self.save(1, 20)
        self.db.executescript(SCHEMA)
        self.assertEqual(self.db.execute(READ, (identifier(1),)).fetchone(), (20, 20))

    def test_total_constraint_failure_rolls_back_the_contributor_insert(self):
        with self.db:
            self.db.execute('UPDATE like_totals SET total = 9007199254740990')
        with self.assertRaises(sqlite3.IntegrityError):
            self.save(1, 2)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM like_contributions').fetchone()[0], 0)

    def test_concurrent_connections_do_not_lose_contributions(self):
        with tempfile.TemporaryDirectory(prefix='ipa365-hearts-test-') as directory:
            filename = str(Path(directory) / 'hearts.sqlite')
            with closing(sqlite3.connect(filename)) as db:
                db.executescript(SCHEMA)

            def send(value):
                with closing(sqlite3.connect(filename, timeout=15)) as db, db:
                    db.execute(SAVE, (identifier(value), 3))

            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
                list(pool.map(send, range(1, 41)))
            with closing(sqlite3.connect(filename)) as db:
                self.assertEqual(db.execute('SELECT total FROM like_totals').fetchone()[0], 120)
                self.assertEqual(db.execute('SELECT COUNT(*) FROM like_contributions').fetchone()[0], 40)


if __name__ == '__main__':
    unittest.main(verbosity=2)
