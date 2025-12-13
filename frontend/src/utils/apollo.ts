import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// Create HTTP link without headers
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_HTTP_URL || 'http://localhost:8000/graphql/',
});

// Create auth link that sets headers dynamically on every request
const authLink = setContext((_, { headers }) => {
  // Get the organization slug from localStorage on EVERY request
  const organizationSlug = localStorage.getItem('organizationSlug') || import.meta.env.VITE_ORGANIZATION_SLUG || '';

  console.log('[Apollo] Setting organization header:', organizationSlug);

  return {
    headers: {
      ...headers,
      'X-Organization-Slug': organizationSlug,
    }
  };
});

// Combine auth link with HTTP link
const httpLinkWithAuth = authLink.concat(httpLink);

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:8000/graphql/',
    connectionParams: {
      organizationSlug: localStorage.getItem('organizationSlug') || import.meta.env.VITE_ORGANIZATION_SLUG || '',
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLinkWithAuth
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          projects: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          tasks: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
