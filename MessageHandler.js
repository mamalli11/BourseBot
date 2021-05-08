const moment = require('jalali-moment');
const { addUnit } = require("./Utils/MathUtils");

const months = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مهرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
]

module.exports.startMessage = () => {
    return `سلام
    من ربات سهامجو هستم
    اسم هر سهامی که دلت خواست رو هرزمانی میتونی برام بفرستی و من اطلاعاتشو بهت برگردونم

    لیست قابلیات های من 
    /symbol_list
    /best_symbols
    /comp_symbol

    @IAUKhShBurse_bot`
};

module.exports.symbolDetail = (data) => {
    const time = moment().locale('fa');
    return `📊 سهام : ${data.symbol}
    حجم معاملات : ${addUnit(data.volume)}

    درصد خرید حقیقی : ${data.realBuyPercent}%
    درصد فروش حقیقی : ${data.realSellPercent}%

    ورود و خروج پول حقیقی : ${addUnit(data["enter_exit"])} تومان
    حجم میانگین ماه : ${addUnit(data.monthVolumeAvg)} 

    سرانه خرید : ${addUnit(data.buyS)}
    سرانه فروش : ${addUnit(data.sellS)}
    قدرت خریدار به فروشنده : ${data.power}

    درصد معاملات : ${data.percent}%  ${data.percent > 0 ? "🟢" : "🔴"}
    درصد پایانی : ${data.finalPercent}%  ${data.finalPercent > 0 ? "🟢" : "🔴"}

    📅 ${time.format('D')} ${months[time.format('M') - 1]}
    ⏱ ${time.format('HH:mm')}

    @IAUKhShBurse_bot`
}


module.exports.compSymbols = (symbol1, symbol2) => {
    function compGenerator(key, propertyTitle) {
        if (symbol1[key] > symbol2[key])
            return `${propertyTitle} ${symbol1.symbol} از ${symbol2.symbol} بیشتر است`
        else
            return `${propertyTitle} ${symbol2.symbol} از ${symbol1.symbol} بیشتر است`
    }

    const time = moment().locale('fa');
    return `📊 سهام اول : ${symbol1.symbol}
    📊 سهام دوم : ${symbol2.symbol}

    مقایسه بین این دو سهم :
    ${compGenerator("volume", "حجم معاملات")}

    ${compGenerator("realBuyPercent", "درصد خرید حقیقی")}
    ${compGenerator("realSellPercent", "درصد فروش حقیقی")}

    ${compGenerator("enter/exit", "ورود و خروج پول حقیقی")}
    ${compGenerator("monthVolumeAvg", "حجم میانگین ماه")}

    ${compGenerator("buyS", "سرانه خرید")}
    ${compGenerator("sellS", "سرانه فروش")}
    ${compGenerator("power", "قدرت خریدار به فروشنده")}

    ${compGenerator("percent", "درصد معاملات")}
    ${compGenerator("finalPercent", "درصد پایانی")}

    📅 ${time.format('D')} ${months[time.format('M') - 1]}
    ⏱ ${time.format('HH:mm')}

    @IAUKhShBurse_bot`
}
