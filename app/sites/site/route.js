import Ember from 'ember';

export default Ember.Route.extend({
  sitesService: Ember.inject.service('sites'),
  model(params){
    return this.get('sitesService').getById(params.id);
  }
});
