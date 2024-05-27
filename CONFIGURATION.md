# Configuration

You can configure the SharingHub UI through multiple sources:

- Config File locate in [config.js](./config.js)

> Note: config variable always overwrite at launch script when values are set.

**Table of Contents:**

- [Languages](#languages)
  - [Adding a new language](#adding-a-new-language)
- [Themes](#themes)
- [Basemaps](#basemaps)
- [Additional metadata fields](#additional-metadata-fields)
  - [Example](#example)
- [Customize through root catalog](#customize-through-root-catalog)
  - [catalogTitle](#catalogtitle)
  - [apiUrl](#apiurl)
  - [docsUrl](#docsurl)
  - [storeLocale](#storelocale)
  - [locale](#locale)
  - [fallbackLocale](#fallbacklocale)
  - [supportedLocales](#supportedlocales)
  - [stacLint](#staclint)
  - [historyMode](#historymode)
    - [`history`](#history)
    - [`hash`](#hash)
  - [pathPrefix](#pathprefix)
  - [blackListProperties](#blacklistproperties)

## Languages

SharingHub UI can be translated into other languages and can localize number formats, date formats etc.

You need to change the [`locale`](docs/options.md#locale) and [`supportedLocales`](docs/options.md#supportedlocales) settings to select the default language and the languages available to users.

The following languages are currently supported:

- en: English
- fr: French (Canada, France, Switzerland)

We manage the translations in Crowdin, please see <https://crowdin.com/project/stac-browser/> for details.

### Adding a new language

You can translate STAC Browser into other languages.
You can also use one of the existing languages and provide an alternate version for a specifc country, e.g. a Australian English (en-AU) version of the US-English language pack (en).

**Please follow this guide:**

- Copy the `en` folder (or any other language without a country code that you want to base the translation on).
  - Note: If you start with the `en` folder, you have to remove the leading `//` from the line `// { fields: require('./fields.json') }` in the file `default.js`.
- Name the new folder according to [RFC5646](https://www.rfc-editor.org/rfc/rfc5646).
- Add the language to the list of supported locales ([`supportedLocales`](docs/options.md#supportedlocales)) in the `config.js` file.
- Add the language to the [list of languages in this README file](#languages).
- Add yourself to the list of code owners (`.github/CODEOWNERS`) for this language (we'll invite you to this repository after you've opened a PR). **Persons contributing languages are expected to maintain them long-term! If you are not able to maintain the language pack, please indicate so in the PR and we'll release it separately.**
- Translate the `.json` files, most importantly `config.json`, `fields.json` and `texts.json`.
  - Please note that you never need to translate any object keys!
  - If you base your language on another existing language (e.g. create `en-IN` based on `en`) you can delete individual files and import existing files from other languages in `default.js`.
- Adapt the `datepicker.js` and `duration.js` files to import the existing definitions from their corresponding external packages, but you could also define the specifics yourself.
- Check that your translation works by running the development server (`npm start`) and navigating to the STAC Browser instance in your browser (usually `http://localhost:8080`).
- Once completed, please open a pull request and we'll get back to you as soon as possible.

## Themes

You can customize STAC Browser in the `src/theme` folder. It contains Sass files (a CSS preprocessor), which you can change to suit your needs.

The easiest solution is to start with the `variables.scss` file and customize the options given there.
For simplicity we just provide some common options as default, but you can also add and customize any Bootstrap variable,
see <https://getbootstrap.com/docs/4.0/getting-started/theming/> for details.

The file `page.scss` contains some Sass declarations for the main sections of STAC Browser and you can adopt those to suit your needs.

If you need even more flexibility, you need to dig into the Vue files and their dependencies though.

## Basemaps

The file `basemaps.config.js` contains the configuration for the basemaps.
You can update either just the `BASEMAPS` object or you can write a custom function `configureBasemap` that returns the desired options for [vue2-leaflet](https://vue2-leaflet.netlify.app/).
[XYZ](https://vue2-leaflet.netlify.app/components/LTileLayer.html#props) and [WMS](https://vue2-leaflet.netlify.app/components/LWMSTileLayer.html#props) basemaps are supported and have different options that you can set.

## Additional metadata fields

The metadata that STAC Browser renders is rendered primarily through the library [`stac-fields`](https://www.npmjs.com/package/@radiantearth/stac-fields).
It contains a lot of rules for rendering [many existing STAC extensions](https://github.com/stac-utils/stac-fields/blob/main/fields.json) nicely.
Nevertheless, if you use custom extensions to the STAC specification you may want to register your own rendering rules for the new fields.
This can be accomplished by customizing the file [`fields.config.js`](./fields.config.js).
It uses the [Registry](https://github.com/stac-utils/stac-fields/blob/main/README.md#registry) defined in stac-fields to add more extensions and fields to stac-fields and STAC Browser.

To add your own fields, please consult the documentation for the [Registry](https://github.com/stac-utils/stac-fields/blob/main/README.md#registry).

### Example

If you have a custom extension with the title "Radiant Earth" that uses the prefix `radiant:` you can add the extension as such:

```js
Registry.addExtension('radiant', 'Radiant Earth');
```

If this extension has a boolean field `radiant:public_access` that describes whether an entity can be accessed publicly or not, this could be described as follows:

```js
Registry.addMetadataField('radiant:public_access', {
  label: "Data Access",
  formatter: value => value ? "Public" : "Private"
});
```

This displays the field (with a value of `true`) in STAC Browser as follows: `Data Access: Public`.

The first parameter is the field name, the second parameter describes the field using a ["field specification"](https://github.com/stac-utils/stac-fields/blob/main/README.md#fieldsjson).
Please check the field specification for available options.

-------------------------------------------------------------

## Customize through root catalog

You can also provide a couple of the config options through the root catalog.

### catalogTitle

The default title shown if no title can be read from the root STAC catalog.

### apiUrl

The link of SharingHub Server api

### docsUrl

The link of SharingHub official documentation.

### storeLocale

If set to `true`, stores the locale selected by the user in the `localStorage` of the browser.
Otherwise, doesn't store the locale across browser sessions.

### locale

The default language to use for STAC Browser, defaults to `en` (English).
The language given here must be present in `supportedLocales`.

### fallbackLocale

The language to use if individual phrases are not available in the default language, defaults to `en` (English).
The language given here must be present in `supportedLocales`.

### supportedLocales

A list of languages to show in the STAC Browser UI.
The languages given here must have a corresponding JS and JSON file in the `src/locales` folder,
e.g. provide `en` (English) for the files in `src/locales/en`.

In CLI, please provide the languages separated by a space, e.g. `--supportedLocales en de fr it`

Please note that only left-to-right languages have been tested.
I'd need help to test support for right-to-left languages.

### stacLint

***experimental***

Enables or disables a feature that validates the STAC catalog when opening the "Source Data" popup.
Validation uses the external service [staclint.com](https://staclint.com).

Validation is automatically disabled in the following cases:

- the host of a catalog is `localhost`, `127.0.0.1` or `::1`

### historyMode

***build-only option***

#### `history`

STAC Browser defaults to *history mode* (value `history` in the config file), which is based on
[HTML5 History Mode](https://v3.router.vuejs.org/guide/essentials/history-mode.html#html5-history-mode).
It gives the best experience and allows search engines to better crawl STAC Browser so that it can be found in search engines.

**History mode requires that you enable custom URL rewriting rules on your host/server**, otherwise people can not reload pages
or share URLs without getting a "page not found" error (404).
The following link explains the details and provides examples for various common server software:
**<https://v3.router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations>**

Please note that you can't host any other files in the folder that STAC Browser is in as the URL rewriting
will redirect all requests to these (sub)-folders and included files to STAC Browser.
This also excludes hosting your STAC catalog in the STAC Browser (sub-)folders.

#### `hash`

If your host/server doesn't support URL rewriting or you experience other related problems, you can enable *hash mode*.
Either set this option to `hash` in the config file or append `--historyMode=hash` when running or building.
Known hosts that require hash mode are Amazon S3 and GitHub Pages.

### pathPrefix

***build-only option***

If you don't deploy the STAC Browser instance at the root path of your (sub) domain, then you need to set the path prefix
when building (or running) STAC Browser.

```bash
npm run build -- --pathPrefix="/ui/"
```

This will build STAC Browser in a way that it can be hosted at `https://sharinghub.instance/ui` for example.
Using this parameter for the dev server will make STAC Browser available at `http://localhost:8080/ui`.

### blackListProperties

The list of properties not to be displayed in the popriety view of the displayed STAC element.
