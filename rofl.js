const http = require('http')

function roflMessage(msg) {
    return new Promise((resolve, reject) => {
        if(typeof msg == 'string' ){
            let req = http.request( encodeURI('http://www.aot.ru/cgi-bin/redirectd.py?port=17017&action=syntax&langua=Russian&query=' + msg), (res) => {
                var str = ""
                if(res.statusCode == 200) { 
                    res.on('data', data => {
                        str += data
                    })
                    res.on('end', () => {
                        try{
                            resolve(syntaxToRofl(JSON.parse(str)))
                        } catch(e) {
                            resolve(null)
                        }
                    })
                } else { 
                    console.error("status code != 200") 
                    resolve(null) 
                }
            })
            req.end()
        } else {
            console.error("msg != string")
            resolve(null)
        }
    })

}

function syntaxToRofl(syntax) {
    var arr = []
    var result = []
    for(let elem of syntax[0]) {
        for(let variant of elem.variants) {
            for(let group of variant.groups) {
                if(group.descr.slice(0, 8) == "прям_доп") {
                    for(let i = group.start; i <= group.last; i++) {
                        if(variant.units[i].grm[0][0] == "Г" || variant.units[i].grm[0][0] == "И" || variant.units[i].grm[0][0] == "Д") {
                            arr.unshift(elem.words[i].homonyms[0].toLowerCase())
                        } else if(variant.units[i].grm[0][0] == "С" || variant.units[i].grm[0][0] == "М") {
                            arr.push(elem.words[i].str)
                        } else {
                            console.log("not: ", variant.units[i].grm[0], " word: ", elem.words[i].str)
                            arr = []
                            i = group.last + 1
                        }
                    }
                    if(arr.length != 0) {
                        var str = "Эх, щас бы"
                        for(let elem of arr) {
                            str += " " + elem
                        }
                        result.push(str)
                        arr = []
                    }
                }
            }
        }
    }
    if(result.length > 0) return result
    else return null
}

module.exports.roflMessage = roflMessage