import {
  request,
  expect,
  login,
  create,
} from '~/testInit';
import View from '@/models/View';
import ViewRole from '@/models/ViewRole';
import '@/models/ResourceField';
import ViewColumn from '../../src/models/ViewColumn';

let loginRes;

describe('routes: `/views`', () => {
  beforeEach(async () => {
    loginRes = await login();
  });
  afterEach(() => {
    loginRes = null;
  });
  describe('POST: `/views`', () => {
    it('Should response unauthorzied in case the user was not authorized.', async () => {
      const res = await request().post('/api/views');

      expect(res.status).equals(422);
      expect(res.body.message).equals('unauthorized');
    });

    it('Should `label` be required.', async () => {
      await create('resource');
      const res = await request()
        .post('/api/views')
        .set('x-access-token', loginRes.body.token);

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
      expect(res.body.errors).include.something.deep.equals({
        msg: 'Invalid value', param: 'label', location: 'body',
      });
    });

    it('Should `resource_name` be required.', async () => {
      await create('resource');
      const res = await request()
        .post('/api/views')
        .set('x-access-token', loginRes.body.token);

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
      expect(res.body.errors).include.something.deep.equals({
        msg: 'Invalid value', param: 'resource_name', location: 'body',
      });
    });

    it('Should `columns` be minimum limited', async () => {
      await create('resource');
      const res = await request()
        .post('/api/views', {
          label: 'View Label',
          columns: [],
        })
        .set('x-access-token', loginRes.body.token);

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
      expect(res.body.errors).include.something.deep.equals({
        msg: 'Invalid value', param: 'columns', location: 'body',
      });
    });

    it('Should `columns` be array.', async () => {
      await create('resource');
      const res = await request()
        .post('/api/views', {
          label: 'View Label',
          columns: 'not_array',
        })
        .set('x-access-token', loginRes.body.token);

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
      expect(res.body.errors).include.something.deep.equals({
        msg: 'Invalid value', param: 'columns', location: 'body',
      });
    });

    it('Should `roles.*.field` be required.', async () => {
      const resource = await create('resource');
      const res = await request()
        .post('/api/views')
        .send({
          resource_name: resource.name,
          label: 'View Label',
          roles: [{}],
        })
        .set('x-access-token', loginRes.body.token);

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
      expect(res.body.errors).include.something.deep.equals({
        msg: 'Invalid value', param: 'roles[0].field', location: 'body',
      });
    });

    it('Should `roles.*.comparator` be valid.', async () => {
      const resource = await create('resource');
      const res = await request().post('/api/views').send({
        resource_name: resource.name,
        label: 'View Label',
        roles: [{}],
      });

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');

      const paramsErrors = res.body.errors.map((error) => error.param);
      expect(paramsErrors).to.include('roles[0].comparator');
    });

    it('Should `roles.*.index` be number as integer.', async () => {
      const resource = await create('resource');
      const res = await request()
        .post('/api/views')
        .send({
          resource_name: resource.name,
          label: 'View Label',
          roles: [
            { index: 'not_numeric' },
          ],
        })
        .set('x-access-token', loginRes.body.token);

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
      expect(res.body.errors).include.something.deep.equals({
        value: 'not_numeric',
        msg: 'Invalid value',
        param: 'roles[0].index',
        location: 'body',
      });
    });

    it('Should response not found in case resource was not exist.', async () => {
      const res = await request()
        .post('/api/views')
        .send({
          resource_name: 'not_found',
          label: 'View Label',
          columns: ['amount', 'thumbnail', 'status'],
          roles: [{
            index: 1,
            field: 'amount',
            comparator: 'equals',
            value: '100',
          }],
        })
        .set('x-access-token', loginRes.body.token);

      expect(res.status).equals(404);
      expect(res.body.errors).include.something.that.deep.equals({
        type: 'RESOURCE_NOT_FOUND', code: 100,
      });
    });

    it('Should response the roles fields not exist in case role field was not exist.', async () => {
      const resource = await create('resource');
      await create('resource_field', { resource_id: resource.id, label_name: 'Amount' });

      const res = await request()
        .post('/api/views')
        .send({
          resource_name: resource.name,
          label: 'View Label',
          columns: ['amount', 'thumbnail', 'status'],
          roles: [{
            index: 1,
            field: 'price',
            comparator: 'equals',
            value: '100',
          }],
        })
        .set('x-access-token', loginRes.body.token);

      expect(res.body.errors).include.something.that.deep.equals({
        type: 'RESOURCE_FIELDS_NOT_EXIST', code: 100, fields: ['price'],
      });
    });

    it('Should response the columns not exists in case column was not exist.', async () => {
      const resource = await create('resource');
      const resourceField = await create('resource_field', {
        resource_id: resource.id, label_name: 'Amount', slug: 'amount',
      });
      const res = await request()
        .post('/api/views')
        .send({
          resource_name: resource.name,
          label: 'View Label',
          columns: ['amount', 'thumbnail', 'status'],
          roles: [{
            index: 1,
            field: 'price',
            comparator: 'equals',
            value: '100',
          }],
        })
        .set('x-access-token', loginRes.body.token);

      expect(res.body.errors).include.something.that.deep.equals({
        type: 'COLUMNS_NOT_EXIST',
        code: 200,
        columns: ['thumbnail', 'status'],
      });
    });

    it('Should save the given details of the view.', async () => {
      const resource = await create('resource');
      await create('resource_field', {
        resource_id: resource.id, label_name: 'Amount', slug: 'amount',
      });
      const res = await request()
        .post('/api/views')
        .send({
          resource_name: resource.name,
          label: 'View Label',
          columns: ['amount'],
          roles: [{
            index: 1,
            field: 'amount',
            comparator: 'equals',
            value: '100',
          }],
        })
        .set('x-access-token', loginRes.body.token);

      const storedView = await View.query().where('name', 'View Label').first();

      expect(storedView.name).equals('View Label');
      expect(storedView.predefined).equals(0);
      expect(storedView.resourceId).equals(resource.id);
    });

    it('Should save the given details of view fields that associated to the given view id.', async () => {
      const resource = await create('resource');
      const resourceField = await create('resource_field', {
        resource_id: resource.id, label_name: 'Amount', slug: 'amount',
      });

      const res = await request()
        .post('/api/views')
        .send({
          resource_name: resource.name,
          label: 'View Label',
          columns: ['amount'],
          roles: [{
            index: 1,
            field: 'amount',
            comparator: 'equals',
            value: '100',
          }],
        })
        .set('x-access-token', loginRes.body.token);
        
      const viewRoles = await ViewRole.query().where('view_id', res.body.id);

      expect(viewRoles.length).equals(1);
      expect(viewRoles[0].index).equals(1);
      expect(viewRoles[0].fieldId).equals(resourceField.id);
      expect(viewRoles[0].value).equals('100');
      expect(viewRoles[0].comparator).equals('equals');
    });

    it.only('Should save columns that associated to the given view.', async () => {
      const resource = await create('resource');
      const resourceField = await create('resource_field', {
        resource_id: resource.id, label_name: 'Amount', slug: 'amount',
      });

      const res = await request()
        .post('/api/views')
        .send({
          resource_name: resource.name,
          label: 'View Label',
          columns: ['amount'],
          roles: [{
            index: 1,
            field: 'amount',
            comparator: 'equals',
            value: '100',
          }],
        })
        .set('x-access-token', loginRes.body.token);

      const viewColumns = await ViewColumn.query().where('view_id', res.body.id);
      expect(viewColumns.length).equals(1);
    });
  });

  describe('POST: `/views/:view_id`', () => {
    it('Should `label` be required.', async () => {
      const view = await create('view');
      const res = await request().post(`/api/views/${view.id}`);

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');

      const paramsErrors = res.body.errors.map((error) => error.param);
      expect(paramsErrors).to.include('label');
    });

    it('Should columns be minimum limited', async () => {
      const view = await create('view');
      const res = await request().post(`/api/views/${view.id}`, {
        label: 'View Label',
        columns: [],
      });

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');

      const paramsErrors = res.body.errors.map((error) => error.param);
      expect(paramsErrors).to.include('columns');
    });

    it('Should columns be array.', async () => {
      const view = await create('view');
      const res = await request().post(`/api/views/${view.id}`, {
        label: 'View Label',
        columns: 'not_array',
      });

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');

      const paramsErrors = res.body.errors.map((error) => error.param);
      expect(paramsErrors).to.include('columns');
    });

    it('Should `roles.*.field` be required.', async () => {
      const view = await create('view');
      const res = await request().post(`/api/views/${view.id}`).send({
        label: 'View Label',
        roles: [{}],
      });

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');

      const paramsErrors = res.body.errors.map((error) => error.param);
      expect(paramsErrors).to.include('roles[0].field');
    });

    it('Should `roles.*.comparator` be valid.', async () => {
      const view = await create('view');
      const res = await request().post(`/api/views/${view.id}`).send({
        label: 'View Label',
        roles: [{}],
      });

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');

      const paramsErrors = res.body.errors.map((error) => error.param);
      expect(paramsErrors).to.include('roles[0].comparator');
    });

    it('Should `roles.*.index` be number as integer.', async () => {
      const view = await create('view');
      const res = await request().post(`/api/views/${view.id}`).send({
        label: 'View Label',
        roles: [{ index: 'not_numeric' }],
      });

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');

      const paramsErrors = res.body.errors.map((error) => error.param);
      expect(paramsErrors).to.include('roles[0].index');
    });

    it('Should response not found in case resource was not exist.', async () => {
      const res = await request().post('/api/views/100').send({
        label: 'View Label',
        columns: ['amount', 'thumbnail', 'status'],
        roles: [{
          index: 1,
          field: 'amount',
          comparator: 'equals',
          value: '100',
        }],
      });

      expect(res.status).equals(404);
    });

    it('Should response the roles fields not exist in case role field was not exist.', async () => {
      const view = await create('view');
      await create('resource_field', {
        resource_id: view.resource_id,
        label_name: 'Amount',
      });
      const res = await request().post(`/api/views/${view.id}`).send({
        label: 'View Label',
        columns: ['amount', 'thumbnail', 'status'],
        roles: [{
          index: 1,
          field: 'price',
          comparator: 'equals',
          value: '100',
        }],
      });

      expect(res.body.errors).include.something.that.deep.equals({
        type: 'RESOURCE_FIELDS_NOT_EXIST', code: 100, fields: ['price'],
      });
    });
  });

  describe('DELETE: `/views/:resource_id`', () => {
    it('Should not delete predefined view.', async () => {
      const view = await create('view', { predefined: true });
      const res = await request().delete(`/api/views/${view.id}`).send();

      expect(res.status).equals(400);
      expect(res.body.errors).include.something.that.deep.equals({
        type: 'PREDEFINED_VIEW', code: 200,
      });
    });

    it('Should response not found in case view was not exist.', async () => {
      const res = await request().delete('/api/views/100').send();

      expect(res.status).equals(404);
      expect(res.body.errors).include.something.that.deep.equals({
        type: 'VIEW_NOT_FOUND', code: 100,
      });
    });

    it('Should delete the given view and associated view columns and roles.', async () => {
      const view = await create('view', { predefined: false });
      await create('view_role', { view_id: view.id });
      await create('view_has_columns', { view_id: view.id });

      await request().delete(`/api/views/${view.id}`).send();

      const foundViews = await View.query().where('id', view.id).first();
      const foundViewRoles = await ViewRole.query().where('view_id', view.id).first();

      expect(foundViews).to.have.lengthOf(0);
      expect(foundViewRoles).to.have.lengthOf(0);
    });
  });
});