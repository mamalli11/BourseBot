module.exports.addUnit = (number) => {
    if (number > Math.pow(10, 9))
        return Math.floor(number / Math.pow(10, 9)) + " میلیارد";
    else if (number > Math.pow(10, 6))
        return Math.floor(number / Math.pow(10, 6)) + " میلیون";
    return number;
};
