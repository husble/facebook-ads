'use client';

import React, { SetStateAction, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import { redirect } from 'next/navigation';
import { UserContext } from '#/components/UserContext';
import {verify} from 'jsonwebtoken'

const withAuth = (BaseComponent: any) => {
  function App(props: any) {
    const {dispatch} = useContext(UserContext)

    useEffect(() => {
      const token: string | null = Cookies.get('token') || '';
      const secrectKey: string | undefined = process.env.JWT_SECRET_KEY
      if (!token || !secrectKey) {
        return redirect('/login');
      }

      const data: any = verify(token, secrectKey)
      dispatch(data)
    }, []);
    return <BaseComponent {...props} />;
  }

  return App;
};

export default withAuth;
