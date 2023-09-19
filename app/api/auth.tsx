import axios from 'axios';


export default class Auth {
  static userLogin(body: any) {

    return axios({
      method: "POST",
      url: `${process.env.API_NODE}/auth/login`,
      headers: {
        ["x-hasura-admin-secret"]: process.env.PASS_HASURA
      },
      data: body
    })
  }
}