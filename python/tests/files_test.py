import unittest
from unittest.mock import patch

with patch.dict("os.environ", {"DECKY_PLUGIN_RUNTIME_DIR": "./python/tests/data"}):
    from python.files import Files


class TestFiles(unittest.TestCase):
    files: Files = Files()

    def test_get_file_sha256(self):
        result = self.files.get_file_sha256("/covers/0.jpg")

        cover_sha256 = (
            "ef24abaf50ea055af5cc3d45c586b47a111c33869ca70e738ff99463692711cf"
        )

        self.assertEqual(result, cover_sha256)

    def test_get_cover_base64(self):
        result = self.files.get_game_cover_base64_by_id("0")

        self.assertEqual(
            result.startswith(
                "/9j/7AARRHVja3kAAQAEAAAAUAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAgICAgICAgICAgMCAgIDBAMCAgMEBQQEBAQEBQYFBQUFBQUGBgcHCAcHBgkJCgoJCQwMDAwMDAwMDAwMDAwMDAEDAwMFBAUJBgYJDQsJCw0PDg4ODg8PDAwMDAwPDwwMDAwMDA8MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgDhAJYAwERAAIRAQMRAf/EAPEAAAAGAwEBAAAAAAAAAAAAAAAFBgcICQECBAMKAQABBQEBAQEAAAAAAAAAAAAFAAIDBAYBBwgJEAABAwMDAgQDBQMIBwQBAicBAgMEEQUGACESMQdBIhMIUWEUcYEyIxWRQgmhsdFSYjMkFsFygpJDU1ThojQlF2NEGPDxc9NksoOTo8OU1DW1JhnSlTZ2JzjCs3SEpLRFVWV1ZjdXdygpEQABAwIEAgcGAwUGBAQEBAcBAAIDEQQhMRIFQVFhcYGRIhMG8KGxwdEy4UIUUmJyIwfxgpKiMxWywtJTQ5MkFmM0VAjic4OjRGSz1BdFGP/aAAwDAQACEQMRAD8Ao0+pkf8APc/3j/Tr2+gVRD6mR/z3P94/06VAkh9TI/57n+8f6dKgSWPqZH/Pc/3j/TrhAXVqZMgf8dz"
            ),
            True,
        )


if __name__ == "__main__":
    unittest.main()
