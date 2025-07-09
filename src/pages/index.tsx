import { useState, useEffect } from 'react';


export default function Login({ error }: { error?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (error) {
      setShowModal(true);
    }
  }, [error]);


  return (
    <div className="container">
      <main className="main">
        <form  method='POST'>
          <div className="login-content">
            <div className="info-group">
              <h2>Iniciar sesión</h2>
            </div>

            <div className="input-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                name='email'
                type="text"
                required
                value={email ?? ''}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name='password'
                type="password"
                required
                value={password ?? ''}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button className="btn-login" type="submit">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </form>
        {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { GetServerSidePropsContext } from 'next';
import { conectarDB } from '../lib/db';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET_KEY!;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, res } = context;

  if (req.method === 'POST') {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();
    const params = new URLSearchParams(data);
    const email = params.get('email');
    const password = params.get('password');

    if (!email || !password) {
      return { props: { error: 'Campos incompletos' } };
    }

    try {
      const db = await conectarDB();
      const result = await db
        .request()
        .input('email', email)
        .query(`
          SELECT e_mail, password_hashed, empresa, propiedad, rol FROM employees WHERE e_mail = @email
        `);

      if (result.recordset.length === 0) {
        return { props: { error: 'Usuario no encontrado' } };
      }

      const user = result.recordset[0];
      const isPasswordValid = await bcrypt.compare(password, user.password_hashed);

      if (!isPasswordValid) {
        return { props: { error: 'Contraseña incorrecta' } };
      }

    if (isPasswordValid) {
      const token = jwt.sign(
        { userId: user, email: user.e_mail, enterprise: user.empresa, property: user.propiedad, rol: user.rol },
        JWT_SECRET,
        { expiresIn: '60m' } // Expires in 5 minutes
      );

      const cookie = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 5 * 2, // 5 minutos
        path: '/',
        sameSite: 'lax',
      });

      res.setHeader('Set-Cookie', cookie);

      return {
        redirect: {
          destination: '/main',
          permanent: false,
        },
      };
    }
  }
  catch (err) {
      console.error('Error en login:', err);
      return { props: { error: 'Error del servidor' } };
    }
  }
  return { props: {} };
}
