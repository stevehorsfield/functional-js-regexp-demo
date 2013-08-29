var regexp = require('../parsing/parse.js');

exports.map = function(req,res,next) {
    
    var path = req.url;
    
    if (path.length < 1) {
        res.status = 402;
        res.end();
        return;
    }
    
    if (path[0] === '/') path = path.slice(1);
    
    var pattern = decodeURIComponent(path);
    
    var tokens = regexp.parse(pattern);
    
    res.status = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(tokens));
    return;
};

