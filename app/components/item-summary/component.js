import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,

  session: Ember.inject.service(),

  classNames:['item-summary'],


  /**
   * Create the Thumbnail Url, with a fallback
   */
  thumbnailUrl : Ember.computed('model.thumbnail', function(){
    if(this.get('model.thumbnail')){
      let portalBaseUrl = this.get('session.portalHostName');
      let thumb = this.get('model.thumbnail');
      let itemId = this.get('model.id');
      let url = `https://${portalBaseUrl}/sharing/rest/content/items/${itemId}/info/${thumb}`;

      // if the item is not public, the image will require a token on the url
      if(this.get('model.access') !== 'public'){
        url = url + '?token=' + this.get('session.token');
      }
      return  url;
    }else{
      return `/assets/images/default-item-thumb.png`;
    }
  }),


});
