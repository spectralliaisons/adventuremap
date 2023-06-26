#!/usr/bin/env python
# coding: utf-8

# # Initialization

# In[1]:


from PIL import Image, ExifTags
from wand.image import Image as WandImage
import getexifdata, glob, os, json, io, shutil, logprogress, numpy

DIR_PLACES = "../s3/"
DIR_PREFIX_IGNORE = DIR_PLACES + "_"
DIR_GEODAT = "geojson/"
DIR_AUD = "aud/"
DIR_IMG_ORIG = "imgOrig/"
DIR_IMG_LG = "imgLg/"
DIR_IMG_THUMBNAIL = "imgSm/"
DIR_IMG_ERR = "imgErr/"

IMG_FORMAT = ".jpg"
AUD_FORMAT = ".mp3"

INPUT_JSON = "info_template.json"
OUTPUT_JSON = "info.json"
SMRY_JSON = "all_rivers.json"

SIZE_IMG_THUMBNAIL = 400

# likely prefixes for original images named by the os when pic taken
BLACKLIST_FLABEL_PREFIX = ["IMG", "MVIMG", "PANO"]

####################
###
### helper functions
###

def valid_place(path):
    return not path.startswith(DIR_PREFIX_IGNORE)

# if dir exists, clear it
def init_dir(path):
    if os.path.isdir(path):
        shutil.rmtree(path)
    os.makedirs(path)

def strip_dir(fpath, dir):
    i = fpath.index(dir)+len(dir)
    return fpath[i:len(fpath)]

def get_fname(fpath):
    return fpath.split("/")[-1]

def get_flabel(fpath, ext):
    return get_fname(fpath).replace(ext, "")

def find_audio_for_img(label):
    for fpath in glob.glob(base_path + DIR_AUD + "*" + AUD_FORMAT):
        flabel = get_flabel(fpath, AUD_FORMAT)
        if flabel == label:
            return strip_dir(fpath, "/" + DIR_AUD)
    return None # no warning needed

def for_img_with_exif(fpath, fnExif, fnNoExif):
    im = get_im(fpath)
    edat = getexifdata.get_exif_data(im)
    lat, lng = getexifdata.get_lat_lon(edat)
    if lat == None or lng == None:
        if fnNoExif != None:
            fnNoExif(fpath, im)
        return None
    else:
        if fnExif != None:
            fnExif(fpath, im)
        return {"lat":lat, "lng":lng}

def get_im(fpath):
    try:
        return Image.open(fpath)
    except:
        return as_pil_image(fpath)

# convert HEIF images to PIL format
def as_pil_image(fpath):
    wand_im = WandImage(filename=fpath)
    img_buffer = numpy.asarray(bytearray(wand_im.make_blob(format='png')), dtype='uint8')
    bytesio = io.BytesIO(img_buffer)
    return Image.open(bytesio)

def get_gps_for_fpath(fpath):
    return for_img_with_exif(fpath, None, None)

def get_date_for_fpath(fpath):
    im = Image.open(fpath)
    edat = getexifdata.get_exif_data(im)
    if "DateTime" in edat:
        date = edat["DateTime"]
    elif "DateTimeOriginal" in edat:
        date = edat["DateTimeOriginal"]
    else:
        date = "(Date Unknown)"
    return date

try:
    to_unicode = unicode
except NameError:
    to_unicode = str    

def find_geodat():
    return [strip_dir(fpath, "/" + DIR_GEODAT) for fpath in glob.glob(base_path + DIR_GEODAT + "*.geojson")]

def reorient_img(fileName, height):
    # thanks storm_to : http://stackoverflow.com/questions/4228530/pil-thumbnail-is-rotating-my-image 
    fpath = base_path + DIR_IMG_LG + fileName
    image=Image.open(fpath)
    exif_raw = image._getexif()
    if (exif_raw):
        for orientation in ExifTags.TAGS.keys() : 
            if ExifTags.TAGS[orientation]=='Orientation' : break 
        exif=dict(exif_raw.items())

        try:
            if   exif[orientation] == 3 : 
                image=image.rotate(180, expand=True)
            elif exif[orientation] == 6 : 
                image=image.rotate(270, expand=True)
            elif exif[orientation] == 8 : 
                image=image.rotate(90, expand=True)
        except KeyError:
            False
            #print("No orientation EXIF data for: " + fileName)

    # thumnail
    r = float(height) / image.size[1]
    w = float(image.size[0]) * r
    image.thumbnail((w, height), Image.ANTIALIAS)
    image.save(base_path + DIR_IMG_THUMBNAIL + fileName)

