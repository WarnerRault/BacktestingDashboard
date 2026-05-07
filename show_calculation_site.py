import json
import shutil
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path


ROOT = Path(__file__).resolve().parent
FRONTEND_URL = "http://127.0.0.1:5173"
DATA_PATH = ROOT / "public" / "data.json"


def command_path(name):
    path = shutil.which(name)
    if path:
        return path

    if sys.platform == "win32":
        return shutil.which(f"{name}.cmd")

    return None


def ensure_node_modules():
    npm = command_path("npm")
    if not npm:
        raise RuntimeError("npm was not found. Install Node.js, then run this again.")

    if not (ROOT / "node_modules").exists():
        print("Installing React, Vite, and Tailwind dependencies...")
        subprocess.check_call([npm, "install"], cwd=ROOT)

    return npm


def write_data_json(data, path=DATA_PATH):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    return path


def wait_for_site(url, attempts=60):
    for _ in range(attempts):
        try:
            with urllib.request.urlopen(url, timeout=1):
                return True
        except OSError:
            time.sleep(0.5)

    return False


def start_process(command):
    kwargs = {
        "cwd": ROOT,
        "stdin": subprocess.DEVNULL,
        "stdout": subprocess.DEVNULL,
        "stderr": subprocess.DEVNULL,
    }

    if sys.platform == "win32":
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        startupinfo.wShowWindow = subprocess.SW_HIDE

        kwargs["startupinfo"] = startupinfo
        kwargs["creationflags"] = (
            subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW
        )
    else:
        kwargs["start_new_session"] = True

    return subprocess.Popen(command, **kwargs)


def stop_process(process):
    if process is None:
        return

    if process.poll() is not None:
        return

    if sys.platform == "win32":
        subprocess.run(
            ["taskkill", "/PID", str(process.pid), "/T", "/F"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        return

    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()


def open_website(create_new_tab_on_run):
    if create_new_tab_on_run:
        webbrowser.open(FRONTEND_URL, new=2, autoraise=True)
        return

    webbrowser.open(FRONTEND_URL, new=0, autoraise=True)


def start_website(data, create_new_tab_on_run=False):
    npm = ensure_node_modules()
    json_path = write_data_json(data)

    print(f"Wrote JSON data to {json_path}")
    site_was_already_running = wait_for_site(FRONTEND_URL, attempts=1)

    if site_was_already_running:
        print(f"Vite is already running at {FRONTEND_URL}")
    else:
        print("Starting Vite in the background...")
        start_process([npm, "run", "dev"])

    if wait_for_site(FRONTEND_URL):
        if create_new_tab_on_run:
            print(f"Opening React + Tailwind site in a new tab at {FRONTEND_URL}")
            open_website(create_new_tab_on_run)
        elif site_was_already_running:
            print("Updated data.json. Existing browser tab will update automatically.")
        else:
            print(f"Opening React + Tailwind site at {FRONTEND_URL}")
            open_website(create_new_tab_on_run)
    else:
        print("The site is still starting. Open this URL when Vite is ready:")
        print(FRONTEND_URL)


if __name__ == "__main__":
    sample_data = {
        "expression": "20 + 44",
        "result": 20 + 44,
    }
    start_website(sample_data)
