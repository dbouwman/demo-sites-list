import Ember from 'ember';

export default Ember.Service.extend({
  itemsService:Ember.inject.service('items-service'),
  session:Ember.inject.service('session'),
  ajax: Ember.inject.service(),
  lastAgoQuery:null,

  getById: function(id){
    let isAGO = this._isGuid(id);
    if(isAGO){
      return Ember.RSVP.hash({
        item: this.get('itemsService').getById(id),
        data: this.get('itemsService').getDataById(id)
      });
    }else{
      return this.getLegacySite(id);
    }
  },

  _isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
        stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  },

  searchAgo: function(query, start, num){
    let agoQuery = this.createAgoQuery(query, null, null, "Web Mapping Application", "webSite");
    let agoParams = {
      q: agoQuery,
      start: start,
      num: num,
      sortField: 'title'
    };
    // only if there is no query string, add the bbox
    if (!agoQuery) {
      agoParams.bbox = '-180,-90,180,90';
    }
    // if the query changes, reset the paging
    if (this.get('lastAgoQuery') !== agoQuery) {
      this.set('lastAgoQuery', agoQuery);
      // reset paging
      agoParams.start = 1;
    }
    return this.get('itemsService').search(agoParams);
  },

  searchOpenData: function(query, start, num){
    let orgId = this.get('session.portal.id');
    let url = 'https://opendataqa.arcgis.com/api/v2/sites';
    if(orgId){
      url = `https://opendataqa.arcgis.com/api/v2/organizations/${orgId}/sites`;
    }

    let params = [];
    if(query){
      params.push('q=' + query);
    }

    // start is the offset, so take that, and divide by the num
    let page = (Math.round(start / num) + 1);
    params.push('page[size]=' + num);
    params.push('page[number]=' + page);
    params.push('sort=title');

    // join params to the url
    url = url + '?' + params.join('&');

    return this.get('ajax').request(url)
    .then((jsonApiResults)=>{
      return this.jsonApiToAgoResults(jsonApiResults);
    })
  },

  getLegacySite: function(id){
    let url = `https://opendataqa.arcgis.com/api/v2/sites/${id}`;
    return this.get('ajax').request(url)
    .then((jsonApiResults)=>{
      return this.jsonApiSiteToSiteItem(jsonApiResults);
    })
  },

  /**
   * Convert a json api site object into a Site-Item
   */
  jsonApiSiteToSiteItem: function(jsonApi){
    let site = {
      item: {
        title: jsonApi.data.attributes.title,
        url: jsonApi.data.attributes.url,
        id: jsonApi.data.id
      },
      data: {
        values: jsonApi.data.attributes
      }
    };
    return site;
  },

  jsonApiToAgoResults: function( jsonApi ){
    let start = ((jsonApi.meta.queryParameters.page.number -1) * jsonApi.meta.queryParameters.page.size) + 1;
    let itemResults = {
      start:  start,
      total:  jsonApi.meta.stats.totalCount,
      num:    jsonApi.meta.stats.count
    };
    itemResults.results = jsonApi.data.map((site) => {
      site.attributes.id = parseInt(site.id);
      return site.attributes;
    });
    return itemResults;
  },

  createAgoQuery: function (query, owner, tags, type, typeKeywords) {
    Ember.debug(`Query ${query} owner ${owner} tags ${tags} type ${type} typeKeywords ${typeKeywords}`);
    let parts = [];
    if (query) {
      parts.push(query);
    }

    if (owner) {
      parts.push('owner:' + owner);
    }

    if (tags) {
      if (tags.indexOf(',')) {
        let ta = tags.split(',');
        ta.map(function (t) {
          parts.push('tags:' + t);
        });
      } else {
        parts.push('tags:' + tags);
      }
    }

    if (typeKeywords) {
      if (typeKeywords.indexOf(',')) {
        let ta = typeKeywords.split(',');
        ta.map(function (t) {
          parts.push('typekeywords:' + t);
        });
      } else {
        parts.push('typekeywords:' + typeKeywords);
      }
    }

    if (type) {
      parts.push('type:"' + type + '"');
    }

    // if the user is authenticated, add the orgid to limit scope to their org
    if (this.get('session.isAuthenticated')) {
      let orgid = this.get('session.portal.id');
      Ember.debug('User is member of ' + orgid + ' scoping search to this org.');
      parts.push(`orgid:"${orgid}"`);
    }

    Ember.debug('parts: ' + JSON.stringify(parts));
    let agoQuery = parts.join(' AND ');
    Ember.debug('AGO Query: ' + agoQuery);

    return agoQuery;
  },

});
