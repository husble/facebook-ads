import axios from 'axios';

export default class FB {
  static createCamp(body: any) {
    return axios({
      method: 'POST',
      url: `${process.env.FACEBOOK_API}/facebook/martketing`,
      headers: {
        ['x-hasura-admin-secret']: process.env.PASS_HASURA
      },
      data: body
    });
  }

  static createPost(body: any) {
    return axios({
      method: 'POST',
      url: `${process.env.FACEBOOK_API}/facebook/create_post`,
      headers: {
        ['x-hasura-admin-secret']: process.env.PASS_HASURA
      },
      data: body
    });
  }
}
