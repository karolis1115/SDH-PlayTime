import os
import tempfile
import time
import unittest
from unittest.mock import patch

with patch.dict("os.environ", {"DECKY_PLUGIN_RUNTIME_DIR": "./python/tests/data"}):
    from python.files import Files

CHUNK_SIZE = 16 * 1024 * 1024


class TestFiles(unittest.TestCase):
    files: Files = Files()

    def test_get_file_sha256(self):
        start_time = time.perf_counter()  # Start timing
        # result = self.files.get_file_sha256("./python/tests/data/covers/0.jpg")
        result = self.files.get_file_sha256(
            "./python/tests/data/covers/Monster Hunter 4 Ultimate.3ds"
        )

        end_time = time.perf_counter()  # End timing
        elapsed_time = end_time - start_time  # Compute execution time

        print(f"Execution SHA256 time: {elapsed_time:.6f} seconds")

        cover_sha256 = (
            "ef24abaf50ea055af5cc3d45c586b47a111c33869ca70e738ff99463692711cf"
        )

        self.assertEqual(result, cover_sha256)


if __name__ == "__main__":
    unittest.main()
