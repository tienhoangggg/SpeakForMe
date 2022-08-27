var request = require('request');
var fs = require('fs');
var path = require('path');
async function getVoice(message) {
    var options = {
        'method': 'POST',
        'url': 'https://api.soundoftext.com/sounds',
        'headers': {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "data": {
            "text": message,
            "voice": "vi-VN",
            "engine": "Google"
          }
        })
      };
      const id = await new Promise(async (resolve, reject)=>{
      request(options, function (error, response) {
        if (error) throw new Error(error);
        resolve(JSON.parse(response.body).id);
      });})
      request.get('https://storage.soundoftext.com/'+id+'.mp3')
      .on('error', function(err) {  
      })
      .pipe(fs.createWriteStream('./src/data/'+id+'.mp3', {flags: 'w'}, function(err) {
        if (err) throw err;
        }));
      return id;
}

async function deleteVoice(link) {
  fs.unlink(link, function(err) {
    if (err) throw err;
  });
}

module.exports = {
    getVoice : getVoice,
    deleteVoice : deleteVoice
}