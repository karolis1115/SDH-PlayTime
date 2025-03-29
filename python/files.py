# https://www.geeksforgeeks.org/sha-in-python/
import hashlib

import base64
import os
import sys

data_dir = os.environ["DECKY_PLUGIN_RUNTIME_DIR"]


class Files:
    def get_file_base64(self, path: str):
        with open(path, "rb") as image_file:
            base64_bytes = base64.b64encode(image_file.read())

            return base64_bytes.decode()

    def get_game_cover_base64_by_id(self, game_id: str):
        if os.path.exists(f"{data_dir}/covers/{game_id}.png"):
            return self.get_file_base64(f"{data_dir}/covers/{game_id}.png")

        if os.path.exists(f"{data_dir}/covers/{game_id}.jpg"):
            return self.get_file_base64(f"{data_dir}/covers/{game_id}.jpg")

        raise Exception("Can not find cover image for gameId: ", game_id)

    # NOTE(ynhhoJ): https://stackoverflow.com/a/44873382
    def get_file_sha256(self, path: str):
        if sys.version_info < (3, 11):
            raise Exception(
                "Minimum required version of Python is 3.11.0 which supports: hashlib.file_digest"
            )

        if not os.path.exists(f"{data_dir}/{path}"):
            raise Exception(
                "Can not find file at path: ",
                f"{data_dir}/{path}",
            )

        with open(f"{data_dir}/{path}", "rb", buffering=0) as f:
            return hashlib.file_digest(f, "sha256").hexdigest()
