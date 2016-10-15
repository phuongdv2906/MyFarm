/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function TargetDb() {
    var self = this;
    self.DbCommon = new DBAccess();
    self.Db = self.DbCommon.getDB();
}
;
TargetDb.prototype.save = function (mode, item, _callback) {
    var self = this;
    if (mode === 'ADD') {
        self.DbCommon.insert(TBL_TARGET.name, item, _callback);
    } else if (mode === 'EDIT') {
        self.DbCommon.update(TBL_TARGET.name, item, _callback);
    }
};
TargetDb.prototype.delete = function (itemKey, _callback) {
    var self = this;
    self.DbCommon.delete(TBL_TARGET.name, itemKey, _callback);
};

TargetDb.prototype.getAllTargets = function (_callback) {
    var self = this;
    self.Db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ' + TBL_TARGET.name, [], function (tx, results) {
            _callback(results);
        }, null);
    });
};


