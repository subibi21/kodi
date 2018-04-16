const uuid = require('uuid').v4
const _ = require('lodash')
const { DOMAIN } = require('../config')
var Kodi = require('kodi-rpc');
var kodi = new Kodi('localhost', '8080');

class Directive {
  constructor({namespace, name, payload}) {
    this.header = {
      messageId: uuid(),
      namespace: namespace,
      name: name,
    }
    this.payload = payload
  }
}

class CEKRequest {
    constructor(httpReq) {
        this.request = httpReq.body.request
        this.context = httpReq.body.context
        this.session = httpReq.body.session

        console.log('CEK Request')
        console.log(`session: ${JSON.stringify(this.session)}`)
        console.log(`context: ${JSON.stringify(this.context)}`)
    }

    do(cekResponse) {
        switch (this.request.type) {
            case "LaunchRequest":
                return this.launchRequest(cekResponse)
            case "IntentRequest":
                return this.intentRequest(cekResponse)
            case "SessionEndedRequest":
                return this.sessionEndedRequest(cekResponse)
        }
    }

    launchRequest(cekResponse) {
        console.log('launchRequest')
        cekResponse.appendSpeechText("ÄÚµð¸¦ ½ÃÀÛÇÕ´Ï´Ù.")
    }
    intentRequest(cekResponse) {
        console.log('intentRequest')
        console.log(JSON.stringify(this.request))
        const intent = this.request.intent.name
        const slots = this.request.intent.slots
        var movieTitle = slots;

        switch (intent) {
            case "startKodiMovie":
                kodi.VideoLibrary.GetMovies()
                    .then(function (movies) {
                        if (!(movies && movies.result && movies.result.movies && movies.result.movies.length > 0)) {
                            throw new Error('no results');
                        }

                        var movie = movies.result.movies.reduce(function (result, item) {
                            return result ? result : (movieTitle === item.label.toLowerCase() ? item : null);
                        }, null);

                        if (movie) {
                            return kodi.Player.Open({ item: { movieid: movie.movieid } });
                        } else {
                            throw new Error('movie not found');
                        }
                    })
                    .catch(function (e) {
                        console.log(e);
                    });
        }
    }

}
const clovaReq = function (httpReq, httpRes, next) {
    cekResponse = new CEKResponse()
    cekRequest = new CEKRequest(httpReq)
    cekRequest.do(cekResponse)
    console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
    return httpRes.send(cekResponse)
};

module.exports = clovaReq;







