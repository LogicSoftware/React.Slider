const util = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = util.TextEncoder;
}

global.requestAnimationFrame = global.requestAnimationFrame || function _raf(cb) {
  return setTimeout(cb, 0);
};

const Enzyme = require('enzyme');
const Adapter = require('@cfaester/enzyme-adapter-react-18').default;
const { flushSync } = require('react-dom');

Enzyme.configure({ adapter: new Adapter() });

// Enzyme 3.x's ReactWrapper.setState does not wrap the instance setState call in
// act(), so React 18's concurrent scheduler defers the update and the wrapper
// sees stale state. Patch it to use flushSync so updates are committed before
// assertions run.
const ReactWrapper = Enzyme.ReactWrapper;
const _setState = ReactWrapper.prototype.setState;
ReactWrapper.prototype.setState = function patchedSetState(state, callback) {
  flushSync(() => {
    this.instance().setState(state);
  });
  this.update();
  if (typeof callback === 'function') {
    callback.call(this.instance());
  }
  return this;
};
