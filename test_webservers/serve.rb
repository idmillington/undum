#!/usr/bin/env ruby

require 'webrick'

include WEBrick

def start_webrick(config={})
  config.update(:Port => 8000)
  puts "Server starting. Visit http://localhost:8000/ in your browser."
  server = HTTPServer.new(config)
  yield server if block_given?
  ['INT', 'TERM'].each { |signal|
     trap(signal){ server.shutdown} 
  }
  server.start
end

start_webrick(:DocumentRoot => '../games')