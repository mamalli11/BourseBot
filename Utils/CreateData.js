const Companies = require("../models/Companies");
const Group = require("../models/Groups");

const symbolList = require("./data");
const groupsList = require("./groups");

module.exports.createData = async () => {
    const Grouplength = await Group.find().countDocuments();
    const Companieslength = await Companies.find().countDocuments();

    if (Grouplength == 0) {
        await groupsList.map(async (res) => {
            await Group.create(res);
        });
        console.log("*** Save Data Groups ***");

    }

    if (Companieslength == 0 && await Group.find().countDocuments() > 0) {
        await symbolList.map(async (res) => {
            await Group.findOne({ GroupName: res.GroupName })
                .then(async (result) => { await Companies.create({ ...res, GroupID: result._id }) })
                .catch((error) => { console.log(error); })
        });
        console.log("*** Save Data Companies ***");
    }
};
