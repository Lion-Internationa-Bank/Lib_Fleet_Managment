// under review
const ConfigSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
});
export default mongoose.model('Config', ConfigSchema);                                