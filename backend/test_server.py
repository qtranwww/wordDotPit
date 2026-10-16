import os
import unittest
from unittest.mock import patch

from backend.server import extract_response_text, request_ai_answer


class ServerTests(unittest.TestCase):
    def test_extracts_responses_api_output_content(self):
        body = {"output": [{"content": [{"type": "output_text", "text": "pangolin"}]}]}
        self.assertEqual(extract_response_text(body), "pangolin")

    def test_extracts_output_text_when_present(self):
        self.assertEqual(extract_response_text({"output_text": "dolphin"}), "dolphin")

    def test_missing_key_is_no_response(self):
        with patch.dict(os.environ, {}, clear=True):
            result = request_ai_answer("color")
        self.assertEqual(result["status"], "no_response")
        self.assertEqual(result["error"], "missing_api_key")


if __name__ == "__main__":
    unittest.main()
