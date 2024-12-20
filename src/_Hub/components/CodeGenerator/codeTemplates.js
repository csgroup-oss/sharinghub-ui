
export const getPySTACCodeTemplate = {
  step0: {
    language : 'bash',
    header : {
      en : `Install requirements:`,
      fr : `Installation de dépendances requises:`
    },
    text: () => {
      return `pip install requests pystac`;
    }
  },

  step1: {
    language : 'python',
    header : {
      en : `Example of a pystac use case to download assets for this project as Item pystac:`,
      fr : `Example de cas d'utilisation pystac pour télécharger les assets  de ce projet en tant que Item pystac:
      `
    },
    text: ({arg, arg1}) => {
      return `import time
from pathlib import Path

import requests
from pystac import Item, StacIO

AUTH_HEADERS = {"X-Gitlab-Token": "${arg}"}

stac_io = StacIO.default()
stac_io.headers = AUTH_HEADERS
STAC_API_URL = "${arg1}"

# Get STAC item and download his assets

item = Item.from_file(STAC_API_URL, stac_io=stac_io)
timestamp = int(time.time())
download_path = Path.cwd() / f"{Path(item.id).name}-{timestamp}"

for name, asset in item.get_assets().items():
    file_path = download_path / Path(name)
    file_path.parent.mkdir(parents=True, exist_ok=True)

    response = requests.get(asset.href, headers=AUTH_HEADERS)
    response.raise_for_status()

    with file_path.open("wb") as f:
        f.write(response.content)`;
    },
    arg: 'credentials stac_url'
  }
};

export const getEODAGCodeTemplate = {
  step0: {
    language : 'bash',
    header : {
      en : `Install requirements:`,
      fr : `Installation de dépendances requises:`
    },
    text: () => {
      return `pip install eodag`;
    }
  },

  step1: {
    language : 'python',
    header : {
      en : `Example of a pystac use case to download assets for this project as Item pystac:`,
      fr : `Example de cas d'utilisation pystac pour télécharger les assets  de ce projet en tant que Item pystac:
      `
    },
    text: ({arg, arg1, arg2, arg3 }) => {
      return `from pathlib import Path

from eodag import EODataAccessGateway, setup_logging

# We configure logging to output minimum information
setup_logging(verbose=2)

dag = EODataAccessGateway()
dag.add_provider(
    "sharinghub",
    "${arg}",
     auth={
         "type": "HTTPHeaderAuth",
         "credentials": {
             "X-Gitlab-Token": "${arg1}"
        },
     },
)

assets_workspace = Path.cwd() / ("assets")
Path.mkdir(assets_workspace, exist_ok=True)

search_results = dag.search(
    provider="sharinghub",
    productType="${arg2}",
    id="${arg3}",
)
product_paths = dag.download_all(search_results, output_dir=assets_workspace)
print(product_paths)`;
    },
    arg: 'stac_search base_uri credentials'
  }
};

export const getUpdateDVCCodeTemplate = {
  step0: {
    header:{
      en : `DVC configuration:`,
      fr : `Configuration DVC :`
    },
    text: ({storeMode, storeUrl, projectID}) => {
      const remoteUrl = (storeMode === 's3') ? `s3://sharinghub/${projectID}` : storeUrl + projectID;
      const storeConfig = (storeMode === 's3') ?
`dvc remote modify sharinghub endpointurl ${storeUrl}` :
`dvc remote modify sharinghub auth custom \\
dvc remote modify sharinghub custom_auth_header 'X-Gitlab-Token'`;
      return `dvc remote add --default sharinghub ${remoteUrl} \\\n${storeConfig}`;
    },
    arg: 'config'
  },
  step1: {
    header :{
      en:`Setup Credentials:`,
      fr:`Configuration de l'authentification :`
    },
    text: ({storeMode, token}) => {
      return (storeMode === 's3') ?
`dvc remote modify --local sharinghub access_key_id ${token} \\
dvc remote modify --local sharinghub secret_access_key none` :
`dvc remote modify --local sharinghub password ${token}`;
    },
    arg: 'credentials'
  },
  step2: {
    header :{
      en : `Create data directory and add  big files assets to start DVC and Git tracking:`,
      fr : `Créer un répertoire de données et ajouter les fichiers volumineux pour démarrer le suivi DVC et Git :`
    },
    text: () => {
      return `mkdir data \\
echo "very big content" > data/very_big_file.txt \\
dvc add data \\
dvc push \\
git add data.dvc data/.gitignore \\
git commit -m "Add raw data" \\
git push`;
    }
  }
};

export const getPullDVCCodeTemplate = {
  step0: {
    header:{
      en : `Clone the project locally using git, if you haven't already done so:`,
      fr : `Clonez en local le projet avec git, si ce n'est pas le cas :`
    },
    text: ({gitUrl, repo}) => {
      return `git clone ${gitUrl} \\\ncd ${repo}`;
    },
    arg: 'git_url directory'
  },
  step1: {
    header :{
      en:`Setup Credentials and download resources:`,
      fr:`Configuration de l'authentification et téléchargement des données:`
    },
    text: ({storeMode, token}) => {
      const credsConfig = (storeMode === 's3') ?
`dvc remote modify --local sharinghub access_key_id ${token} \\
dvc remote modify --local sharinghub secret_access_key none` :
`dvc remote modify --local sharinghub password ${token}`;
        return `${credsConfig} \\\ndvc pull`;
    },
    arg: 'credentials dvc_pull'
  }
};

export const getMlflowCodeTemplate = {
  step0: {
    language : 'bash',
    header : {
      en : `MLflow Tracking remote:`,
      fr : `MLflow Tracking remote:`
    },
    text: ({arg}) => {
      return `${arg}`;
    },
    arg: 'mlflow_tracking_url'
  },
  step1: {
    language : 'bash',
    header : {
      en : `Install requirements:`,
      fr : `Installation de dépendances requises:`
    },
    text: () => {
      return `pip install mlflow`;
    }
  },
  step2: {
    language : 'bash',
    header : {
      en : `Credentials setup:`,
      fr : `Configuration d'authentification:`
    },
    text: ({arg, arg1}) => {
      return `export MLFLOW_TRACKING_TOKEN=${arg}
export LOGNAME=${arg1}`;
    },
    arg: 'credentials'
  },
  step3: {
    language : 'python',
    header : {
      en : `Use case example with MLflow experiments:`,
      fr : `Example de cas d'utilisation avec MLflow experiments:
      `
    },
    text: ({arg, arg1}) => {
      return `import mlflow

mlflow.set_tracking_uri("${arg}")
mlflow.set_experiment("${arg1}")
mlflow.autolog()
# Adapt your logic training ....`;
    },
    arg: 'mlflow_url mlflow_tracking_id'
  }
};
