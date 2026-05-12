"""Gera imagens de referência via Higgsfield AI e salva em assets/renders/."""
import os
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = "937398b8-1456-4a49-ba6d-bf3fb0414e64"
SECRET = "d8afc9f9e7df6b7c9854310b7463ec4821a4752c3f84a618449d5ac453f8787d"
BASE = "https://platform.higgsfield.ai"
HEADERS = {
    "Authorization": f"Key {API_KEY}:{SECRET}",
    "Content-Type": "application/json",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "renders")
os.makedirs(OUT_DIR, exist_ok=True)

JOBS = [
    {
        "nome": "lago_ornamental",
        "prompt": (
            "RAW photograph, luxury ornamental pond in premium residential garden, "
            "crystal clear water with koi fish, natural stone edges, lush tropical "
            "landscaping, golden hour, Hasselblad H6D, 8K"
        ),
    },
    {
        "nome": "piscina_natural",
        "prompt": (
            "RAW photograph, natural swimming pool with biological filtration, "
            "crystal clear turquoise water, tropical garden, natural stone beach "
            "entry, premium residential, Phase One IQ4"
        ),
    },
    {
        "nome": "casa_de_maquinas",
        "prompt": (
            "RAW photograph, professional pool equipment room, stainless steel UV "
            "filters and ozone generators, clean organized piping, premium "
            "installation, studio lighting"
        ),
    },
]


def submit(prompt: str) -> str | None:
    r = requests.post(
        f"{BASE}/higgsfield-ai/soul/standard",
        headers=HEADERS,
        json={"prompt": prompt, "aspect_ratio": "16:9", "resolution": "1080p"},
        timeout=30,
    )
    try:
        return r.json().get("request_id")
    except Exception:
        print(f"submit error status={r.status_code} body={r.text[:200]}")
        return None


def poll(rid: str, max_wait_s: int = 300) -> str | None:
    elapsed = 0
    while elapsed < max_wait_s:
        time.sleep(5)
        elapsed += 5
        s = requests.get(f"{BASE}/requests/{rid}/status", headers=HEADERS, timeout=30).json()
        status = s.get("status")
        if status == "completed":
            imgs = s.get("images", [])
            return imgs[0].get("url") if imgs else None
        if status == "failed":
            print(f"  {rid} failed: {s}")
            return None
    print(f"  {rid} timeout after {max_wait_s}s")
    return None


def baixar(url: str, path: str) -> int:
    r = requests.get(url, timeout=60)
    with open(path, "wb") as f:
        f.write(r.content)
    return len(r.content)


def run_job(job: dict) -> dict:
    nome = job["nome"]
    print(f"[{nome}] submetendo...")
    rid = submit(job["prompt"])
    if not rid:
        return {"nome": nome, "ok": False, "erro": "submit_falhou"}
    print(f"[{nome}] request_id={rid} aguardando...")
    url = poll(rid)
    if not url:
        return {"nome": nome, "ok": False, "erro": "geracao_falhou"}
    out = os.path.join(OUT_DIR, f"{nome}.jpg")
    bytes_ = baixar(url, out)
    print(f"[{nome}] salvo em {out} ({bytes_/1024:.1f} KB)")
    return {"nome": nome, "ok": True, "arquivo": out, "url": url}


if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=3) as ex:
        futures = [ex.submit(run_job, j) for j in JOBS]
        results = [f.result() for f in as_completed(futures)]
    print("\n=== RESULTADO ===")
    for r in results:
        print(r)
