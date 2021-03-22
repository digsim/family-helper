
import './App.css';
import { useEffect, useReducer } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import awsConfig from './aws-exports'
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { listLists } from './graphql/queries'
import { createList } from './graphql/mutations'
import { onCreateList } from './graphql/subscriptions'
import 'semantic-ui-css/semantic.min.css'
import MainHeader from './components/headers/MainHeader';
import Lists from './components/Lists/Lists'
import { Button, Container, Form, Icon, Modal } from 'semantic-ui-react';

Amplify.configure(awsConfig)

const initialState = {
  title: '',
  description: '',
  lists: [],
  isModalOpen: false
}
function listReducer(state = initialState, action){
  switch(action.type){
    case 'DESCRIPTION_CHANGED':
      return {...state, description: action.value};
    case 'TITLE_CHANGED':
      return {...state, title: action.value};
    case 'UPDATE_LISTS':
      return {...state, lists: [...action.value, ...state.lists]}
    case 'OPEN_MODAL':
      return {...state, isModalOpen: true}
    case 'CLOSE_MODAL':
      return {...state, isModalOpen: false, title: '', description: ''}
    default:
      console.log('Default action for : ', action)
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(listReducer, initialState);

  async function fetchList() {
    const { data } = await API.graphql(graphqlOperation(listLists));
    dispatch({type: 'UPDATE_LISTS', value: data.listLists.items});
  }

  useEffect(() => {
    fetchList()
  }, []);

  useEffect(() => {
    let subscription = 
    API
    .graphql(graphqlOperation(onCreateList))
    .subscribe({
      next: ({provider, value}) => {
        console.log(value);
        dispatch({type: 'UPDATE_LISTS', value: [value.data.onCreateList]});
      },
    });
    return () => subscription.unsubscribe();
  }, []);

  async function saveList(){
    const {title, description} = state;
    const result = await API.graphql(graphqlOperation(createList, {input: {title, description}}))
    dispatch({type: 'CLOSE_MODAL'});
    console.log('Save data with result: ', result)
  }

  



  
  return (
    <AmplifyAuthenticator>

      <Container style={{ height: '100vh' }}>
        <AmplifySignOut />
        <Button className='floatingButton' onClick={() => dispatch({type: 'OPEN_MODAL'})}>
          <Icon name='plus' className='floatingButton_icon' />
        </Button>
        <div className="App">
          <MainHeader />
          <Lists list={state.lists} />
        </div>
      </Container>

      <Modal open={state.isModalOpen} dimmer='blurring'>
        <Modal.Header>
          Create your list
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Input
              error={true ? false : { content: 'Please add a name to your list' }}
              label='Title'
              placeholder='My pretty List'
              value={state.title}
              onChange={(e) => dispatch({type: 'TITLE_CHANGED', value: e.target.value })} />
            <Form.TextArea
              label='Description'
              placeholder='Things that my pretty list is about'
              value={state.description}
              onChange={(e) => dispatch({type: 'DESCRIPTION_CHANGED', value: e.target.value })} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={() => dispatch({type: 'CLOSE_MODAL'})}>Cancel</Button>
          <Button positive onClick={saveList}>Save</Button>
        </Modal.Actions>
      </Modal>

    </AmplifyAuthenticator>
  );
}

export default App;
