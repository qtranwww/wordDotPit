import json
import os
import time
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def extract_response_text(body: dict) -> str:
    if isinstance(body.get("output_text"), str) and body["output_text"].strip():
        return body["output_text"].strip()
    for output_item in body.get("output", []):
        for content_item in output_item.get("content", []):
            text = content_item.get("text")
            if isinstance(text, str) and text.strip():
                return text.strip()
    for choice in body.get("choices", []):
        text = choice.get("message", {}).get("content")
        if isinstance(text, str) and text.strip():
            return text.strip()
    return ""


def build_provider_request(category: str):
    provider = os.getenv("AI_PROVIDER", "openrouter").lower()
    prompt = f"Reply with exactly one English word belonging to this category: {category}."

    if provider == "openrouter":
        api_key = os.getenv("OPENROUTER_API_KEY")
        endpoint = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions")
        model = os.getenv("OPENROUTER_MODEL", "openrouter/free")
        payload = {"model": model, "messages": [{"role": "user", "content": prompt}], "max_tokens": 20, "temperature": 0}
        headers = {"Authorization": f"Bearer {api_key or ''}", "Content-Type": "application/json", "HTTP-Referer": "http://localhost:8000", "X-Title": "wordDotPit"}
    elif provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        endpoint = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/responses")
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        payload = {"model": model, "input": prompt, "max_output_tokens": 20, "temperature": 0}
        headers = {"Authorization": f"Bearer {api_key or ''}", "Content-Type": "application/json"}
    else:
        return None, "unsupported_provider"

    if not api_key or api_key in {"your-api-key", "your-openrouter-api-key"}:
        return None, "missing_api_key"
    request = urllib.request.Request(endpoint, data=json.dumps(payload).encode("utf-8"), headers=headers)
    return request, None


def request_ai_answer(category: str, attempts: int = 2) -> dict:
    request, request_error = build_provider_request(category)
    if request_error:
        return {"status": "no_response", "error": request_error, "raw_output": None, "latency_ms": None}

    started = time.perf_counter()
    last_error = "request_failed"
    for _ in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                raw_output = response.read().decode("utf-8")
            body = json.loads(raw_output)
            text = extract_response_text(body)
            if not text:
                return {"status": "no_response", "error": "empty_api_response", "raw_output": raw_output, "latency_ms": round((time.perf_counter() - started) * 1000)}
            return {"status": "received", "raw_output": raw_output, "raw_answer": text, "latency_ms": round((time.perf_counter() - started) * 1000)}
        except urllib.error.HTTPError as error:
            try:
                detail = error.read().decode("utf-8")
            except OSError:
                detail = ""
            last_error = f"http_{error.code}"
            print(f"AI request failed: {last_error} {detail[:500]}")
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as error:
            last_error = type(error).__name__
            print(f"AI request failed: {last_error}")
    return {"status": "no_response", "error": last_error, "raw_output": None, "latency_ms": round((time.perf_counter() - started) * 1000)}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_POST(self):
        if self.path != "/api/ai-answer":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length))
            result = request_ai_answer(str(payload.get("category", "color")))
            encoded = json.dumps(result).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
        except (ValueError, json.JSONDecodeError):
            self.send_error(400, "Invalid JSON")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    print(f"wordDotPit server listening on http://localhost:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
