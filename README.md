## redux-simple-actions

---

## API

### createActions

```javascript
import {createActions} from 'redux-simple-actions';

createActions('prefix', {
  fetchData(data) { 
    retrun data;
  },
  otherAction() {
  },
});

// or
createActions('prefix', ['loading', 'loaded'], {
  async fetchData() {
    await this.loading();
    const myResult = yield fetch('/ajax.json');
    await this.loaded();
    return myResult;
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
handleActions('prefix', {
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
@connect('prefix', 'prefix.data', 'prefix.loading') ||

// alias states
@connect({prefixData: 'prefix.data') ||

// add actions
@connect({ actions, routeActions }) ||

// add states and actions
@connect('prefix.data', { actions, routeActions }) ||

// alias states and actions
@connect({prefixData: 'prefix.data' }, { actions, routeActions })
class ExampleComponent extends Component {
  render() {
    return <div></div>;
  }
}
```