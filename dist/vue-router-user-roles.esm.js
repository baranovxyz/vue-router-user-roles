/*!
 * vue-router-user-roles v0.1.8 
 * (c) 2018 Anthony Gore
 * Released under the MIT License.
 */
import Vue from 'vue';

var RouteProtect = function RouteProtect (router) {
  this.router = router;
  this.vm = new Vue({
    data: {
      user: null
    }
  });
};
RouteProtect.prototype.get = function get () {
  if (!this.vm.user) {
    throw new Error("Attempt to access user before being set");
  }
  return this.vm.user;
};
RouteProtect.prototype.set = function set (user) {
    var this$1 = this;

  this.vm.user = user;
  if (this.to && this.to.meta.permissions) {
    var matched = this.to.meta.permissions.find(function (item) { return item.role === this$1.vm.user.role; });
    if (matched) {
      if ((typeof matched.access === "boolean" && !matched.access) || matched.access(this.vm.user, this.to)) {
        this.router.push({ name: matched.redirect });
      }
    }
  }
};
RouteProtect.prototype.resolve = function resolve (to, from, next) {
    var this$1 = this;

  this.to = to;
  if (to.meta.permissions) {
    var matched = to.meta.permissions.find(function (item) { return item.role === this$1.vm.user.role; });
    if (matched) {
      if (typeof matched.access === "boolean") {
        matched.access ? next() : next({ name: matched.redirect });
      } else {
        matched.access(this.vm.user, to) ? next() : next({ name: matched.redirect });
      }
    } else {
      next();
    }
  } else {
    next();
  }
};

function plugin (Vue$$1, opts) {
  if (!opts.router) {
    throw new Error("You must supply a router instance in the options.");
  }
  var rp = new RouteProtect(opts.router);
  Vue$$1.prototype.$user = rp;
  opts.router.beforeEach(function (to, from, next) { return rp.resolve(to, from, next); });
}

plugin.version = "0.1.8";

if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(plugin);
}

export default plugin;
