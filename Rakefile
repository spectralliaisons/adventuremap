
# S3PATH must match the s3 url in Map.js
S3PATH = "s3://multimap-2/"
PUBLICPATH = "gps/s3/"
DIR_PREFIX_IGNORE = "_"

# FullAccessUser
CREDS = "--access_key=#{ENV['S3_ACCESS_KEY']} --secret_key=#{ENV['S3_SECRET_KEY']}"

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
    task :all => ['push:info', 'push:media']
    
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
                    sh %{s3cmd put #{dirPath}* #{S3PATH}#{dirPath} #{CREDS} --acl-public --add-header "Cache-Control: public, must-revalidate, proxy-revalidate"}
                end
            end
        end
    end
    
    desc "push all places' json and kml files to s3"
    task :info do
        
        allPlacesJSON = "#{PUBLICPATH}all_rivers.json"
        sh %{s3cmd put #{allPlacesJSON} #{S3PATH}#{allPlacesJSON} #{CREDS} --acl-public --add-header "Cache-Control: public, must-revalidate, proxy-revalidate"}
        
        places.each do |place|
            puts "----------------- push place: #{place}"
            
            infoJSON = "#{place}/info.json"
            sh %{s3cmd put #{infoJSON} #{S3PATH}#{infoJSON} #{CREDS} --acl-public --add-header "Cache-Control: public, must-revalidate, proxy-revalidate"}
            
            geojsonDir = "#{place}/geojson/"
            files = Dir.glob("#{geojsonDir}*")
            if files.length > 0
                sh %{s3cmd put #{geojsonDir}* #{S3PATH}#{geojsonDir} #{CREDS} --acl-public --add-header "Cache-Control: public, must-revalidate, proxy-revalidate"}
            end
        end
    end
    
    desc "initialize s3 bucket"
    task :init do
        
        sh %{s3cmd del #{S3PATH}#{PUBLICPATH} #{CREDS} --recursive}
        
    end

end
