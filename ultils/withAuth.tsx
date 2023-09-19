"use client"

import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
import { redirect } from 'next/navigation';

const withAuth = (BaseComponent: any) => {
  function App(props: any) {
    const token: any = Cookies.get('token') || '';

    let decoded: any = {};
    console.log(token, "token")

    if (token) {
      decoded = jwt_decode(token);
    }

    useEffect(() => {
      if (!token) redirect("/login")
    }, [])
    return <BaseComponent user={decoded} {...props} />;
  }

  return App;
};

export default withAuth;