const mongoose = require("mongoose");

const companiesSchema = new mongoose.Schema(
    {
        // CoID:{},
        // CoName:{},
        // CoNameEnglish:{},
        // CompanySymbol:{},
        // CoTSESymbol:{},
        // GroupID:{},
        // GroupName:{},
        // IndustryID:{},
        // IndustryName:{},
        // CoID:{},
        symbol: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "نام الزامی می باشد"],
            minlength: 3,
            maxlength: 30,
        },
        volume: {
            type: String,
            trim: true,
            required: true,
        },
        realBuyPercent: {
            type: String,
            trim: true,
            required: true,
        },
        realSellPercent: {
            type: String,
            trim: true,
            required: true,
        },
        enter_exit: {
            type: String,
            trim: true,
            required: true,
        },
        monthVolumeAvg: {
            type: String,
            trim: true,
            required: true,
        },
        buyS: {
            type: String,
            trim: true,
            required: true,
        },
        sellS: {
            type: String,
            trim: true,
            required: true,
        },
        power: {
            type: String,
            trim: true,
            required: true,
        },
        percent: {
            type: String,
            trim: true,
            required: true,
        },
        finalPercent: {
            type: String,
            trim: true,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Companies", companiesSchema);