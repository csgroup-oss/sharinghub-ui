module.exports = {
    catalogUrl: null,
    catalogTitle: "STAC Browser",
    allowExternalAccess: true, // Must be true if catalogUrl is not given
    allowedDomains: [],
    detectLocaleFromBrowser: true,
    storeLocale: true,
    locale: "en",
    fallbackLocale: "en",
    supportedLocales: [
//      "de",
//      "de-CH",
//      "es",
        "en",
        "fr",
//      "fr-CA",
//      "fr-CH",
//      "it",
//      "it-CH",
//      "ro"
    ],
    apiCatalogPriority: null,
    useTileLayerAsFallback: true,
    displayGeoTiffByDefault: false,
    buildTileUrlTemplate: ({href, asset}) => "https://tiles.rdnt.io/tiles/{z}/{x}/{y}@2x?url=" + encodeURIComponent(asset.href.startsWith("/vsi") ? asset.href : href),
    stacProxyUrl: null,
    pathPrefix: "/",
    historyMode: "history",
    cardViewMode: "cards",
    cardViewSort: "asc",
    showThumbnailsAsAssets: false,
    stacLint: true,
    geoTiffResolution: 128,
    redirectLegacyUrls: false,
    itemsPerPage: 12,
    defaultThumbnailSize: null,
    maxPreviewsOnMap: 50,
    crossOriginMedia: null,
    requestHeaders: {},
    requestQueryParameters: {},
    preprocessSTAC: null,
    authConfig: null,
    blackListProperties : ["sharinghub"]

};

//https://nb.p2.csgroup.space/hub/user-redirect/git-pull?repo=https://oauth2:<t>@gitlab.si.c-s.fr/space_applications/mlops-services/sharinghub-tests/challenge-sample.git&urlpath=lab/tree/challenge-sample.git/sample.ipynb&branch=main
