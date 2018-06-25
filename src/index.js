import React from "react";
import ReactDOM from "react-dom";
import { Container, CreateUser, Posts, NewPost } from "blog-components";
import { ApolloProvider, Query, Mutation } from "react-apollo";
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

const client = new ApolloClient({
  uri: "http://localhost:4466"
});

const POSTS = gql`
  {
    posts {
      title
      content
      author {
        name
      }
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!) {
    createUser(data: { name: $name }) {
      id
      name
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($post: PostCreateInput!) {
    createPost(data: $post) {
      id
      title
      content
    }
  }
`;

class App extends React.Component {
  state = { user: null };
  render() {
    return (
      <ApolloProvider client={client}>
        <Container user={this.state.user}>
          <Mutation
            mutation={CREATE_USER}
            update={(cache, { data }) => {
              this.setState({ user: data.createUser });
            }}
          >
            {createUser => (
              <CreateUser
                createUser={name => createUser({ variables: { name } })}
              />
            )}
          </Mutation>
          <Mutation mutation={CREATE_POST}>
            {createPost => (
              <NewPost
                user={this.state.user}
                createPost={({ title, content }) =>
                  createPost({
                    variables: {
                      post: {
                        title,
                        content,
                        author: { connect: { id: this.state.user.id } }
                      }
                    },
                    refetchQueries: [{ query: POSTS }]
                  })
                }
              />
            )}
          </Mutation>
          <Query query={POSTS}>
            {({ loading, error, data }) => {
              if (error) {
                return <div>Error :(</div>;
              }
              if (loading) {
                return <div>Loading...</div>;
              }
              return <Posts posts={data.posts} />;
            }}
          </Query>
        </Container>
      </ApolloProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
