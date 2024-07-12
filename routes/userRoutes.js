const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Registro
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(400).send({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { usuario, email, password } = req.body;
    const user = await User.findOne({ $or: [{ usuario }, { email }] });
    if (!user) {
      return res.status(400).send({ error: 'Credenciales inválidas' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (error) {
    res.status(400).send({ error: 'Error al iniciar sesión' });
  }
});

// Actualizar información del usuario
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['nombre', 'apellido', 'usuario', 'email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Actualizaciones inválidas' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.send({ message: 'Información actualizada exitosamente' });
  } catch (error) {
    res.status(400).send({ error: 'Error al actualizar información' });
  }
});

// Listar usuarios (con paginación)
router.get('/', auth, async (req, res) => {
  const { page = 1, count = 10 } = req.query;
  try {
    const users = await User.find()
      .limit(parseInt(count))
      .skip((page - 1) * count);
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener usuarios' });
  }
});

// Obtener un solo usuario
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener usuario' });
  }
});

// Actualizar un usuario
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['nombre', 'apellido', 'usuario', 'email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Actualizaciones inválidas' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }
    updates.forEach(update => user[update] = req.body[update]);
    await user.save();
    res.send({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(400).send({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado' });
    }
    res.send({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).send({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;