import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { GetServerSideProps } from 'next';

const JWT_SECRET = process.env.JWT_SECRET_KEY!;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { props: { user: decoded } };
  } catch (err) {
    console.error('JWT inválido o expirado:');
    return {
      redirect: { destination: '/', permanent: false },
    };
  }
};

export default function MainPage({ user }: any) {
  return (
    <div>
      <h1>Bienvenido: {user.email}</h1>
    </div>
  );
}
