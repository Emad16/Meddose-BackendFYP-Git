const mongoose = require("mongoose");
//------------ Categories Schema ------------//
const CategoriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Categories = mongoose.model("Categories", CategoriesSchema);

module.exports = Categories;
