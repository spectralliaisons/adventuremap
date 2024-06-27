# Requires env variables:
# rscS3Path: S3 bucket for map resources (json, images, geojson, audio)
# rscCFID: CloudFront ID for the bucket at rscS3Path
# siteS3Path: S3 bucket for the website build
# siteCFID: CloudFront ID for the bucket at siteS3Path

PUBLICPATH = "gps/s3/"
DIR_PREFIX_IGNORE = "_"

MEDIA = ['aud', 'imgLg', 'imgSm']

def places
    puts "ENV PLACE: #{ENV['place']}"
    default = Dir.glob("#{PUBLICPATH}*").select {|f| File.directory?(f) && !f.start_with?("#{PUBLICPATH}#{DIR_PREFIX_IGNORE}")}
    if default.include? "#{PUBLICPATH}#{ENV['place']}"
        ["#{PUBLICPATH}#{ENV['place']}"]
    else
        default
    end
end

puts "places: #{places}"

namespace :build do
    
    desc "build info.json for each place with the python script"
    task :places do
        `jupyter nbconvert --ExecutePreprocessor.kernel_name=python3 --ExecutePreprocessor.timeout=-1 --execute gps/python/process_places.ipynb --to python`
    end
    
end

namespace :push do
    
    desc "push all places' media files, kml, json to s3"
    task :all => ['push:info', 'push:media', 'push:invalidate']
    
    desc "push all places' media files to s3"
    task :media do
        places.each do |place|
            puts "----------------- push place: #{place}"
            MEDIA.each do |media|
                puts "-------- media: #{media}"
                dirPath = "#{place}/#{media}/"
                
                # don't upload if empty
                files = Dir.glob("#{dirPath}*")
                puts "files.length #{files.length}"
                if files.length > 0
                    sh %{aws s3 sync #{dirPath} #{ENV['rscS3Path']}#{dirPath}}
                end
            end
        end
    end
    
    desc "push all places' json and kml files to s3"
    task :info do
        
        allPlacesJSON = "#{PUBLICPATH}places.json"
        sh %{aws s3 cp #{allPlacesJSON} #{ENV['rscS3Path']}#{allPlacesJSON}}
        
        places.each do |place|
            puts "----------------- push place: #{place}"
            
            infoJSON = "#{place}/info.json"
            sh %{aws s3 cp #{infoJSON} #{ENV['rscS3Path']}#{infoJSON}}

            geojsonDir = "#{place}/geojson/"
            files = Dir.glob("#{geojsonDir}*")
            if files.length > 0
                sh %{aws s3 sync #{geojsonDir} #{ENV['rscS3Path']}#{geojsonDir}}
            end
        end
    end
    
    desc "initialize s3 bucket"
    task :init do
        
        sh %{aws s3 rm #{ENV['rscS3Path']}#{PUBLICPATH} --recursive}
        
    end

    desc "clear cached S3 content for the map by invalidating the CloudFront files"
    task :invalidate do

        sh %{aws cloudfront create-invalidation --distribution-id #{ENV['rscCFID']} --paths "/#{PUBLICPATH}*"}

    end

    desc "build the website and upload it"
    task :site do

        sh %{npm run build}
        sh %{aws s3 rm #{ENV['siteS3Path']} --recursive}
        sh %{aws s3 sync build #{ENV['siteS3Path']}}
        sh %{aws cloudfront create-invalidation --distribution-id #{ENV['siteCFID']} --paths "/*"}

    end

end
