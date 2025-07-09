'use client';

import { GetServerSidePropsContext } from 'next';
import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import axios from 'axios';

type Props = {
  secuencial: string;
  clientes: { CardCode: string; CardName: string }[];
  error?: string | null;
};

export default function RegistroPagosPage({ secuencial, clientes, error }: Props) {
  if (error) {
    return <div style={{ color: 'red' }}><strong>Error al cargar la página:</strong> {error}</div>;
  }
  const [fecha, setFecha] = useState(""); // Formato dd/mm/yyyy
  const [loading, setLoading] = ('')

  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setFecha(formatted);
  }, []);

  useEffect(()=>{

  }, [])

  return (
    <div className="table-container" id="payment-container">
      <form>
        <div className="form-group">
        <label htmlFor="fecha">Fecha *</label>
        <input type="date" id="fecha" value={fecha} readOnly />
        </div>

        <div className="form-group">
          <label>Socio de Negocio *</label>
          <select required>
            <option value="">Seleccione un socio</option>
              {clientes?.map((cliente) => (
                <option key={cliente.CardCode} value={cliente.CardCode}>
                     {cliente.CardName}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group-table">
          <label>Facturas *</label>
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Aplicado</th>
                <th>Saldo</th>
                <th>Valor a Pagar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6}>No hay facturas cargadas</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="form-group">
          <label className='secuencial'>Secuencial</label>
          <input type="text" readOnly value={secuencial}/>
        </div>

        <div className="form-group">
          <label>Total de facturas a cancelar</label>
          <input type="text" readOnly />
        </div>

        <div className="form-group">
          <label>Total de cheques registrados</label>
          <input type="text" readOnly />
        </div>

        <div className="form-group">
          <label>Método de Pago *</label>
          <select required>
            <option value="">Seleccione</option>
            <option value="efectivo">Efectivo</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        <div className="form-group">
          <label>Comentarios</label>
          <input type="text" />
        </div>

        <div className="form-group">
          <button className='btn-registrar-pago' type="submit">Registrar Pago</button>
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Procesando datos...</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}


import { generar_secuencial } from '../lib/db';
import { getUserFromToken, obtenerBaseyClave } from '@/utils/auth';
import { GetServerSideProps } from 'next';
import { getContactsByProperty } from '../lib/contacts';
import { asyncWrapProviders } from 'async_hooks';

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = getUserFromToken(context.req);

    if (!user || !user.enterprise) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
    }

    const { db, pwd } = obtenerBaseyClave(user.enterprise);

    if (!db || !pwd) {
      throw new Error(`No se encontraron credenciales para empresa: ${user.enterprise}`);
    }
    const secuencial = await generar_secuencial(context.req);
    const clientes = await getContactsByProperty(user.property, db, pwd);
    return {
      props: {
        secuencial,
        clientes,
        error: null
      }
    };
  } catch (error: any) {
    console.error('Error en getServerSideProps (registro_pagos):', error);
    return {
      props: {
        secuencial: null,
        clientes: [],
        error: error.message || 'Error desconocido en el servidor'
      }
    };
  }
};