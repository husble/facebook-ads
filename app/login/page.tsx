"use client"

import React, { useEffect } from 'react';

import Login from '#/components/Login';
import withAuth from '#/ultils/withAuth';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';

const Index = () => {

  const token: any = Cookies.get('token') || '';
  if (token) {
    
    window.location.href = "/"
  }
  
  return <Login />;
};

export default Index
