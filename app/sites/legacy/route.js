import Ember from 'ember';

export default Ember.Route.extend({
  sitesService: Ember.inject.service('sites'),
  session: Ember.inject.service(),

  queryParams: {
    'start': {refreshModel: true},
    'num': {refreshModel: true},
    'q': {refreshModel: true}
  },

  model (params) {
    return this.get('sitesService').searchOpenData(params.q, params.start, params.num);
  },
  afterModel(model){

  }
});
