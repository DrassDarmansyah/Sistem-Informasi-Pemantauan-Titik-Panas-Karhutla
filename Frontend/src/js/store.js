export const Store = {
  user: null,

  setUser(user) {
    this.user = user;
  },

  getUser() {
    return this.user;
  },

  isLoggedIn() {
    return !!this.user;
  },

  isOperator() {
    return this.user && this.user.role === 'operator';
  },

  clear() {
    this.user = null;
  }
};