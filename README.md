## redux-simple-actions

---

## API

### createActions

```javascript
import {createActions} from 'redux-simple-actions';

// simple action keys
createActions('context', ['fetchData', 'otherAction']);

// or
createActions('context', {
  fetchData(data) { 
    retrun data;
  },
  otherAction() {
  },
});

// or
createActions('context', {
  async fetchData(arg1, arg2) {
    const {dispatch, done} = this;
    await dispatch('loading');
    const myResult = yield fetch('/ajax.json');
    await dispatch('loaded');
    done(myResult);
  },
  otherAction() {},
});

```

### handleActions

```javascript
import {handleActions} from 'redux-simple-actions';

const initialState = {
  loading: false,
  data: null,
};
handleActions('context', {
  fetchData(state, action) { 
    return {...state, data: action.payload};
  },
  loading(state) {
    return {...state, loading: true};
  },
  loaded(state) {
    return {...state, loading: false};
  }
}, initialState);
```

### connect

```javascript
import { connect } from 'redux-simple-actions';
import { routeActions } from 'react-router-redux';
import * as actions from '../actions';

// add states
@connect('context', 'context.data', 'context.loading') ||

// alias states
@connect({contextData: 'context.data') ||

// add actions
@connect({ actions, routeActions }) ||

// add states and actions
@connect('context.data', { actions, routeActions }) ||

// alias states and actions
@connect({contextData: 'context.data' }, { actions, routeActions })
class ExampleComponent extends Component {
  render() {
    return <div></div>;
  }
}
```