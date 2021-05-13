module.exports.symbolButtonList = (symbols) => {
    const symbolList = Object.values(symbols);
    let arr = [];
    symbolList.forEach((item, index) => {
        if (Math.floor(index / 3) >= arr.length) {
            const arr1 = [];
            arr.push(arr1);
        }
        arr[arr.length - 1].push({
            text: item.symbol,
        })
    });
    // console.log(arr);
    return arr;
};

module.exports.categorizedButtonList = (symbols) => {

    const symbolList = Object.values(symbols);
    let arr = [];
    symbolList.forEach((item, index) => {
        if (Math.floor(index / 1) >= arr.length) {
            const arr1 = [];
            arr.push(arr1);
        }
        arr[arr.length - 1].push({
            text: item.GroupName.substring(0, 25),
        })
    });
    return arr;
};
