const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExclusionSchema = new Schema({
  first_name: String,
  last_name: String,
  dob: String,
  other_info: String,
  ordinance: String,
  description: String,
  date_served: String,
  exp_date: String,
  length: String,
  img_url: String,
  signature: String,
  super_title: String, // Title of supervisor in signature
  archived: Boolean,
  canEdit: Boolean,
  pending: Boolean,
});

module.exports = mongoose.model('Exclusion', ExclusionSchema, 'exclusions');
