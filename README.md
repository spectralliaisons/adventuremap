# multimap
https://spectralliaisons.github.io/multimap/

Overlay gps tracks on Google Maps with pins for photos and audio taken.


##
How to add a track with images and optional audio:

1. Create a directory for the place in `gps/Places/`. You can copy an existing directory and clear out img/, imgErr/, imgSm/, aud/ and kml/.

2. Add any kml files you may have in kml/. 

3. Add any images you may have in img/. Don't add anything to imgErr/ or imgSm/; these will be filled by a sript you'll run in a bit. If the python script finds GPS coordinates in the image, it will create a map marker on the map that, when clicked, will show the image, image name, and an audio file if one is found with the same name as this image.

4. Add any audio files you may have in aud/. File name sans extension must match an image with valid GPS coordinates or else will not appear.

5. Modify `/info_template.json`, which specifies basic map style for this place:

```
{
  "zoom":15,
  "center":"head of the russian river",
  "mapType":"hybrid",
  "locations":[
    {
      "label":"head of the russian river",
      "loc":{"lat": 39.3816387, "lng": -123.2364948},
      "img":null,
      "aud":null
    }
  ]
}
```

6. Run `gps/python/create gps info.ipynb`. This is the data file for placing images, audio, KML on Google Maps. If your directories are syntactically kosher, this python script will generate info.json files for every directory in gps/Places/. Info.json is loaded in  `script/gpstracker.js `. 
