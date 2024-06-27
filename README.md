# multimap

## See it in action
https://spectralliaisons.github.io/multimap/

## Overlay gps tracks on Mapbox with markers places where photos and audio were taken, and colorized points for other locations.
![an image examplar](./misc/screenshot1.png)

## Areas indicated via geojson polygons are also supported; e.g. California watersheds:
![an image examplar](./misc/screenshot2.png)

## Dependencies

### Amazon S3 & CloudFront
Assets do not technically need to be hosted via Amazon S3 with CloudFront, though rake tasks (see `Rakefile`) are provided to facilitate working with Amazon CLI.

1. Create an Amazon AWS S3 bucket that will host the geojson, images, audio files, and location json assets. You may optionally follow [these steps](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html) to use Amazon CloudFront with S3. You'll likely want to create another bucket to host the web client built.
2. Install [AWS CLI](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/index.html) if you intend to use the rake tasks in `Rakefile` to upload assets. This file indicates the environment variables that specify the S3 bucket for the assets decribed in step 1 above, another S3 bucket for the website build, and associated CloudFront distributions for these buckets.

### Python
The Python notebook `gps/python/process_places.ipynb` analyzes your assets and creates json files that tell the web client which map markers to create and what images, audio files, text, or links to display at certain locations.

```
pip install notebook
pip install Pillow
pip install ipywidgets
pip install wand
pip install numpy
```

### Node modules
For building the web client.

#### Setup
`npm install`

### Local build
1. `npm start`
2. open http://localhost:3000/

Note that you'll need to upload assets in order for the map markers to work even for a local build (see "Amazon S3 & CloudFront" step 1 and step 7 below).

## Adding a track with images and optional audio:

1. Create a directory for the place in `gps/s3/`. Copy `gps/_PlaceTemplate/` to use as a template.

2. Add any geojson files you may have to `geojson/`. I convert kml files from my gps and [caltopo](https://caltopo.com/m/A912) to geojson using the VSCode Geo Data Viewer extension (randomfractalsinc.geo-data-viewer). Filename prefixes indicate how the data will be rendered (see Map.js `addPoints()`):
- `river-`: blue line
- `river-sm-`: thin blue line (no, not that one! -- e.g. to help differentiate river systems)
- `track-`: pink line (in my case this indicates my travel via physical gps tracker)
- `cenote-`: blue dot
- `waypoint-`: pink dot (I use this for manmade points of interest)
- `ruin-`: pink dot

These colors (and many other styles) can be customized in `src/custom/Config.js`, as described in point 8 below.

### e.g. differentiated river system
![an image examplar](./misc/screenshot3.png)

### e.g. differentiating water from archeological features. Note how cenotes form the rim of the Chicxulub impact crater!
![an image examplar](./misc/screenshot4.png)

### geojson feature properties may include an HTML "description" property that will be displayed in a modal window when the feature is clicked; e.g. rendering data from [East Bay Hill People](https://eastbayhillpeople.com/map/).
![an image examplar](./misc/screenshot5.png)

3. Add any images you may have in `imgOrig/`. Don't add anything to `imgErr/`, `imgLg/`, or `imgSm/`; these will be filled by a sript you'll run in a bit. If the python script finds GPS coordinates in the image, it will create a map marker on the map that, when clicked, will show the image, image name, and an audio file if one is found with the same name as this image. No locations will be included for images with the prefix `nomarker-` though they still will have large and small copies created--this is useful if you don't want to expose specific locations of images but still show the images in, say, the HTML description of a geojson feature.

4. Add any audio files you may have in `aud/`. File name sans extension must match an image with valid GPS coordinates or else will not appear.

5. Modify `/info_template.json`, which specifies basic map style for this place: Add a `loc` at where you want to center the map with `label` and match `center` to `label`; e.g.:

```
{
  "local": true,
  "zoom": 15,
  "center": "head of the russian river",
  "locations": [
    {
      "label": "head of the russian river",
      "loc": {"lat": 39.3816387, "lng": -123.2364948},
      "img": null,
      "aud": null,
      "link": null
    }
  ],
  "desc": "<div>You can add html here for an informational footer.</div>"
}
```

`img` is an optional property specifying an image name in the `imgOrig/` directory; if the image doesn't contain a geolocation in its metadata, a marker can still be placed for it at the location specified by `loc`.

`local` is an optional property that only shows this place in the menu during development (at localhost:3000).

`link` is an optional property that can allow a specified image to function as a link with specified text; e.g, taking the form:
```
{
  "text": "TAKE ME AWAY",
  "icon": "{{material icon key}}",
  "src": "{{url of an image to be placed on the map at the geolocation specified by `loc`}}",
  "destination": "{{url of link destination}}"
}
```

If no `img` is specified but `link` specifies `src` and `destination`, then an image will still be shown at the specified location. The image will be from the `src` url. When the user clicks the corresponding marker, a modal window will show the text, image, and a button that redirects the user to the link destination. If the user clicks the image in this window, nothing happens (whereas images displayed via `img` that are clicked open the full-sized image in a new browser tab).

Note that combining `loc` and `link` allows you to show images at locations that aren't hosted e.g. via S3.

6. Run the [Jupyter Notebook](http://jupyter.org/install.html) `gps/python/process_places.ipynb` <sup>1</sup>. This is the data file for placing images, audio, geojson on the map. If your directories are syntactically kosher, this python script will generate info.json files for every directory in gps/s3/.

7. Upload `gps/s3/` to wherever you host your assets. You may need to ensure that these files are publicly visible. To troubleshoot the directory format, see `d` in `src/Assets.js`

8. Configure your site's settings by saving a copy of `src/custom/Config-template.js` as `src/custom/Config.js`. This file contains your `mapboxgl.accessToken`, s3 bucket url, and map settings and geojson display styles. You can customize the general site and map styles by modifying a copy of `src/custom/overrides-template.scss` as `src/custom/overrides.scss`. Any other files in the `src/custom` directory are gitignored so you can more easily swap between entirely separate data sources and styles.

9. View `public/index.html` at `localhost:3000` to see your new favorite map.

<sup>1</sup> Available as rake tasks (run ```rake -T``` to see a list of commands).  See the top of the Rakefile for all environment variables needed to interface with S3 and CloudFront. E.g. to just push media files for a directory named Somewhere in `gps/s3/Somewhere`, run: `rake push:media place=Somewhere`

### Production build

### Deploy to Github Pages
`npm run deploy` (I follow steps for deploying to Github Pages in the [React deployment docs](https://create-react-app.dev/docs/deployment))

### Deploy to S3
`rake push:site` will build and push the site to the S3 bucket located at the environment variable `siteS3Path` and create an invalidation for CloudFront ID specified in the environment variable `siteCFID`.