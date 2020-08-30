const Store = require('../index.js');

const store = new Store({
  a: 1,
  b: [1, 2, 3],
  c: {
    cc: {
      ccc: 4
    }
  },
  d: [{
    d1: 1,
    d2: 2,
    d3: 3
  }]
}, {
  mutation: {
    push() {
      this.state.b.push(1);
      return 1;
    },
    modifyPush() {
      this.state.b[3] = 4;
    },
    modifyA() {
      this.state.a = 3;
    },
    modifyC() {
      this.state.c.cc.ccc = 666;
    },
    modifyCC() {
      this.state.c = {
        aa: 1
      };
    },
    modifyCCC() {
      this.state.c.aa = 666;
    },
    modifyD() {
      this.state.d[0].d1 = 5;
    },
    dPush() {
      this.state.d.push({
        d1: 4,
        d2: 5,
        d3: 6
      });
    },
    modifyDd() {
      this.state.d = [{ d1: 5 }, { d1: 8 }];
    },
    dobble() {
      this.state.d[1].d1 = 888;
      this.state.d[0].d1 = 888;
    }
  }
});


store.mutation.modifyC();
store.mutation.modifyCC();
store.mutation.modifyCCC();
console.log(JSON.stringify(store.state.c));
store.mutation.push();
store.mutation.modifyPush();
console.log(JSON.stringify(store.state.b));