####################
###
### sanity check
###

# sanity check: every audio file should have a matching img
def ensure_audio_img_match():
    # error if an audio file has no image. slow, but we should ensure this.
    for fpath in glob.glob(base_path + DIR_AUD + "*" + AUD_FORMAT):
        match = False
        for imgpath in glob.glob(base_path + DIR_IMG_LG + "*" + IMG_FORMAT):
            if get_flabel(imgpath, IMG_FORMAT) == get_flabel(fpath, AUD_FORMAT):
                match = True
        if not match:
            #raise FileNotFoundError("no image for audio file: " + fpath)
            return True

# ensure each final image file is the desired extension & has GPS info
def ensure_all_img_sanity():
    [ensure_img_sanity(fpath) for fpath in glob.glob(base_path + DIR_IMG_ORIG + "*")]

def ensure_img_sanity(fpath):
    print("ensure_img_sanity", fpath)
    def fnExif(fpath, im):
        extension = "." + fpath.split(".")[-1]
        im.save(base_path + DIR_IMG_LG + get_fname(fpath).replace(extension, IMG_FORMAT), exif=im.info["exif"])
    def fnNoExif(fpath, im):
        im.save(base_path + DIR_IMG_ERR + get_fname(fpath).replace(IMG_FORMAT, "") + "_WARNING! no gps data for image" + IMG_FORMAT)
    for_img_with_exif(fpath, fnExif, fnNoExif)
    
# only permit location labels that were most likely hand-named image filenames
def verify_flabel(flabel):
    # invalid label if filename begins with '201' (likely a date)
    try:
        flabel.index("201")
        return False
    except ValueError:
        False # ignore
    # invalid label if blacklisted
    for prefix in BLACKLIST_FLABEL_PREFIX:
        try:
            flabel.index(prefix)
            return False
        except ValueError:
            continue
    return True


# # Run

# In[2]:


# process every dir in Places/
placels = [x for x in logprogress.log_progress(glob.glob(DIR_PLACES + "*/")) if valid_place(x)]
# placels = ['../s3/Yuba_River/'] # or process one place
all_places = {"places":[]}

# process each directory
for base_path in placels:

    print("processing place: " + base_path)
    
    # clear workspace
    init_dir(base_path + DIR_IMG_LG)
    init_dir(base_path + DIR_IMG_THUMBNAIL)
    init_dir(base_path + DIR_IMG_ERR)
    
    ensure_all_img_sanity()
    ensure_audio_img_match()

    # read json template
    with open(base_path + INPUT_JSON) as data_file:
        data = json.load(data_file)
        data["layers"] = find_geodat()

        # for everyimage...
        files = glob.glob(base_path + DIR_IMG_LG + "*" + IMG_FORMAT)
        for fpath in logprogress.log_progress(files):
            
            # compile location info
            flabel = get_flabel(fpath, IMG_FORMAT)
            loc = get_gps_for_fpath(fpath)
            
            if loc != None:
                fnam = get_fname(fpath)
                date = get_date_for_fpath(fpath)
                
                marker = {
                    "date": date,
                    "loc": loc,
                    "img": fnam,
                    "aud": find_audio_for_img(flabel)
                }
                
                if verify_flabel(flabel):
                    marker["label"] = flabel
                
                data["locations"].append(marker)

                # save web-friendly image (rotated & small)
                reorient_img(fnam, SIZE_IMG_THUMBNAIL)
        
        # Write JSON file
        # http://stackoverflow.com/questions/12309269/how-do-i-write-json-data-to-a-file-in-python
        with io.open(base_path + OUTPUT_JSON, 'w', encoding='utf8') as outfile:
            str_ = json.dumps(data,
                              indent=4, sort_keys=True,
                              separators=(',', ':'), ensure_ascii=False)
            outfile.write(to_unicode(str_))
    
    # add to summary json
    dirName = base_path.split("/")[-2]
    dispName = dirName.replace("_", " ")
    
    all_places["places"].append({
        "id": dirName,
        "disp": dispName
    })

# write summary json: all place names
with io.open(DIR_PLACES + SMRY_JSON, 'w', encoding='utf8') as outfile:
    str_ = json.dumps(all_places,
                      indent=4, sort_keys=True,
                      separators=(',', ':'), ensure_ascii=False)
    outfile.write(to_unicode(str_))
            
print("done.")


# In[ ]:




