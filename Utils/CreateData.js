const Companies = require("../models/Companies");
const Group = require("../models/Groups");

const symbolList = require("./data");
const groupsList = require("./groups");

module.exports.createData = async () => {

    const Companieslength = await Companies.find().countDocuments();
    const Grouplength = await Group.find().countDocuments();

    if (Companieslength == 0) {
        symbolList.map(async (res) => {
            await Companies.create(res);
        });
        console.log("Save Data Companies");
    }

    if (Grouplength == 0) {
        groupsList.map(async (res) => {
            await Group.create(res);
        });
        console.log("Save Data Group");
    }
};

