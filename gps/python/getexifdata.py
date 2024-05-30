from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def get_exif_data(im):
    exif = {}
    
    try:
        info = im._getexif()

        if info:
            for tag, value in info.items():
                k0 = TAGS.get(tag, tag)
                if k0 != "GPSInfo":
                    exif[k0] = value
                else:
                    exif[k0] = {GPSTAGS.get(t, t): value[t] for t in value}
    except AttributeError:
        pass
    
    return exif


def _get(data, key):
    return data[key] if key in data else None

def _to_decimal(value):
    [d, m, s] = value
    return d + (m / 60.0) + (s / 3600.0)

def get_lat_lng(exif):
    if "GPSInfo" in exif:
        gps = exif["GPSInfo"]

        _lat = _get(gps, "GPSLatitude")
        _lng = _get(gps, "GPSLongitude")
        
        _latRef = _get(gps, "GPSLatitudeRef")
        _lngRef = _get(gps, "GPSLongitudeRef")
        
        if _lat and _latRef and _lng and _lngRef:
            lat = _to_decimal(_lat) if _latRef == "N" else 0 - _to_decimal(_lat)
            lng = _to_decimal(_lng) if _lngRef == "E" else 0 - _to_decimal(_lng)
            return (lat, lng)
     
    return (None, None)

def get_date(exif):
    return exif.get('DateTimeOriginal') or exif.get('DateTime') or ""