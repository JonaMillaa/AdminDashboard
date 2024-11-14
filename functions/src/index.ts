import * as functions from 'firebase-functions/v1'; // Importa v1 explícitamente
import * as admin from 'firebase-admin';

admin.initializeApp();

// Función para registrar un nuevo usuario en Firestore
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email } = user;
  const timestamp = new Date();

  try {
    // Registrar el evento de registro
    await admin.firestore().collection('ActividadUsuario').add({
      usuarioId: uid,
      tipoEvento: 'registro',
      fecha: timestamp,
      email: email || null,
    });
    console.log(`Evento de registro guardado para el usuario: ${uid}`);
  } catch (error) {
    console.error("Error al guardar el evento de registro:", error);
  }
});
