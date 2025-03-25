import React from 'react';
import Header from './Header';
import NavBar from './NavBar';
import '../css/layout.css';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <NavBar />
      <main className='main-content'>{children}</main>
    </>
  );
}