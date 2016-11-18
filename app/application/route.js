import Ember from 'ember';
import ENV from '../config/environment';
export default Ember.Route.extend({

  beforeModel() {
    
    return this._initSession();
  },
  _initSession () {
  return this.get('session').fetch()
    .then(() => {
      Ember.debug('User has been automatically logged in... ');
    })
    .catch(() => {
      Ember.debug('No cookie was found, user is anonymous... ');
    });
},

  actions: {
    accessDenied: function () {
      this.transitionTo('signin');
    },
    signout: function () {
      // depending on the type of auth, we need to do different things
      if (ENV.torii.providers['arcgis-oauth-bearer'].display && ENV.torii.providers['arcgis-oauth-bearer'].display === 'iframe') {
        // redirect the window to the signout url
        window.location = this.get('session.signoutUrl');
      } else {
        this.get('session').close();
      }
    }
  }
});
