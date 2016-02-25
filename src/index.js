import { handleActions as reduxHandleActions } from 'redux-actions';
// import reduceReducers from 'reduce-reducers';
import { connect as reduxConnect } from 'react-redux';
import { mapValues } from '../utils';
const _allActionKeys = [];
const _allReducerKeys = [];
const simpleFn = (...args) => args.length > 1 ? args : args[0];
/**
 * redux actions creator
 * @param {string} prefix
 * @param {array?} simpleActions
 * @param {object} actions
 * @returns {object}
 * @example
 *    createActions('prefix', {
 *      act1() { },
 *      act2() { },
 *    });
 *    // or
 *    createActions('prefix', ['loading', 'loaded'], {
 *      act1() { },
 *      act2() { },
 *    });
 *    // or
 *    createActions('prefix', ['loading', 'loaded'], {
 *      async act1() {
 *        await this.loading();
 *        const myResult = yield fetch('/ajax.json');
 *        await this.loaded();
 *        return myResult;
 *      },
 *      act2() { },
 *    });
 */
export function createActions(prefix, simpleActions, actions = {}) {
  if (typeof prefix !== 'string') throw new Error('CreateActions need prefix.');
  let _actions = actions;
  let _simpleActions = simpleActions;
  if (!Array.isArray(simpleActions)) {
    _actions = simpleActions;
    _simpleActions = [];
  }
  _simpleActions.forEach((key) => {
    _actions[key] = simpleFn;
  });
  return mapValues(_actions, (fn, key) => {
    const type = prefix + '.' + key;
    _allActionKeys.push(type);
    return function actionWrap(...args) {
      let payload = fn.apply(this, args);
      // paylod toPromise
      if (!payload || ! typeof payload.then === 'function') {
        payload = Promise.resolve(payload);
      }
      const action = { type, payload};
      if (args.length === 1 && args[0] instanceof Error) {
        action.error = true;
      }
      return action;
    };
  });
}
/**
 * redux reducer creator
 * @param {string} prefix
 * @param {object} actions
 * @param {*} initialState
 * @returns {object}
 * @example
 *    const initialState = {};
 *    handleActions('myState', {
 *      act1(state, action) { return state;},
 *      act2(state, action) { return state;},
 *    }, initialState);
 */
export function handleActions(prefix, actions, initialState) {
  if (typeof prefix !== 'string') throw new Error('handleActions need a store name!');
  const reducers = {};
  mapValues(actions, (action, key) => {
    const reducerWrap = function (state, _act) {
      // todo: Reject error to reducer
      if (_act && _act.error) return state;
      return action.apply(this, arguments);
    };
    reducers[prefix + '.' + key] = reducerWrap;
    _allReducerKeys.push(prefix + '.' + key);
  });
  return reduxHandleActions(reducers, initialState);
}

/**
 * redux connnect
 *
 * @param {string|object} state
 * @param {object?} actions
 * @returns {React.Component}
 * @example
 *      import { routeActions } from 'react-router-redux';
 *      import * as projectActions from '../actions/projects';
 *
 *      // add states
 *      @connect('projects.data', 'projects.otherData') ||
 *      // alias states
 *      @connect({project: 'projects', otherData: 'projects.otherData'}) ||
 *      // add actions
 *      @connect({ projectActions, routeActions }) ||
 *      // add states and actions
 *      @connect('projects.data', 'projects.otherData', { projectActions, routeActions }) ||
 *      // alias states and actions
 *      @connect({project: 'projects', otherData: 'projects.otherData'}, { projectActions, routeActions })
 *      class ExampleComponent extends Component {
 *        render() {
 *          return <div></div>;
 *        }
 *      }
 */
export function connect(...states) {
  let actions = typeof states[states.length - 1] !== 'string' ? states.pop() : {};
  if (typeof actions[Object.keys(actions)[0]] === 'string') {
    states.push(actions);
    actions = {};
  }
  return function (Component) {
    function mapStateToProps(state) {
      const props = {};
      /**
       * @param {string} keyPath - like 'a.b.c'
       * @param {string?} aliasName
       */
      function addToProps(keyPath, aliasName) {
        const keyArr = keyPath.split('.');
        let key = keyArr.shift();
        let value = state[key];
        while (keyArr.length > 0) {
          key = keyArr.shift();
          if (typeof value !== 'object') {
            throw new Error(`[store connect error] Unknown store path: "${keyPath}"`);
          }
          value = value[key];
        }
        props[aliasName || key] = value;
      }
      states.forEach(keyPath => {
        if (typeof keyPath === 'string') {
          addToProps(keyPath);
        } else {
          mapValues(keyPath, (_keyPath, aliasName) => {
            addToProps(_keyPath, aliasName);
          });
        }
      });
      return props;
    }

    function mapDispatchToProps(dispatch) {
      const props = {};
      Object.keys(actions).forEach(key => {
        const ctx = {};
        props[key] = mapValues(actions[key], (act) => {
          if (typeof act !== 'function') return act;
          return (...args) => dispatch(act.apply(ctx, args));
        }, ctx);
      });
      return props;
    }
    return reduxConnect(
      mapStateToProps,
      mapDispatchToProps
    )(Component);
  };
}
/**
 * check action match reducer
 */
export function checkActionKeys() {
  const unknownActions = [];
  const unknownReducers = [];
  _allActionKeys.forEach((key) => {
    if (_allReducerKeys.indexOf(key) === -1) {
      unknownActions.push(key);
    }
  });
  _allReducerKeys.forEach((key) => {
    if (_allActionKeys.indexOf(key) === -1) {
      unknownReducers.push(key);
    }
  });
  if (unknownActions.length !== 0) {
    console.error('UnMatched actions: ', unknownActions.join(', '));
  }
  if (unknownReducers.length !== 0) {
    console.error('UnMatched reducers: ', unknownReducers.join(', '));
  }
}
