import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_shared import vtlog, package_name, config
from api_collections import router as clipnest_router, seed_demo_data
import signal
import sys


app = FastAPI(
    title="ClipNest Collections API",
    description="Organize short-form video sources into collections + reel collector",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None
)

# No cookies are used (collector uses X-API-Key, frontend uses no credentials),
# so a permissive CORS policy is safe and works for the browser extension too.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clipnest_router)


@app.on_event("startup")
async def startup_event():
    seed_demo_data()


@app.get("/")
async def root():
    return {"service": package_name, "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


def exit_handler(sig_num, frame):
    vtlog.info("Stopping application: {0}".format(package_name))
    sys.exit()


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, exit_handler)
    signal.signal(signal.SIGINT, exit_handler)

    port = int(config.get("APP_PORT", "5201"))
    host = config.get("APP_HOST", "0.0.0.0")

    vtlog.info("Starting ClipNest Collections API", port=port, host=host)
    uvicorn.run(app, port=port, host=host, log_level="info")
