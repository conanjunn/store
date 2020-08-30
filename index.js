function Store(originData, opt) {
  this.cb = opt.callback || function(mutationName, ret, changeInfo) {
    console.log(mutationName, ret, changeInfo);
  };
  this.state = Object.create(null);
  this._mutation = opt.mutation || {};
  this.mutation = {};
  this._getter = opt.getter || {};
  this.getter = {};
  this.bindFn(this.state, originData, 'state');
  this.observeMutation();
  this.observeGetter();
}

Store.prototype.observeGetter = function() {
  var _this = this;
  Object.keys(_this._getter).forEach(function(item) {
    Object.defineProperty(_this.getter, item, {
      enumerable: true,
      get: _this._getter[item].bind(_this)
    });
  });
};

Store.prototype.observeMutation = function() {
  var _this = this;
  Object.keys(_this._mutation).forEach(function(item) {
    Object.defineProperty(_this.mutation, item, {
      value: function() {
        var ret = null;
        var args = Array.prototype.slice.call(arguments);
        _this.mutationing = item;
        _this.changeInfo = [];
        try {
          ret = _this._mutation[item].apply(_this, args);
        } catch (error) {
          throw error;
        } finally {
          if (_this.changeInfo.length) {
            var name = _this.mutationing;
            _this.mutationing = null;
            _this.cb(name, ret, _this.changeInfo);
          }
          _this.changeInfo = [];
        }
      }
    });
  });
};

Store.prototype.observeArray = function(proxy, pathStr, key) {
  var _this = this;
  var originArr = [];
  ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function(item) {
    Object.defineProperty(originArr, item, {
      value: function() {
        var cloneArr = _this.deepClone(this);
        var args = Array.prototype.slice.call(arguments);
        Array.prototype[item].apply(cloneArr, args);
        var newArr = _this.observeArray(proxy, pathStr, key);
        proxy[key] = _this.bindFn(newArr, cloneArr, pathStr + '.' + key);
      },
    });
  });
  return originArr;
};

Store.prototype.typeCheck = function(val) {
  if (val instanceof Array) {
    return 'array';
  }
  return (typeof val).toLowerCase();
};

Store.prototype.bindFn = function(proxy, originData, pathStr) {
  var _this = this;
  Object.keys(originData).forEach(function(key) {
    var val = originData[key];
    // state用来存储代理的值
    var state = null;
    if (_this.typeCheck(val) === 'array') {
      state = _this.observeArray(proxy, pathStr, key);
    } else if (typeof val === 'object') {
      state = Object.create(null);
    } else {
      state = val;
    }
    Object.defineProperty(proxy, key, {
      enumerable: true,
      get: function() {
        return state;
      },
      set: function(v) {
        if (!_this.mutationing) {
          throw new Error('不允许直接修改state,或在mutation里异步修改state');
        }
        if (v === state) {
          return;
        }
        var oldVal = state;
        if (_this.typeCheck(v) === 'object') {
          state = _this.bindFn(Object.create(null), v, pathStr + '.' + key);
        } else if (_this.typeCheck(v) === 'array') {
          state = _this.bindFn([], v, pathStr + '.' + key);
        } else {
          state = v;
        }
        _this.changeInfo.push({
          path: pathStr + '.' + key,
          value: state,
          oldValue: oldVal
        });
      }
    });
    var type = _this.typeCheck(val);
    if (type === 'object' || type === 'array') {
      _this.bindFn(proxy[key], val, pathStr + '.' + key);
    }
  });
  if (_this.typeCheck(proxy) === 'object') {
    Object.seal(proxy);
  }
  return proxy;
};

Store.prototype.deepClone = function(data) {
  var t = this.typeCheck(data);
  var o;
  var _this = this;
  if (t === 'array') {
    o = [];
  } else if (t === 'object') {
    o = {};
  } else {
    return data;
  }

  if (t === 'array') {
    for (var i = 0, ni = data.length; i < ni; i++) {
      o.push(_this.deepClone(data[i]));
    }
    return o;
  } else if (t === 'object') {
    Object.keys(data).forEach(function(key) {
      o[key] = _this.deepClone(data[key]);
    });
    return o;
  }
};

module.exports = Store;
