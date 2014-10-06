"use strict";

var _ = mori;

function Mort(data, config) {
  this.data = data;
  this.config = config;
  this.api = {
    state: {
      back: function() {
        this.state.point--;
        if (this.state.point < 0) this.state.point = 0;
        this.notify();
      }.bind(this),
      fwd: function() {
        this.state.point++;
        if (this.state.point >= _.count(this.state.history)) this.state.point = _.count(this.state.history) - 1;
        this.notify();
      }.bind(this)
    }
  };
  this.state = {
    history: _.vector(data),
    point: 0,
    notifyFn: function () {
    }
  }
}

Mort.prototype.updateState = function(nextState, notify) {
  this.state.history = _.conj(
    this.state.history,
    nextState
  );
  this.state.point++;
  if (notify !== false) this.notify();
  return nextState;
};

Mort.prototype.getData = function() {
  return _.get(this.state.history, this.state.point);
};

Mort.prototype.get = function(path, id) {
  var
    data = this.getData(),
    v, idx;

  v = _.get_in(data, path);
  if (!v) {
    data = this.updateState(_.assoc_in(data, path, _.hash_map()), false);
    return null;
  }
  return _.get_in(data, path.concat([id]));
};

Mort.prototype.getIndexById = function(id, v) {
  return this.getIndexBy(function(a, b) {
    return _.get(a, 'id') === id ? b : null;
  }, id, v);
};

Mort.prototype.getIndexBy = function(f, id, v) {
  return _.pipeline(v,
    function(v) { return _.map(f, v, _.range(_.count(v))); },
    function(v) { return _.filter(function(n) { return n !== null }, v); },
    _.first
  );
};

Mort.prototype.addModule = function(name, methodFn, backend) {
  if (this.api[name]) throw Exception('Method exists.');
  this.api[name] = methodFn(this, backend);
  return this;
};

Mort.prototype.setNotifyFn = function(f) {
  this.state.notifyFn = f;
  return this;
};

Mort.prototype.notify = function() {
  this.state.notifyFn();
};
