import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['start', 'num', 'q'],
  start: 1,
  q: null,
  num: 10,

  totalCount: Ember.computed('model.total', function () {
    return this.get('model.total');
  }),


  actions: {
    filter () {
      //this.set('q', this.get('query'));
      // reset the page
      this.set('start', 1);
      this.transitionToRoute('sites.legacy');
    },
  }
});
