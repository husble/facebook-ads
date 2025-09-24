import { Avatar, Button, Drawer, message, Select, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie'
import Icon from '@ant-design/icons/lib/components/Icon';

import Tiktok from '#/components/Tiktok'

import {PLATFORM, Product} from '#/ultils';
import Facebook from "#/components/Facebook"
import { FacebookIcon, LogoutIcon, SwitchIcon, TiktokIcon } from '#/components/svg';

import Styled from "./Style"
import { STORE } from '#/app/page';

const {Option} = Select

type Props = {
  open: boolean;
  setOpen: Function;
  ads: Product[];
  storeId: number;
  setSelecteds: Function;
  stores: STORE[]
}

const PLATFORMS = [
  {
    label: "Facebook",
    value: PLATFORM.FACEBOOK,
    icon: <FacebookIcon />,
  },
  {
    label: 'Tiktok',
    value: PLATFORM.TIKTOK,
    icon: <TiktokIcon />
  },
];

function Index({ open, setOpen, ads, storeId, setSelecteds, stores }: Props) {
  const [platform, setPlatform] = useState<PLATFORM>(PLATFORMS[0].value);
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storePlatform = localStorage.getItem("platform") as PLATFORM
    if (storePlatform) {
      setPlatform(storePlatform)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    
    if (platform === PLATFORM.TIKTOK) {
      const user = Cookies.get(PLATFORM.TIKTOK)
      if (user) {
        setUser(JSON.parse(user))
      }
  
    }
    
  }, [open])

  const handleLogin = async () => {
    try {
      const login = () => {
        return new Promise((res, rej) => {
          const width = 600;
          const height = 700;
          const left = window.innerWidth / 2 - width / 2;
          const top = window.innerHeight / 2 - height / 2;
      
          const popup = window.open(
            process.env.FACEBOOK_API + '/tiktok/oauth',
            'TikTokLogin',
            `width=${width},height=${height},top=${top},left=${left}`
          );
      
          const handleMessage = (event: MessageEvent) => {
            const { type, data } = event.data;
      
            if (type === 'tiktok-auth-success') {
              const expires = new Date(new Date().getTime() + data.expires_in * 1000);
              Cookies.set(PLATFORM.TIKTOK, JSON.stringify(data), { expires, path: '/' });
              localStorage.setItem("platform", PLATFORM.TIKTOK)
              setPlatform(PLATFORM.TIKTOK)
              setUser(data);
              popup?.close();
              window.removeEventListener('message', handleMessage);
              res(data);
            }
      
            if (type === 'tiktok-auth-fail') {
              popup?.close();
              window.removeEventListener('message', handleMessage);
              message.error("TikTok auth failed");
              rej(new Error('TikTok auth failed'))
            }
          };
      
          window.addEventListener('message', handleMessage);
        });
      }
      await login()
    } catch {}
  };

  const renderPlatform = () => {
    if (platform === 'facebook') {
      return <Facebook
        open={open}
        setOpen={setOpen}
        ads={ads}
        storeId={storeId}
        setSelecteds={setSelecteds}
        platform={platform}
        stores={stores}
      />
    }

    return <Tiktok
      open={open}
      setOpen={setOpen}
      ads={ads}
      setSelecteds={setSelecteds}
      platform={platform}
      login={handleLogin}
    />
  }

  const choosePlatform = async (value: PLATFORM) => {
    if (value === PLATFORM.TIKTOK) {
      const user = Cookies.get(PLATFORM.TIKTOK)
      if (user) {
        setUser(JSON.parse(user))
        localStorage.setItem("platform", value)
        setPlatform(value)
      } else {
        await handleLogin()
      }
      return
    }

    setUser(null)
    localStorage.setItem("platform", value)
    setPlatform(value)
  }

  const renderProfile = () => {
    const logout = () => {
      const logoutWin = window.open(
        'https://www.tiktok.com/logout',
        '_blank',
        'width=1,height=1,top=-1000,left=-1000'
      );
      window.moveTo(0,0)
      window.resizeTo(screen.width,screen.height-100);
      setTimeout(() => {
        logoutWin?.close()
        Cookies.remove(PLATFORM.TIKTOK)
        setUser(null)
      }, 1000)
    }

    const changeAccount = async () => {
      const logoutWin = window.open(
        'https://www.tiktok.com/logout',
        '_blank',
        'width=1,height=1,top=-1000,left=-1000'
      );
      setTimeout(() => {
        logoutWin?.close()
        handleLogin()
      }, 1000)
    }

    return (
      <div className='tiktok_account'>
        <p className='tiktok_account--name'>Hi, {user?.creator_nickname}</p>
        <ul>
          <li onClick={logout}>
            <span><LogoutIcon /></span>
            Log out
          </li>
          <li onClick={changeAccount}>
            <span><SwitchIcon /></span>
            Change Account
          </li>
        </ul>
      </div>
    )
  }

  return (
    <Styled>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width="100vw"
        placement="left"
        className='drawer_step2'
        title={
          <div className="drawer_title">
            <Select onChange={choosePlatform} style={{width: 150, marginRight: 10, border: "none"}} value={platform}>
              {PLATFORMS.map(platform => (
                <Option value={platform.value} key={platform.value}>
                  <div style={{display: "flex", gap: 5, alignItems: "center"}}>
                    {platform.icon}
                    {platform.label}
                  </div>
                </Option>
              ))}
            </Select>
            {user ? (
              <Tooltip placement='rightBottom' trigger={"click"} title={renderProfile()}>
                <Avatar style={{cursor: "pointer"}} src={user?.creator_avatar_url} />
              </Tooltip>
            ) : null}
            {!user && platform === PLATFORM.TIKTOK ? (
              <Button onClick={handleLogin} size='middle' type='primary' danger>Login</Button>
            ) : null}
          </div>
        }
      >
        <div className='drawer_body'>
          {renderPlatform()}
        </div>
      </Drawer>
    </Styled>
  );
}

export default Index;
