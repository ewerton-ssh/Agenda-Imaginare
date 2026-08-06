const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  client: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    required: true, 
    enum: [
      'Adesivo', 
      'Automativo', 
      'Fachada de ACM', 
      'Letra caixa/acrilico', 
      'Lona c/ Ilhos', 
      'Painel de lona', 
      'Outro'
    ] 
  },
  description: { type: String, default: '', trim: true },
  collaborator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  image: { type: String, default: null },
  done: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { 
  timestamps: true 
});

const Service = mongoose.model('Service', serviceSchema, 'services');

module.exports = { Service };