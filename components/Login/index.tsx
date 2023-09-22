"use client"

import React, { useState } from 'react';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';

import Auth from '#/app/api/auth';
import { Button, message } from 'antd';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default function Index() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (event: any) => {
    setLoading(true);
    event.preventDefault();

    Auth.userLogin({
      email: event.target.email.value,
      password: event.target.password.value,
    })
    .then(({ data }: any) => {
      const { token, username } = data;
      Cookies.set('token', token, { expires: 365 });
      window.location.href = "/"
    })
    .catch((error: any) => {
      setError(error?.data?.message);
      setLoading(false);
    });
  };
  return (
    <div className="login__page">
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="flex items-center justify-center flex-col max-w-[400px] w-[400px]">
          <div className="flex justify-center">
            <Image height={250} width={250} src="https://cdn.husble.com/logo.svg" alt="image" className="inline-block" />
          </div>
          <div className="mt-4 w-full">
            <div className="text-center font-bold mb-4">Login to your account</div>
            <div className="login-form">
              <form onSubmit={login}>
                <div className="form-row">
                  <div className="flex mb-3">
                    {/* <div className="input-group-prepend">
                      <span
                        className="input-group-text"
                        id="validationTooltipUsernamePrepend"
                      >
                        <UserOutlined className="site-form-item-icon" />
                      </span>
                    </div> */}
                    <input
                      type="text"
                      className="form-control"
                      name="email"
                      id="validationTooltipUsername"
                      placeholder="Username or Email"
                      aria-describedby="validationTooltipUsernamePrepend"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    {/* <div className="input-group-prepend">
                      <span
                        className="input-group-text"
                        id="validationTooltipPasswordPrepend"
                      >
                        <LockOutlined className="site-form-item-icon" />
                      </span>
                    </div> */}
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      id="validationTooltipPassword"
                      placeholder="Password"
                      aria-describedby="validationTooltipPasswordPrepend"
                      required
                    />
                  </div>
                </div>
                <div className="text-danger mt-1">{error}</div>
                <Button
                  className="w-100 btn-login font-bold"
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                >
                  Log in
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
  </div>
  );
}