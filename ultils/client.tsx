import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client"
import {setContext} from '@apollo/client/link/context'
import Cookies from 'js-cookie';

const httpLink = createHttpLink({
  uri: process.env.API_HASURA ,
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // return the headers to the context so httpLink can read them
  const token = Cookies.get('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      "x-hasura-admin-secret": process.env.PASS_HASURA
    }
  }
});

const Client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

export default Client