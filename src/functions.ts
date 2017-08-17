function HEXAtoRGBA(hex, a) {
    hex = hex.substring(1, 7);
    return "rgba(" + parseInt(hex.substr(0, 2), 16) +
    "," + parseInt(hex.substr(2, 2), 16) +
    "," + parseInt(hex.substr(4, 2), 16) +
    "," + a + ")";
}