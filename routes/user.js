import express from 'express';
import User from '../models/User.js';

const router = express.Router();

/**
 * GET /api/users
 * Lista todos los usuarios, opcionalmente filtrando por nombre o apellido.
 * Query params: ?q=textoBusqueda
 */
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q
      ? {
          $or: [
            { name:     { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios', details: err.message });
  }
});

/**
 * POST /api/users
 * Crea un usuario.
 * Body (JSON):
 *  {
 *    name,
 *    lastName,
 *    email,
 *    phoneNumber?,
 *    jobTitle?,
 *    firebase_uid?,
 *    stripe_id?,
 *    estado?
 *  }
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      lastName,
      email,
      phoneNumber,
      jobTitle,
      firebase_uid,
      stripe_id,
      estado
    } = req.body;

    const user = new User({
      name,
      lastName,
      email,
      phoneNumber,
      jobTitle,
      firebase_uid,
      stripe_id,
      estado
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear usuario', details: err.message });
  }
});

/**
 * PUT /api/users/:id
 * Actualiza un usuario por su _id de Mongo.
 * Body: cualquiera de los campos del modelo.
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar usuario', details: err.message });
  }
});

/**
 * DELETE /api/users/:id
 * Elimina un usuario por su _id.
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: err.message });
  }
});

export default router;
