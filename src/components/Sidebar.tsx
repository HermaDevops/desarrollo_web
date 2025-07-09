'use client';
import Link from 'next/link';
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <ul>
        <li><Link href="/main">Inicio</Link></li>
        <li><Link href="/registro_cajas"> Cierre de Cajas </Link></li>
        <li><Link href="/registro_facturas"> Registro de Facturas </Link></li>
        <li><Link href="/registro_pagos"> Ingreso de Recibo de Cobros </Link></li>
        <li><Link href="/consulta_cartera"> Consulta de Cartera </Link></li>
        <li><Link href="/consulta_inventario"> Consulta de Inventario </Link></li>
        <li><Link href="/registro_pagos_tc"> Registro Pagos TC </Link></li>
      </ul>
    </aside>
  );}
