"use strict";

var request = require('supertest');
var sinon = require('sinon').sandbox.create();

var beans = require('../configureForTest').get('beans');
var groupsPersistence = beans.get('groupsPersistence');
var membersPersistence = beans.get('membersPersistence');
var sympa = beans.get('sympaStub');

var createApp = require('../testHelper')('groupsApp').createApp;

describe('Groups application', function () {

  before(function (done) {
    sinon.stub(sympa, 'getAllAvailableLists', function (callback) {
      return callback(null, ['GroupA']);
    });

    sinon.stub(sympa, 'getUsersOfList', function (groupname, callback) {
      if (groupname === 'groupa') {
        return callback(null, ['peter@google.de', 'hans@aol.com']);
      }
      callback(null, []);
    });

    sinon.stub(membersPersistence, 'list', function (sortorder, callback) {
      callback(null, null);
    });

    sinon.stub(membersPersistence, 'listByField', function (email, sortOrder, callback) {
      callback(null, [
        { firstname: 'Hans', lastname: 'Dampf' },
        { firstname: 'Peter', lastname: 'Meyer' }
      ]);
    });

    sinon.stub(groupsPersistence, 'listByIds', function (list, sortOrder, callback) {
      if (list[0] === 'GroupA') {
        return callback(null, [
          {id: 'GroupA', longName: 'Gruppe A', description: 'Dies ist Gruppe A.', type: 'Themengruppe', emailPrefix: 'Group-A'}
        ]);
      }
      return callback(null, []);
    });

    sinon.stub(groupsPersistence, 'getById', function (list, callback) {
      if (list.test('GroupA')) {
        return callback(null,
          {id: 'GroupA', longName: 'Gruppe A', description: 'Dies ist Gruppe A.', type: 'Themengruppe', emailPrefix: 'Group-A'});
      }
      return callback(null, null);
    });

    done();
  });

  after(function (done) {
    sinon.restore();
    done();
  });

  it('shows all available lists', function (done) {
    request(createApp())
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/Gruppen/)
      .expect(/Gruppe A/, done);
  });

  it('returns false for checkgroupname when the group name already exists', function (done) {
    request(createApp())
      .get('/checkgroupname?id=GroupA')
      .expect(200)
      .expect(/false/, done);
  });

  it('returns true for checkgroupname when the group name does not exist', function (done) {
    request(createApp())
      .get('/checkgroupname?id=UnknownGroup')
      .expect(200)
      .expect(/true/, done);
  });

  it('allows dashes and underscores in the groupname', function (done) {
    request(createApp())
      .get('/checkgroupname?id=Un_known-Group')
      .expect(200)
      .expect(/true/, done);
  });

  it('displays an existing group and membercount', function (done) {
    request(createApp())
      .get('/GroupA')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/<title>Gruppe A/)
      .expect(/Dies ist Gruppe A./)
      .expect(/Themengruppe/)
      .expect(/Mitglieder:/)
      .expect(/Diese Gruppe hat&nbsp;2 Mitglieder./, function (err) {
        done(err);
      });
  });
});
