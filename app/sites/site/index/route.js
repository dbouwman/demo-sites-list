import Ember from 'ember';

export default Ember.Route.extend({
  model(){
    let model = this.modelFor('sites.site');
    return model;
  }
});
