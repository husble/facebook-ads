"use client"

import React, { useState } from 'react';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';

import Auth from '#/app/api/auth';
import { Button, message } from 'antd';
import { redirect } from 'next/navigation';

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
      redirect("/")
    })
    .catch((error: any) => {
      setError(error?.data?.message);
      setLoading(false);
    });
  };
  return (
    <div className="login__page">
      <div className="row">
        <div className="col-12 offset-0  col-md-6 offset-md-3 col-lg-4 offset-lg-4">
          <div className="login-wrap">
            <div className="login">
              <div className="login-logo">
                <img src="https://cdn.husble.com/logo.svg" alt="" className="" />
              </div>
              <div className="login-info">
                <div className="login-title">Login to your account</div>
                <div className="login-form">
                  <form onSubmit={login}>
                    <div className="form-row">
                      <div className="input-group mb-3">
                        <div className="input-group-prepend">
                          <span
                            className="input-group-text"
                            id="validationTooltipUsernamePrepend"
                          >
                            <UserOutlined className="site-form-item-icon" />
                          </span>
                        </div>
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
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span
                            className="input-group-text"
                            id="validationTooltipPasswordPrepend"
                          >
                            <LockOutlined className="site-form-item-icon" />
                          </span>
                        </div>
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
                    {/* <div className="wrap__forgot">
                      <div className="">
                        <Link href="/forgot-password">Forgot Password ?</Link>
                      </div>
                    </div> */}
                    <Button
                      className="w-100 btn-login"
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
      </div>
  </div>
  );
}