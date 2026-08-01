from vtutils.confparser import env_config
from vtutils.misc import get_project_root
from vtutils.vtlogger import initLog, getLog
from vtstorage.local_store import LocalDocStore
import sys
import os

ROOT_DIR = get_project_root()
sys.path.append(ROOT_DIR)

package_name = "clipnest_api"
vtlog = initLog(package_name)

config = env_config("{0}/.env".format(ROOT_DIR))

# Zero-infrastructure local persistence (no MongoDB required).
vtstorage = LocalDocStore(
    os.path.join(ROOT_DIR, "data", "clipnest.sqlite"),
    default_database="clipnest",
)

# Optional shared key that developer-run collectors must present. When empty,
# collector endpoints are open (convenient for local development).
INGEST_API_KEY = config.get("INGEST_API_KEY") or ""
