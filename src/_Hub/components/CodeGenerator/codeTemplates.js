
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
      return `import requests
from pystac import Item, StacIO
from pathlib import Path

stac_io = StacIO.default()
stac_io.headers = {"X-Gitlab-Token": "${arg}"}
STAC_APIURL = "${arg1}"

# Get current item with and download his assets
item : Item = Item.from_file(STAC_APIURL, stac_io=stac_io)
download_path : Path = Path.cwd() / item.properties["title"]
download_path.mkdir(parents=True, exist_ok=True)

for name, asset in item.get_assets().items():

    response = requests.get(asset.href)
    response.raise_for_status()
    composite_name = name.split('/')

    new_path = download_path
    for folder in composite_name[:-1]:
        new_path /= folder
        new_path.mkdir(parents=True, exist_ok=True)

    asset_filename = download_path / name
    with open(asset_filename, 'wb+') as fs_writer:
        fs_writer.write(response.content)`;
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
      return `pip install git+https://github.com/CS-SI/eodag-cube.git@develop`;
    }
  },

  step1: {
    language : 'python',
    header : {
      en : `Example of a pystac use case to download assets for this project as Item pystac:`,
      fr : `Example de cas d'utilisation pystac pour télécharger les assets  de ce projet en tant que Item pystac:
      `
    },
    text: ({arg, arg1, arg2, arg3, arg4 }) => {
      return `from eodag import EODataAccessGateway

dag = EODataAccessGateway()
dag.update_providers_config("""
    sharinghub:
        search:
            type: StacSearch
            api_endpoint: ${arg}
        products:
            GENERIC_PRODUCT_TYPE:
                productType: '{productType}'
        download:
            type: HTTPDownload
            base_uri: ${arg1}
            flatten_top_dirs: False
        auth:
            type: HTTPHeaderAuth
            headers:
                X-Gitlab-Token: "{token}"
            credentials:
                token: ${arg2}
""")
dag.set_preferred_provider("sharinghub")
dag.fetch_product_types_list("sharinghub")
search_results, total_count = dag.search(
    provider="sharinghub",
    productType="${arg3}",
    id="${arg4}",
)
product_paths = dag.download_all(search_results)
print(product_paths)`;
    },
    arg: 'stac_search base_uri credentials'
  }
};

export const getUpdateDVCCodeTemplate = {
  step0: {
    header:{
      en : `DVC remote URL`,
      fr : `DVC remote URL`
    },
    text: ({arg}) => {
      return `${arg}`;
    },
    arg: 'dvc_url'
  },
  step1: {
    header:{
      en : `Configuration storage remote for DVC:`,
      fr : `Configuration storage remote pour DVC:`
    },
    text: ({arg}) => {
      return `dvc remote add -d shstore ${arg} \\
dvc remote modify shstore auth custom \\
dvc remote modify shstore custom_auth_header 'X-Gitlab-Token' \\
dvc remote default shstore`;
    },
    arg: 'dvc_url'
  },
  step2: {
    header :{
      en:`Setup Credientials:`,
      fr:`Configuration de token d'autentification:`
    },
    text: ({arg}) => {
      return `dvc remote modify --local shstore password ${arg}`;
    },
    arg: 'credentials'
  },
  step3: {
    header :{
      en : `Create data directory and add  big files assets to start DVC and Git tracking:`,
      fr : `Créer un répertoire de données et ajouter les fichiers volumineux pour démarrer le suivi DVC et Git:`
    },
    text: () => {
      return `mkdir data \\
echo "very big content" > data/very_big_file.txt \\
dvc add data \\
git add data.dvc data/.gitignore \\
git commit -m "Add raw data"\` `;
    }
  },

  step6: {
    header :{
      en : `Push your changes on remote server:`,
      fr : `Sauvegarder vos changements sur le server:`
    },
    text: () => {
      return `git push \\
dvc push`;
    }
  }

};

export const getPullDVCCodeTemplate = {
  step0: {
    header:{
      en : `Clone the project locally using git, if you haven't already done so:`,
      fr : `Clonez en local le projet avec git, si ce n'est pas le cas:`
    },
    text: ({arg, arg1}) => {
      return `git clone ${arg} \\
cd ${arg1}`;
    },
    arg: 'git_url directory'
  },
  step1: {
    header :{
      en:`Setup credentials and download resources:`,
      fr:`Configurez le token d'autentification et téléchargez les ressources`
    },
    text: ({arg}) => {
      return `dvc remote modify --local shstore password ${arg} \\
dvc pull`;
    },
    arg: 'credentials'
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
    text: ({arg}) => {
      return `export MLFLOW_TRACKING_TOKEN=${arg}`;
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
