import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('sites', function() {
    this.route('legacy');
    this.route('site', {path:'/:id'}, function() {
      this.route('settings');
      this.route('groups');
      this.route('capabilities');
    });
  });

  this.route('signin');
});

export default Router;
