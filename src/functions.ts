function HEXAtoRGBA(hex, a) {
    hex = hex.substring(1, 7);
    return "rgba(" + parseInt(hex.substr(0, 2), 16) +
    "," + parseInt(hex.substr(2, 2), 16) +
    "," + parseInt(hex.substr(4, 2), 16) +
    "," + a + ")";
}

/* TODO
 * recursive option generation
 */

function generateOptions(options, defaultOptions) {
    var newOptions = {};

    if(options == undefined)
        for(var i in defaultOptions)
            newOptions[i] = defaultOptions[i];
    else
        for(var i in defaultOptions)
            if(options[i] == undefined)
                newOptions[i] = defaultOptions[i];
            else
                newOptions[i] = options[i];

    return newOptions;
}