const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 20 },
    passwordHash: { type: String, required: true },
    exp: { type: Number, default: 0 },
    pts: { type: Number, default: 0 },
    played: { type: Number, default: 0 },
    logros: { type: [String], default: [] },
    items: { type: [String], default: [] },
    equip: { type: mongoose.Schema.Types.Mixed, default: {} },
    stats: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ played: 0, wins: 0, earned: 0, best: 0, hard: 0, online: 0, per: {} }),
    },
  },
  { timestamps: true, minimize: false }
);

// Mayúsculas/minúsculas no importan al buscar el usuario
userSchema.index({ username: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } });

/** Datos que sí se pueden enviar al navegador (nunca el hash). */
userSchema.methods.toPublic = function () {
  return {
    username: this.username,
    exp: this.exp,
    pts: this.pts,
    played: this.played,
    logros: this.logros,
    items: this.items,
    equip: this.equip || {},
    stats: this.stats,
  };
};

module.exports = mongoose.model('User', userSchema);
