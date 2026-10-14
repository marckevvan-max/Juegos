require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();
const PUBLIC = path.join(__dirname, '..', 'public');

app.set('trust proxy', 1); // Render va detrás de un proxy (necesario para cookies seguras)
// CSP desactivada porque las páginas usan manejadores onclick en línea
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/healthz', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

app.use(express.static(PUBLIC, { extensions: ['html'] }));
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC, 'html', 'menu.html')));
app.get('/menu', (req, res) => res.redirect('/'));

// Errores de las rutas async (Express 5 los reenvía aquí)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => app.listen(PORT, () => console.log('Servidor listo en http://localhost:' + PORT)))
  .catch((e) => {
    console.error('No se pudo iniciar:', e.message);
    process.exit(1);
  });
