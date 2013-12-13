angular.module('LocalStorageModule').value('prefix', 'ut');

var storage = angular.module('ut.backend.storage', ['LocalStorageModule']);

storage.factory(
    'storageService', ['localStorageService',
                 function (localStorageService) {

            var IDS_POSTFIX = "_ids";

            var digest = function (entity) {
                return {
                    id: entity.id,
                    name: entity.name
                };
            };

            var entityDigestsKey = function (entityName) {
                return entityName + IDS_POSTFIX;
            };

            var getEntityDigests = function (entityName) {
                return angular.fromJson(localStorageService.get(entityDigestsKey(entityName)));
            };

            var setEntityDigests = function (entityName, ids) {
                localStorageService.set(entityDigestsKey(entityName), angular.toJson(ids));

            };

            var newId = function (entityName) {
                var ids = _(getEntityDigests(entityName) || [])
                    .map(function (x) {
                        return x.id;
                    }).value();

                var result = ids.length ? _.max(ids) + 1 : 0;
                return result + 1;
            }

            var entityKey = function (entityName, id) {
                return entityName + "_" + (id || newId(entityName));
            }

            var load = function (entityName, id) {
                return angular.fromJson(
                    localStorageService.get(
                        entityKey(entityName, id)));
            };

            var writeLock = false;

            var save = function (entityName, entity) {

                if (writeLock) {
                    throw "!";
                }

                writeLock = true;

                if (!entity.id) {
                    entity.id = newId(entityName);
                    var digests = getEntityDigests(entityName) || [];
                    digests.push(digest(entity));
                    setEntityDigests(entityName, digests);
                }

                localStorageService.set(entityKey(entityName, entity.id), entity);

                writeLock = false;

                return entity;
            };

            var list = function (entityName) {
                return getEntityDigests(entityName);
            };

            return {
                load: load,
                save: save,
                list: list
            };
}]);