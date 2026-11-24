"""
DevPulse Unified Dual-Server Launcher Script
Starts both FastAPI Backend (port 8000) and Next.js Frontend (port 3000).
Usage:
  python start_devpulse.py
"""
import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("==================================================")
    print("   DEVPULSE - COMPLETE DATA ANALYTICS PLATFORM    ")
    print("   Engineering Intelligence & Autonomous DORA     ")
    print("==================================================")
    print("Starting FastAPI Backend on http://localhost:8000...")
    
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=backend_dir
    )

    print("Starting Next.js Frontend on http://localhost:3000...")
    frontend_proc = subprocess.Popen(
        "npm run dev",
        cwd=frontend_dir,
        shell=True
    )

    print("\n[OK] Both services active:")
    print(" - Backend REST API: http://localhost:8000 (Swagger Docs: http://localhost:8000/docs)")
    print(" - Frontend Enterprise SaaS: http://localhost:3000")
    print("\nPress Ctrl+C to terminate both servers.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down DevPulse servers gracefully...")
        if sys.platform == "win32":
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(backend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            backend_proc.terminate()
            frontend_proc.terminate()
        print("DevPulse shutdown complete.")

if __name__ == "__main__":
    main()
