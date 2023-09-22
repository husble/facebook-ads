"use client"

import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
import { redirect } from 'next/navigation';

const withAuth = (BaseComponent: any) => {
  function App(props: any) {
    
    useEffect(() => {
      const token: any = Cookies.get('token') || '';
      if (!token) {
        
        return redirect("/login")
      }
      
    }, [])
    return <BaseComponent {...props} />;
  }

  return App;
};

export default withAuth;